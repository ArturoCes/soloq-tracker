import { prisma } from "@/lib/db";
import {
  getAccountByRiotId,
  getLeagueEntriesByPuuid,
  getMatchById,
  getMatchIdsByPuuid,
  getSummonerByPuuid,
  RiotApiError,
} from "./client";
import { rankValue } from "./regions";
import type { RiotMatchDto } from "./types";

const RANKED_SOLO_QUEUE = "RANKED_SOLO_5x5";
const MATCH_LOOKBACK_DAYS = 30;
// Safety cap so a single very active player can't blow up one update run's API budget.
const MAX_MATCHES_PER_UPDATE = 100;

/** Ensures the site owner's own account exists as a Player row flagged isUnofficial. */
export async function ensureUnofficialPlayer() {
  const gameName = process.env.UNOFFICIAL_GAME_NAME;
  const tagLine = process.env.UNOFFICIAL_TAG_LINE;
  const platform = process.env.UNOFFICIAL_PLATFORM;
  if (!gameName || !tagLine || !platform) return;

  const existing = await prisma.player.findFirst({ where: { isUnofficial: true } });
  if (existing) return;

  await prisma.player.create({
    data: { gameName, tagLine, platform, puuid: `pending-${crypto.randomUUID()}`, isUnofficial: true },
  });
}

type SnapshotResult = { ok: true } | { ok: false; endpoint: string; message: string; statusCode?: number };

async function updateOnePlayer(
  playerId: string,
  updateLogId: string
): Promise<SnapshotResult> {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });

  try {
    // Resolve puuid if we don't have a real one yet (freshly added player).
    let puuid = player.puuid;
    if (puuid.startsWith("pending-")) {
      const account = await getAccountByRiotId(player.gameName, player.tagLine, player.platform);
      puuid = account.puuid;
    }

    const [summoner, leagueEntries] = await Promise.all([
      getSummonerByPuuid(puuid, player.platform),
      getLeagueEntriesByPuuid(puuid, player.platform),
    ]);

    const soloQueue = leagueEntries.find((e) => e.queueType === RANKED_SOLO_QUEUE);

    const startTime = Math.floor((Date.now() - MATCH_LOOKBACK_DAYS * 24 * 60 * 60 * 1000) / 1000);
    const matchIds = await getMatchIdsByPuuid(puuid, player.platform, {
      count: MAX_MATCHES_PER_UPDATE,
      startTime,
    });
    const matches: RiotMatchDto[] = [];
    for (const matchId of matchIds) {
      const match = await getMatchById(matchId, player.platform);
      matches.push(match);
    }

    const participantEntries = matches
      .map((match) => {
        const participant = match.info.participants.find((p) => p.puuid === puuid);
        return participant ? { match, participant } : null;
      })
      .filter((entry): entry is { match: (typeof matches)[number]; participant: (typeof matches)[number]["info"]["participants"][number] } => entry !== null);

    const roleCounts = new Map<string, number>();
    let kdaSum = 0;
    for (const { participant: p } of participantEntries) {
      if (p.teamPosition) {
        roleCounts.set(p.teamPosition, (roleCounts.get(p.teamPosition) ?? 0) + 1);
      }
      kdaSum += (p.kills + p.assists) / Math.max(1, p.deaths);
    }
    const mainRole = [...roleCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const avgKda = participantEntries.length > 0 ? kdaSum / participantEntries.length : null;

    const newTier = soloQueue?.tier ?? "UNRANKED";
    const newDivision = soloQueue?.rank ?? null;
    const newLp = soloQueue?.leaguePoints ?? 0;
    const newValue = rankValue(newTier, newDivision, newLp);
    const previousValue =
      player.tier != null
        ? rankValue(player.tier, player.rankDivision, player.previousLp ?? player.leaguePoints)
        : null;

    // Keep the transaction limited to the two fast, atomic writes. Match history can run into
    // the hundreds of rows and upserting them all inside one transaction risks hitting Prisma's
    // interactive transaction timeout, so those go outside as independent, idempotent upserts.
    await prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { id: player.id },
        data: {
          puuid,
          summonerId: summoner.id ?? null,
          profileIconId: summoner.profileIconId,
          tier: newTier,
          rankDivision: newDivision,
          leaguePoints: newLp,
          wins: soloQueue?.wins ?? 0,
          losses: soloQueue?.losses ?? 0,
          previousLp: player.leaguePoints,
          previousRankValue: player.tier != null ? rankValue(player.tier, player.rankDivision, player.leaguePoints) : null,
          mainRole,
          avgKda,
        },
      });

      await tx.lpHistory.create({
        data: {
          playerId: player.id,
          tier: newTier,
          rankDivision: newDivision,
          leaguePoints: newLp,
          wins: soloQueue?.wins ?? 0,
          losses: soloQueue?.losses ?? 0,
          delta: previousValue != null ? newValue - previousValue : 0,
          updateLogId,
        },
      });
    });

    for (const { match, participant: p } of participantEntries) {
      const matchFields = {
        champion: p.championName,
        win: p.win,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        role: p.teamPosition || null,
        lane: p.lane || null,
        queueId: match.info.queueId,
        gameCreation: new Date(match.info.gameCreation),
        pentaKills: p.pentaKills,
        quadraKills: p.quadraKills,
        tripleKills: p.tripleKills,
        doubleKills: p.doubleKills,
        totalDamageDealtToChamps: p.totalDamageDealtToChampions,
        visionScore: p.visionScore,
        goldEarned: p.goldEarned,
      };
      await prisma.matchHistory.upsert({
        where: { playerId_matchId: { playerId: player.id, matchId: match.metadata.matchId } },
        update: matchFields,
        create: { playerId: player.id, matchId: match.metadata.matchId, ...matchFields },
      });
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const endpoint = err instanceof RiotApiError ? err.endpoint : "unknown";
    const statusCode = err instanceof RiotApiError ? err.statusCode : undefined;

    await prisma.apiError.create({
      data: { updateLogId, playerId: player.id, endpoint, statusCode, message },
    });

    return { ok: false, endpoint, message, statusCode };
  }
}

export type UpdateSummary = {
  updateLogId: string;
  playersUpdated: number;
  playersFailed: number;
  status: "success" | "partial" | "error";
};

/** The "Actualizar clasificación" flow: refresh every active player from the Riot API. */
export async function runFullUpdate(): Promise<UpdateSummary> {
  await ensureUnofficialPlayer();

  const updateLog = await prisma.updateLog.create({ data: {} });
  const players = await prisma.player.findMany({ where: { isActive: true } });

  let updated = 0;
  let failed = 0;

  for (const player of players) {
    const result = await updateOnePlayer(player.id, updateLog.id);
    if (result.ok) updated++;
    else failed++;
  }

  const status: UpdateSummary["status"] =
    failed === 0 ? "success" : updated === 0 ? "error" : "partial";

  await prisma.updateLog.update({
    where: { id: updateLog.id },
    data: { finishedAt: new Date(), playersUpdated: updated, playersFailed: failed, status },
  });

  return { updateLogId: updateLog.id, playersUpdated: updated, playersFailed: failed, status };
}
