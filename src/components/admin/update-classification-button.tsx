"use client";

import { useRef, useState } from "react";
import { RefreshCw, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateClassificationAction } from "@/lib/actions/admin";

export function UpdateClassificationButton() {
  const [running, setRunning] = useState(false);
  const cancelRef = useRef(false);

  async function runToCompletion() {
    setRunning(true);
    cancelRef.current = false;
    const toastId = toast.loading("Actualizando lote 1...");

    let totalUpdated = 0;
    let totalFailed = 0;
    let round = 0;
    let totalRounds = 1;

    try {
      while (!cancelRef.current) {
        round++;
        const summary = await updateClassificationAction();
        totalUpdated += summary.playersUpdated;
        totalFailed += summary.playersFailed;
        totalRounds = Math.max(1, Math.ceil(summary.totalActivePlayers / summary.batchSize));

        if (cancelRef.current) break;

        if (round >= totalRounds) {
          toast.success(
            `Ronda ${round} de ${totalRounds}: completa. ${totalUpdated} actualizados, ${totalFailed} fallidos en total.`,
            { id: toastId }
          );
          break;
        }

        toast.loading(`Ronda ${round} de ${totalRounds} completada, empezando la ${round + 1}...`, {
          id: toastId,
        });
      }
      if (cancelRef.current) {
        toast.info(`Detenido tras la ronda ${round}. ${totalUpdated} actualizados hasta ahora.`, {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado", { id: toastId });
    } finally {
      setRunning(false);
    }
  }

  return (
    <Button
      size="lg"
      variant={running ? "outline" : "default"}
      onClick={() => {
        if (running) {
          cancelRef.current = true;
          return;
        }
        runToCompletion();
      }}
    >
      {running ? <Square className="size-4" /> : <RefreshCw className="size-4" />}
      {running ? "Detener" : "Actualizar clasificación"}
    </Button>
  );
}
