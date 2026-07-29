import { prisma } from "@/lib/db";
import { rankValue } from "@/lib/riot/regions";

export type TimelineStanding = {
  playerId: string;
  gameName: string;
  tagLine: string;
  streamerName: string | null;
  isUnofficial: boolean;
  isGuest: boolean;
  profileIconId: number;
  tier: string;
  rankDivision: string | null;
  leaguePoints: number;
  rankVal: number;
};

export type TimelineSnapshot = {
  updateLogId: string;
  timestamp: string;
  standings: TimelineStanding[];
};

/**
 * Reconstructs the leaderboard as it stood after each past "Actualizar clasificación" run,
 * by carrying forward each player's most recent LpHistory snapshot at or before that moment.
 */
export async function getTimelineSnapshots(): Promise<TimelineSnapshot[]> {
  const [updateLogs, players] = await Promise.all([
    prisma.updateLog.findMany({
      where: { finishedAt: { not: null }, status: { in: ["success", "partial"] } },
      orderBy: { startedAt: "asc" },
    }),
    prisma.player.findMany({
      where: { isActive: true },
      include: { lpHistory: { orderBy: { capturedAt: "asc" } } },
    }),
  ]);

  return updateLogs.map((log) => {
    const asOf = log.finishedAt!.getTime();

    const standings: TimelineStanding[] = players
      .map((player): TimelineStanding | null => {
        let latest = null;
        for (const h of player.lpHistory) {
          if (h.capturedAt.getTime() <= asOf) latest = h;
          else break;
        }
        if (!latest) return null;

        return {
          playerId: player.id,
          gameName: player.gameName,
          tagLine: player.tagLine,
          streamerName: player.streamerName,
          isUnofficial: player.isUnofficial,
          isGuest: player.isGuest,
          profileIconId: player.profileIconId,
          tier: latest.tier,
          rankDivision: latest.rankDivision,
          leaguePoints: latest.leaguePoints,
          rankVal: rankValue(latest.tier, latest.rankDivision, latest.leaguePoints),
        };
      })
      .filter((s): s is TimelineStanding => s !== null)
      .sort((a, b) => b.rankVal - a.rankVal);

    return {
      updateLogId: log.id,
      timestamp: log.finishedAt!.toISOString(),
      standings,
    };
  });
}
