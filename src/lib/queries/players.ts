import { prisma } from "@/lib/db";
import { rankValue } from "@/lib/riot/regions";
import { winrate } from "@/lib/ranks";

export type LeaderboardEntry = Awaited<ReturnType<typeof getLeaderboard>>[number];

export async function getLeaderboard() {
  const players = await prisma.player.findMany({
    where: { isActive: true },
    include: {
      lpHistory: { orderBy: { capturedAt: "desc" }, take: 1 },
    },
  });

  const withRank = players.map((player) => ({
    ...player,
    rankVal: rankValue(player.tier ?? "UNRANKED", player.rankDivision, player.leaguePoints),
    delta: player.lpHistory[0]?.delta ?? 0,
    winratePct: winrate(player.wins, player.losses),
  }));

  withRank.sort((a, b) => b.rankVal - a.rankVal || a.displayOrder - b.displayOrder);

  return withRank;
}

export async function getPlayerById(id: string) {
  return prisma.player.findUnique({
    where: { id },
    include: {
      lpHistory: { orderBy: { capturedAt: "desc" }, take: 30 },
      matches: { orderBy: { gameCreation: "desc" }, take: 20 },
    },
  });
}

export type HeadToHeadMatch = {
  matchId: string;
  gameCreation: Date;
  sameTeam: boolean;
  championA: string;
  championB: string;
  aWin: boolean;
  bWin: boolean;
};

/** Finds ranked matches where both players appear (as teammates or opponents) and tallies the results. */
export async function getHeadToHead(playerAId: string, playerBId: string) {
  const [aMatches, bMatches] = await Promise.all([
    prisma.matchHistory.findMany({ where: { playerId: playerAId } }),
    prisma.matchHistory.findMany({ where: { playerId: playerBId } }),
  ]);

  const bByMatchId = new Map(bMatches.map((m) => [m.matchId, m]));

  const shared: HeadToHeadMatch[] = aMatches
    .filter((a) => bByMatchId.has(a.matchId))
    .map((a) => {
      const b = bByMatchId.get(a.matchId)!;
      return {
        matchId: a.matchId,
        gameCreation: a.gameCreation,
        // Two players on the same team always share the same win/loss result.
        sameTeam: a.win === b.win,
        championA: a.champion,
        championB: b.champion,
        aWin: a.win,
        bWin: b.win,
      };
    })
    .sort((x, y) => y.gameCreation.getTime() - x.gameCreation.getTime());

  const asTeammates = shared.filter((m) => m.sameTeam);
  const asOpponents = shared.filter((m) => !m.sameTeam);

  return {
    matches: shared,
    teammates: {
      games: asTeammates.length,
      wins: asTeammates.filter((m) => m.aWin).length,
    },
    opponents: {
      games: asOpponents.length,
      aWins: asOpponents.filter((m) => m.aWin).length,
      bWins: asOpponents.filter((m) => m.bWin).length,
    },
  };
}

export async function searchPlayers(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  // SQLite's `contains` filter is case-sensitive in Prisma, so filter in JS instead.
  const players = await prisma.player.findMany({ where: { isActive: true } });
  return players
    .filter((p) => `${p.gameName}#${p.tagLine}`.toLowerCase().includes(q))
    .slice(0, 10);
}
