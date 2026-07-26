import Link from "next/link";
import {
  Crosshair,
  Crown,
  Flame,
  HeartHandshake,
  Skull,
  Sparkles,
  Swords,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { winrate } from "@/lib/ranks";
import { formatPrizeEur } from "@/lib/prizes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          prize={stats.bestWinStreak ? formatPrizeEur(1500) : null}
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
        <HighlightCard
          icon={<Target className="size-5 text-purple-400" />}
          title="Mejor KDA medio"
          subtitle="Mínimo 10 partidas recientes"
          player={stats.bestKda}
          value={stats.bestKda?.avgKda != null ? stats.bestKda.avgKda.toFixed(2) : null}
          prize={stats.bestKda ? formatPrizeEur(1000) : null}
        />
        <HighlightCard
          icon={<Sparkles className="size-5 text-teal-300" />}
          title="Más campeones distintos ganados"
          subtitle="Últimos 30 días"
          player={stats.mostChampionsWon?.player}
          value={stats.mostChampionsWon ? `${stats.mostChampionsWon.count} campeones` : null}
          prize={stats.mostChampionsWon ? formatPrizeEur(1000) : null}
        />
        <HighlightCard
          icon={<Crosshair className="size-5 text-red-400" />}
          title="Más kills en una partida"
          subtitle="Récord individual"
          player={stats.mostKillsSingleGame?.player}
          value={stats.mostKillsSingleGame ? `${stats.mostKillsSingleGame.match.kills} kills` : null}
          prize={stats.mostKillsSingleGame ? formatPrizeEur(250) : null}
        />
        <HighlightCard
          icon={<HeartHandshake className="size-5 text-blue-300" />}
          title="Más asistencias en una partida"
          subtitle="Récord individual"
          player={stats.mostAssistsSingleGame?.player}
          value={
            stats.mostAssistsSingleGame ? `${stats.mostAssistsSingleGame.match.assists} asistencias` : null
          }
          prize={stats.mostAssistsSingleGame ? formatPrizeEur(250) : null}
        />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Los importes mostrados son el premio orientativo de esa categoría según las bases
        oficiales del SoloQ Challenge (categoría Low Elo). No es la clasificación oficial del
        reto: se calcula sobre los jugadores que esta web rastrea.
      </p>
    </div>
  );
}

function HighlightCard({
  icon,
  title,
  subtitle,
  player,
  value,
  prize,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  player?: { id: string; gameName: string; tagLine: string } | null;
  value: string | null;
  prize?: string | null;
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
            {prize && (
              <Badge variant="outline" className="mt-1 text-xs text-muted-foreground">
                Premio: {prize}
              </Badge>
            )}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">Sin datos suficientes todavía.</p>
        )}
      </CardContent>
    </Card>
  );
}
