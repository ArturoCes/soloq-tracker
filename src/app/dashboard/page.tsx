import Link from "next/link";
import {
  Crown,
  Flame,
  Skull,
  Swords,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { winrate } from "@/lib/ranks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Estadísticas destacadas del SoloQ Challenge: mayores subidas, rachas y récords del día.",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Estadísticas destacadas desde la última actualización de la clasificación.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HighlightCard
          icon={<Crown className="size-5 text-amber-400" />}
          title="Rey del día"
          subtitle="Más LP ganados"
          player={stats.biggestGainer?.player}
          value={stats.biggestGainer ? `+${stats.biggestGainer.delta} LP` : null}
        />
        <HighlightCard
          icon={<Skull className="size-5 text-rose-400" />}
          title="Tilt del día"
          subtitle="Más LP perdidos"
          player={stats.biggestLoser?.player}
          value={
            stats.biggestLoser && stats.biggestLoser.delta < 0
              ? `${stats.biggestLoser.delta} LP`
              : null
          }
        />
        <HighlightCard
          icon={<TrendingUp className="size-5 text-emerald-400" />}
          title="Mayor subida"
          subtitle="Desde la última actualización"
          player={stats.biggestGainer?.player}
          value={stats.biggestGainer ? `+${stats.biggestGainer.delta} LP` : null}
        />
        <HighlightCard
          icon={<TrendingDown className="size-5 text-rose-400" />}
          title="Mayor bajada"
          subtitle="Desde la última actualización"
          player={stats.biggestLoser?.player}
          value={
            stats.biggestLoser && stats.biggestLoser.delta < 0
              ? `${stats.biggestLoser.delta} LP`
              : null
          }
        />
        <HighlightCard
          icon={<Swords className="size-5 text-sky-400" />}
          title="Más partidas"
          subtitle="Total de partidas clasificatorias"
          player={stats.mostGames}
          value={stats.mostGames ? `${stats.mostGames.wins + stats.mostGames.losses} partidas` : null}
        />
        <HighlightCard
          icon={<Trophy className="size-5 text-yellow-300" />}
          title="Mayor winrate"
          subtitle="Mínimo 5 partidas"
          player={stats.bestWinrate}
          value={stats.bestWinrate ? `${winrate(stats.bestWinrate.wins, stats.bestWinrate.losses)}%` : null}
        />
        <HighlightCard
          icon={<Flame className="size-5 text-orange-400" />}
          title="Racha de victorias"
          subtitle="Racha activa más larga"
          player={stats.bestWinStreak?.player}
          value={stats.bestWinStreak ? `${stats.bestWinStreak.streak.count} victorias seguidas` : null}
        />
        <HighlightCard
          icon={<Skull className="size-5 text-neutral-400" />}
          title="Racha de derrotas"
          subtitle="Racha activa más larga"
          player={stats.worstLossStreak?.player}
          value={
            stats.worstLossStreak ? `${stats.worstLossStreak.streak.count} derrotas seguidas` : null
          }
        />
      </div>
    </div>
  );
}

function HighlightCard({
  icon,
  title,
  subtitle,
  player,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  player?: { id: string; gameName: string; tagLine: string } | null;
  value: string | null;
}) {
  return (
    <Card className="transition-transform hover:-translate-y-0.5">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        {icon}
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardHeader>
      <CardContent>
        {player && value ? (
          <Link href={`/jugador/${player.id}`} className="hover:underline">
            <p className="text-lg font-semibold">
              {player.gameName}
              <span className="text-sm font-normal text-muted-foreground">#{player.tagLine}</span>
            </p>
            <p className="text-2xl font-bold text-primary">{value}</p>
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">Sin datos suficientes todavía.</p>
        )}
      </CardContent>
    </Card>
  );
}
