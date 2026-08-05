import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCrossedPaths, getPlayerById } from "@/lib/queries/players";
import { getLatestDDragonVersion, championIconUrl } from "@/lib/riot/ddragon";
import { displayName, formatRank, formatRole, winrate } from "@/lib/ranks";
import { PlayerAvatar } from "@/components/player-avatar";
import { RankBadge } from "@/components/rank-badge";
import { DeltaBadge } from "@/components/delta-badge";
import { LpEvolutionChart } from "@/components/lp-evolution-chart";
import { MatchHistoryList } from "@/components/match-history-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) return {};

  const title = `${displayName(player)} — ${formatRank(player.tier, player.rankDivision)}`;
  const description = `${player.leaguePoints} LP · ${player.wins}V ${player.losses}D · Perfil de seguimiento no oficial del SoloQ Challenge.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, ddragonVersion] = await Promise.all([getPlayerById(id), getLatestDDragonVersion()]);

  if (!player) notFound();

  const crossedPaths = await getCrossedPaths(id);

  const chartData = [...player.lpHistory]
    .reverse()
    .map((h) => ({
      date: h.capturedAt.toISOString(),
      leaguePoints: h.leaguePoints,
      label: h.capturedAt.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
    }));

  const championCounts = new Map<string, { count: number; wins: number }>();
  for (const m of player.matches) {
    const entry = championCounts.get(m.champion) ?? { count: 0, wins: 0 };
    entry.count += 1;
    if (m.win) entry.wins += 1;
    championCounts.set(m.champion, entry);
  }
  const topChampions = [...championCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const wr = winrate(player.wins, player.losses);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center gap-4">
        <PlayerAvatar ddragonVersion={ddragonVersion} profileIconId={player.profileIconId} size={72} />
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            {displayName(player)}
            <span className="text-base font-normal text-muted-foreground">
              {player.gameName}#{player.tagLine}
            </span>
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <RankBadge tier={player.tier} division={player.rankDivision} className="text-base" />
            <span className="text-muted-foreground">· {player.leaguePoints} LP</span>
            {(player.isUnofficial || player.isGuest) && (
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
                🟢 Participante no oficial
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Winrate" value={`${wr}%`} />
        <StatCard label="Victorias / Derrotas" value={`${player.wins}V ${player.losses}D`} />
        <StatCard label="KDA medio" value={player.avgKda ? player.avgKda.toFixed(2) : "—"} />
        <StatCard label="Rol más jugado" value={formatRole(player.mainRole)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolución de LP</CardTitle>
        </CardHeader>
        <CardContent>
          <LpEvolutionChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimos campeones</CardTitle>
          </CardHeader>
          <CardContent>
            {topChampions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos de campeones todavía.</p>
            ) : (
              <ul className="space-y-2">
                {topChampions.map(([champion, stats]) => (
                  <li key={champion} className="flex items-center gap-3">
                    <Image
                      src={championIconUrl(ddragonVersion, champion)}
                      alt={champion}
                      width={32}
                      height={32}
                      className="rounded-md"
                    />
                    <span className="flex-1 text-sm">{champion}</span>
                    <span className="text-xs text-muted-foreground">
                      {stats.count} partidas · {winrate(stats.wins, stats.count - stats.wins)}% WR
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de LP</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
              {player.lpHistory.map((h, i) => (
                <li key={h.id} className="flex items-center justify-between border-b border-border/40 py-1.5 last:border-0">
                  <span className="text-muted-foreground">
                    Día {player.lpHistory.length - i} ·{" "}
                    {h.capturedAt.toLocaleDateString("es-ES")}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono">{h.leaguePoints} LP</span>
                    <DeltaBadge delta={h.delta} />
                  </span>
                </li>
              ))}
              {player.lpHistory.length === 0 && (
                <li className="text-muted-foreground">Sin historial todavía.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas partidas</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchHistoryList matches={player.matches} ddragonVersion={ddragonVersion} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Se ha cruzado con</CardTitle>
        </CardHeader>
        <CardContent>
          {crossedPaths.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no ha coincidido en ninguna partida con otro jugador rastreado.
            </p>
          ) : (
            <ul className="space-y-2">
              {crossedPaths.map((m) => (
                <li
                  key={`${m.matchId}-${m.otherPlayerId}`}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-1.5 last:border-0"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className={
                        m.sameTeam
                          ? "border-emerald-500/40 text-emerald-400"
                          : "border-rose-500/40 text-rose-400"
                      }
                    >
                      {m.sameTeam ? "Compañero" : "Rival"}
                    </Badge>
                    <Link href={`/jugador/${m.otherPlayerId}`} className="font-medium hover:text-primary">
                      {m.otherPlayerName}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {m.otherGameName}#{m.otherTagLine}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {m.gameCreation.toLocaleDateString("es-ES")}
                    <span className={m.win ? "text-emerald-400" : "text-rose-400"}>
                      {m.win ? "Victoria" : "Derrota"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
