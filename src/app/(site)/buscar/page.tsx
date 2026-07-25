import Link from "next/link";
import { searchPlayers } from "@/lib/queries/players";
import { getLatestDDragonVersion } from "@/lib/riot/ddragon";
import { PlayerAvatar } from "@/components/player-avatar";
import { RankBadge } from "@/components/rank-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Buscar jugador",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [results, ddragonVersion] = await Promise.all([
    searchPlayers(q),
    getLatestDDragonVersion(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Buscar jugador</h1>
      <p className="mt-1 text-muted-foreground">
        {q ? `Resultados para "${q}"` : "Escribe un Riot ID en la barra de búsqueda."}
      </p>

      <div className="mt-6 space-y-2">
        {results.map((p) => (
          <Link key={p.id} href={`/jugador/${p.id}`}>
            <Card className="transition-colors hover:bg-accent/60">
              <CardContent className="flex items-center gap-3 p-4">
                <PlayerAvatar ddragonVersion={ddragonVersion} profileIconId={p.profileIconId} size={40} />
                <div className="flex-1">
                  <p className="font-medium">
                    {p.gameName} <span className="text-xs text-muted-foreground">#{p.tagLine}</span>
                  </p>
                  <RankBadge tier={p.tier} division={p.rankDivision} className="text-xs" />
                </div>
                <span className="font-mono text-sm text-muted-foreground">{p.leaguePoints} LP</span>
              </CardContent>
            </Card>
          </Link>
        ))}
        {q && results.length === 0 && (
          <p className="text-sm text-muted-foreground">No se encontró ningún jugador con ese nombre.</p>
        )}
      </div>
    </div>
  );
}
