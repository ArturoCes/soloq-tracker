import Image from "next/image";
import { getHeadToHead, getPlayerById, type HeadToHeadMatch } from "@/lib/queries/players";
import { championIconUrl, getLatestDDragonVersion } from "@/lib/riot/ddragon";
import { formatRank, formatRole, winrate } from "@/lib/ranks";
import { Badge } from "@/components/ui/badge";
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

  const headToHead = playerA && playerB ? await getHeadToHead(playerA.id, playerB.id) : null;

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

          {headToHead && headToHead.matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Enfrentamientos directos</CardTitle>
              </CardHeader>
              <CardContent>
                <HeadToHeadSection
                  headToHead={headToHead}
                  playerA={playerA}
                  playerB={playerB}
                  ddragonVersion={ddragonVersion}
                />
              </CardContent>
            </Card>
          )}

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

function HeadToHeadSection({
  headToHead,
  playerA,
  playerB,
  ddragonVersion,
}: {
  headToHead: Awaited<ReturnType<typeof getHeadToHead>>;
  playerA: { gameName: string };
  playerB: { gameName: string };
  ddragonVersion: string;
}) {
  const { matches, teammates, opponents } = headToHead;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {teammates.games > 0 && (
          <div className="rounded-lg border border-border/60 p-3 text-sm">
            <p className="font-medium">Como compañeros</p>
            <p className="text-muted-foreground">
              {teammates.games} partidas · {teammates.wins} victorias juntos (
              {winrate(teammates.wins, teammates.games - teammates.wins)}%)
            </p>
          </div>
        )}
        {opponents.games > 0 && (
          <div className="rounded-lg border border-border/60 p-3 text-sm">
            <p className="font-medium">Como rivales</p>
            <p className="text-muted-foreground">
              {opponents.games} partidas · {playerA.gameName} ganó {opponents.aWins} · {playerB.gameName} ganó{" "}
              {opponents.bWins}
            </p>
          </div>
        )}
      </div>

      <ul className="space-y-2">
        {matches.slice(0, 20).map((m: HeadToHeadMatch) => (
          <li
            key={m.matchId}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm"
          >
            <Badge variant="outline" className="shrink-0 text-xs">
              {m.sameTeam ? "Compañeros" : "Rivales"}
            </Badge>
            <div className="flex flex-1 items-center gap-2">
              <Image
                src={championIconUrl(ddragonVersion, m.championA)}
                alt={m.championA}
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-muted-foreground">{m.championA}</span>
              <span className="text-muted-foreground">vs</span>
              <Image
                src={championIconUrl(ddragonVersion, m.championB)}
                alt={m.championB}
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-muted-foreground">{m.championB}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {m.gameCreation.toLocaleDateString("es-ES")}
            </span>
            <span className={m.aWin ? "text-sm font-medium text-emerald-400" : "text-sm font-medium text-rose-400"}>
              {m.sameTeam ? (m.aWin ? "Victoria" : "Derrota") : m.aWin ? `Gana ${playerA.gameName}` : `Gana ${playerB.gameName}`}
            </span>
          </li>
        ))}
      </ul>
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
