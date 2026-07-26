import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/player-avatar";
import { RankBadge } from "@/components/rank-badge";
import { DeltaBadge } from "@/components/delta-badge";
import type { LeaderboardEntry } from "@/lib/queries/players";
import { formatPrizeEur, prizeForPosition } from "@/lib/prizes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function LeaderboardTable({
  entries,
  ddragonVersion,
}: {
  entries: LeaderboardEntry[];
  ddragonVersion: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Invocador</TableHead>
            <TableHead className="text-right">LP</TableHead>
            <TableHead>Rango</TableHead>
            <TableHead className="text-right">V</TableHead>
            <TableHead className="text-right">D</TableHead>
            <TableHead className="text-right">Winrate</TableHead>
            <TableHead className="text-right">Cambio</TableHead>
            <TableHead className="text-right">Premio*</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => {
            const prize = prizeForPosition(index + 1);
            return (
            <TableRow
              key={entry.id}
              className="group cursor-pointer transition-colors hover:bg-accent/60"
            >
              <TableCell className="text-center font-mono text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell>
                <Link href={`/jugador/${entry.id}`} className="flex items-center gap-3">
                  <PlayerAvatar
                    ddragonVersion={ddragonVersion}
                    profileIconId={entry.profileIconId}
                    size={36}
                  />
                  <span className="flex flex-col">
                    <span className="flex items-center gap-2 font-medium group-hover:text-primary">
                      {entry.gameName}
                      <span className="text-xs text-muted-foreground">#{entry.tagLine}</span>
                    </span>
                    {entry.isUnofficial && (
                      <Badge variant="outline" className="mt-0.5 w-fit gap-1 border-emerald-500/40 text-emerald-400">
                        🟢 Participante no oficial
                      </Badge>
                    )}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {entry.leaguePoints} LP
              </TableCell>
              <TableCell>
                <RankBadge tier={entry.tier} division={entry.rankDivision} />
              </TableCell>
              <TableCell className="text-right text-emerald-400">{entry.wins}</TableCell>
              <TableCell className="text-right text-rose-400">{entry.losses}</TableCell>
              <TableCell className="text-right font-mono">{entry.winratePct}%</TableCell>
              <TableCell className="text-right">
                <DeltaBadge delta={entry.delta} className="justify-end" />
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {prize != null ? (
                  <Tooltip>
                    <TooltipTrigger className="underline decoration-dotted underline-offset-2">
                      {formatPrizeEur(prize)}
                    </TooltipTrigger>
                    <TooltipContent>
                      Puesto {index + 1}: {formatPrizeEur(prize)} según el baremo oficial del SoloQ
                      Challenge (Low Elo). Estimado sobre esta clasificación, no la oficial.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
            );
          })}
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                Todavía no hay jugadores en la clasificación. Añádelos desde el panel de
                administración.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {entries.length > 0 && (
        <p className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
          * Premio orientativo según el baremo oficial por posición del SoloQ Challenge (categoría
          Low Elo). No es la clasificación oficial del reto: se calcula sobre los jugadores que
          esta web rastrea, no sobre todos los participantes reales.
        </p>
      )}
    </div>
  );
}
