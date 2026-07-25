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

export async function searchPlayers(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  // SQLite's `contains` filter is case-sensitive in Prisma, so filter in JS instead.
  const players = await prisma.player.findMany({ where: { isActive: true } });
  return players
    .filter((p) => `${p.gameName}#${p.tagLine}`.toLowerCase().includes(q))
    .slice(0, 10);
}
