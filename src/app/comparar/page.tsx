import Image from "next/image";
import { getPlayerById } from "@/lib/queries/players";
import { championIconUrl, getLatestDDragonVersion } from "@/lib/riot/ddragon";
import { formatRank, formatRole, winrate } from "@/lib/ranks";
import { PlayerPicker } from "@/components/player-picker";
import { PlayerAvatar } from "@/components/player-avatar";
import { LpEvolutionChart } from "@/components/lp-evolution-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Comparador",
  description: "Compara LP, winrate, KDA y campeones entre dos jugadores del SoloQ Challenge.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const [playerA, playerB, ddragonVersion] = await Promise.all([
    a ? getPlayerById(a) : null,
    b ? getPlayerById(b) : null,
    getLatestDDragonVersion(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comparador de jugadores</h1>
        <p className="mt-1 text-muted-foreground">Elige dos jugadores para comparar sus estadísticas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlayerPicker slot="a" label="Buscar jugador A..." />
        <PlayerPicker slot="b" label="Buscar jugador B..." />
      </div>

      {playerA && playerB ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {[playerA, playerB].map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <PlayerAvatar ddragonVersion={ddragonVersion} profileIconId={p.profileIconId} size={48} />
                  <div>
                    <p className="font-semibold">
                      {p.gameName}#{p.tagLine}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatRank(p.tier, p.rankDivision)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonRow label="LP" a={`${playerA.leaguePoints}`} b={`${playerB.leaguePoints}`} />
              <ComparisonRow
                label="Victorias / Derrotas"
                a={`${playerA.wins}V ${playerA.losses}D`}
                b={`${playerB.wins}V ${playerB.losses}D`}
              />
              <ComparisonRow
                label="Winrate"
                a={`${winrate(playerA.wins, playerA.losses)}%`}
                b={`${winrate(playerB.wins, playerB.losses)}%`}
              />
              <ComparisonRow
                label="KDA medio"
                a={playerA.avgKda?.toFixed(2) ?? "—"}
                b={playerB.avgKda?.toFixed(2) ?? "—"}
              />
              <ComparisonRow label="Rol principal" a={formatRole(playerA.mainRole)} b={formatRole(playerB.mainRole)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campeones más usados</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <TopChampionsList matches={playerA.matches} ddragonVersion={ddragonVersion} />
              <TopChampionsList matches={playerB.matches} ddragonVersion={ddragonVersion} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Evolución — {playerA.gameName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LpEvolutionChart
                  data={[...playerA.lpHistory].reverse().map((h) => ({
                    date: h.capturedAt.toISOString(),
                    leaguePoints: h.leaguePoints,
                    label: h.capturedAt.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
                  }))}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Evolución — {playerB.gameName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LpEvolutionChart
                  data={[...playerB.lpHistory].reverse().map((h) => ({
                    date: h.capturedAt.toISOString(),
                    leaguePoints: h.leaguePoints,
                    label: h.capturedAt.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Selecciona dos jugadores en los buscadores de arriba para ver la comparación.
        </p>
      )}
    </div>
  );
}

function ComparisonRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2 border-b border-border/40 py-2 text-sm last:border-0">
      <span className="text-right font-mono">{a}</span>
      <span className="text-center text-muted-foreground">{label}</span>
      <span className="font-mono">{b}</span>
    </div>
  );
}

function TopChampionsList({
  matches,
  ddragonVersion,
}: {
  matches: { champion: string; win: boolean }[];
  ddragonVersion: string;
}) {
  const counts = new Map<string, number>();
  for (const m of matches) counts.set(m.champion, (counts.get(m.champion) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (top.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin partidas registradas.</p>;
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {top.map(([champion, count]) => (
        <li key={champion} className="flex flex-col items-center gap-1">
          <Image
            src={championIconUrl(ddragonVersion, champion)}
            alt={champion}
            width={40}
            height={40}
            className="rounded-md"
          />
          <span className="text-xs text-muted-foreground">{count}x</span>
        </li>
      ))}
    </ul>
  );
}
