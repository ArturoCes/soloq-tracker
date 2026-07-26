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
      matches: { orderBy: { gameCreation: "desc" }, take: 100 },
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

  const withRecentMatches = players.filter((p) => p.matches.length >= 10);
  const bestKda =
    [...withRecentMatches]
      .filter((p) => p.avgKda != null)
      .sort((a, b) => (b.avgKda ?? 0) - (a.avgKda ?? 0))[0] ?? null;

  const mostChampionsWon =
    [...players]
      .map((p) => ({
        player: p,
        count: new Set(p.matches.filter((m) => m.win).map((m) => m.champion)).size,
      }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count)[0] ?? null;

  let mostKillsSingleGame: { player: (typeof players)[number]; match: (typeof players)[number]["matches"][number] } | null = null;
  let mostAssistsSingleGame: { player: (typeof players)[number]; match: (typeof players)[number]["matches"][number] } | null = null;
  for (const player of players) {
    for (const match of player.matches) {
      if (!mostKillsSingleGame || match.kills > mostKillsSingleGame.match.kills) {
        mostKillsSingleGame = { player, match };
      }
      if (!mostAssistsSingleGame || match.assists > mostAssistsSingleGame.match.assists) {
        mostAssistsSingleGame = { player, match };
      }
    }
  }

  return {
    biggestGainer,
    biggestLoser,
    mostGames,
    bestWinrate,
    bestWinStreak,
    worstLossStreak,
    bestKda,
    mostChampionsWon,
    mostKillsSingleGame,
    mostAssistsSingleGame,
  };
}
