"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { removePlayerAction, togglePlayerActiveAction } from "@/lib/actions/admin";
import { displayName, formatRank } from "@/lib/ranks";

type Player = {
  id: string;
  gameName: string;
  tagLine: string;
  streamerName: string | null;
  platform: string;
  isActive: boolean;
  isUnofficial: boolean;
  tier: string | null;
  rankDivision: string | null;
  leaguePoints: number;
};

export function PlayerList({ players }: { players: Player[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <ul className="divide-y divide-border/60 rounded-xl border border-border/60">
      {players.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {displayName(p)}{" "}
                <span className="text-xs text-muted-foreground">
                  {p.gameName}#{p.tagLine}
                </span>
              </span>
              <Badge variant="outline" className="text-xs">
                {p.platform.toUpperCase()}
              </Badge>
              {p.isUnofficial && (
                <Badge variant="outline" className="border-emerald-500/40 text-xs text-emerald-400">
                  No oficial
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatRank(p.tier, p.rankDivision)} · {p.leaguePoints} LP
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={p.isActive}
              disabled={pending}
              onCheckedChange={(checked) =>
                startTransition(async () => {
                  await togglePlayerActiveAction(p.id, checked);
                })
              }
            />
            {!p.isUnofficial && (
              <Button
                size="icon"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    if (!confirm(`¿Eliminar a ${p.gameName}#${p.tagLine} de la clasificación?`)) return;
                    await removePlayerAction(p.id);
                    toast.success("Jugador eliminado");
                  })
                }
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        </li>
      ))}
      {players.length === 0 && (
        <li className="px-4 py-8 text-center text-muted-foreground">Todavía no hay jugadores.</li>
      )}
    </ul>
  );
}
