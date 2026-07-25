import { prisma } from "@/lib/db";
import { winrate } from "@/lib/ranks";

function currentStreak(matches: { win: boolean }[]): { type: "win" | "loss"; count: number } | null {
  if (matches.length === 0) return null;
  const type = matches[0].win ? "win" : "loss";
  let count = 0;
  for (const m of matches) {
    if (m.win === (type === "win")) count++;
    else break;
  }
  return { type, count };
}

export async function getDashboardStats() {
  const players = await prisma.player.findMany({
    where: { isActive: true },
    include: {
      lpHistory: { orderBy: { capturedAt: "desc" }, take: 1 },
      matches: { orderBy: { gameCreation: "desc" }, take: 10 },
    },
  });

  const withDelta = players
    .map((p) => ({ player: p, delta: p.lpHistory[0]?.delta ?? 0 }))
    .filter((x) => x.player.lpHistory.length > 0);

  const biggestGainer = [...withDelta].sort((a, b) => b.delta - a.delta)[0] ?? null;
  const biggestLoser = [...withDelta].sort((a, b) => a.delta - b.delta)[0] ?? null;

  const mostGames = [...players].sort((a, b) => b.wins + b.losses - (a.wins + a.losses))[0] ?? null;

  const withEnoughGames = players.filter((p) => p.wins + p.losses >= 5);
  const bestWinrate =
    [...withEnoughGames].sort(
      (a, b) => winrate(b.wins, b.losses) - winrate(a.wins, a.losses)
    )[0] ?? null;

  const streaks = players
    .map((p) => ({ player: p, streak: currentStreak(p.matches) }))
    .filter((x): x is { player: (typeof players)[number]; streak: { type: "win" | "loss"; count: number } } =>
      x.streak !== null && x.streak.count >= 2
    );

  const bestWinStreak = streaks
    .filter((s) => s.streak.type === "win")
    .sort((a, b) => b.streak.count - a.streak.count)[0] ?? null;

  const worstLossStreak = streaks
    .filter((s) => s.streak.type === "loss")
    .sort((a, b) => b.streak.count - a.streak.count)[0] ?? null;

  return {
    biggestGainer,
    biggestLoser,
    mostGames,
    bestWinrate,
    bestWinStreak,
    worstLossStreak,
  };
}
