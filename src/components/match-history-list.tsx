import Image from "next/image";
import { cn } from "@/lib/utils";
import { championIconUrl } from "@/lib/riot/ddragon";
import { formatRole } from "@/lib/ranks";

type Match = {
  id: string;
  champion: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  role: string | null;
  gameCreation: Date;
};

export function MatchHistoryList({
  matches,
  ddragonVersion,
}: {
  matches: Match[];
  ddragonVersion: string;
}) {
  if (matches.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin partidas registradas todavía.</p>;
  }

  return (
    <ul className="space-y-2">
      {matches.map((m) => {
        const kda = m.deaths === 0 ? "Perfect" : ((m.kills + m.assists) / m.deaths).toFixed(2);
        return (
          <li
            key={m.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border-l-4 bg-card/60 px-3 py-2",
              m.win ? "border-l-emerald-500" : "border-l-rose-500"
            )}
          >
            <Image
              src={championIconUrl(ddragonVersion, m.champion)}
              alt={m.champion}
              width={40}
              height={40}
              className="rounded-md"
            />
            <div className="flex-1">
              <p className="font-medium">{m.champion}</p>
              <p className="text-xs text-muted-foreground">
                {formatRole(m.role)} · {m.gameCreation.toLocaleDateString("es-ES")}
              </p>
            </div>
            <div className="text-right">
              <p className={cn("text-sm font-semibold", m.win ? "text-emerald-400" : "text-rose-400")}>
                {m.win ? "Victoria" : "Derrota"}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {m.kills}/{m.deaths}/{m.assists} · {kda} KDA
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
