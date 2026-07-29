"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/player-avatar";
import { displayName, formatRank, TIER_COLOR } from "@/lib/ranks";
import type { TimelineSnapshot } from "@/lib/queries/timeline";

const STEP_MS = 600;

export function TimelineViewer({
  snapshots,
  ddragonVersion,
}: {
  snapshots: TimelineSnapshot[];
  ddragonVersion: string;
}) {
  const [index, setIndex] = useState(snapshots.length - 1);
  const [playing, setPlaying] = useState(false);

  const atEnd = index >= snapshots.length - 1;

  useEffect(() => {
    if (!playing || atEnd) return;
    // Depending on `index` (not just `atEnd`) makes this effect re-run after every
    // step, so a new timer gets scheduled each time instead of firing only once.
    const timer = setTimeout(() => setIndex((i) => Math.min(i + 1, snapshots.length - 1)), STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, atEnd, index, snapshots.length]);

  const isPlaying = playing && !atEnd;

  const snapshot = snapshots[index];

  const maxRankVal = useMemo(
    () => Math.max(1, ...snapshot.standings.map((s) => s.rankVal)),
    [snapshot]
  );

  if (snapshots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay suficiente historial. Cada vez que pulses &quot;Actualizar
        clasificación&quot; se guarda un punto nuevo en la línea temporal.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            if (index >= snapshots.length - 1) setIndex(0);
            setPlaying((p) => !p);
          }}
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <div className="flex-1">
          <Slider
            min={0}
            max={snapshots.length - 1}
            step={1}
            value={[index]}
            onValueChange={(v) => {
              setPlaying(false);
              setIndex(Array.isArray(v) ? v[0] : v);
            }}
          />
        </div>
        <span className="w-40 shrink-0 text-right text-sm text-muted-foreground">
          {new Date(snapshot.timestamp).toLocaleString("es-ES", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>

      <ul className="space-y-2">
        {snapshot.standings.map((entry, i) => (
          <motion.li
            key={entry.playerId}
            layout
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="flex items-center gap-3"
          >
            <span className="w-5 shrink-0 text-right font-mono text-sm text-muted-foreground">
              {i + 1}
            </span>
            <PlayerAvatar ddragonVersion={ddragonVersion} profileIconId={entry.profileIconId} size={28} />
            <div className="min-w-0 flex-1">
              <motion.div
                layout
                className="flex h-8 items-center gap-2 rounded-md bg-primary/20 px-2"
                style={{ width: `${Math.max(12, (entry.rankVal / maxRankVal) * 100)}%` }}
              >
                <span className="truncate text-sm font-medium">
                  {displayName(entry)}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {entry.gameName}#{entry.tagLine}
                  </span>
                </span>
                {(entry.isUnofficial || entry.isGuest) && (
                  <Badge variant="outline" className="shrink-0 border-emerald-500/40 text-[10px] text-emerald-400">
                    No oficial
                  </Badge>
                )}
              </motion.div>
            </div>
            <span className={`w-32 shrink-0 text-right text-xs ${TIER_COLOR[entry.tier] ?? ""}`}>
              {formatRank(entry.tier, entry.rankDivision)}
            </span>
            <span className="w-16 shrink-0 text-right font-mono text-sm">{entry.leaguePoints} LP</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
