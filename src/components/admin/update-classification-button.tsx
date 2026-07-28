"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateClassificationAction } from "@/lib/actions/admin";

export function UpdateClassificationButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const toastId = toast.loading("Consultando la Riot API y actualizando este lote de jugadores...");
          try {
            const summary = await updateClassificationAction();
            const remaining = Math.max(
              0,
              summary.totalActivePlayers - summary.playersUpdated - summary.playersFailed
            );
            const progress = `Lote: ${summary.playersUpdated + summary.playersFailed}/${summary.batchSize} · Quedan ~${remaining} de ${summary.totalActivePlayers} sin tocar en esta ronda.`;

            if (summary.status === "success") {
              toast.success(`${summary.playersUpdated} jugadores actualizados. ${progress}`, {
                id: toastId,
              });
            } else if (summary.status === "partial") {
              toast.warning(
                `${summary.playersUpdated} ok, ${summary.playersFailed} fallidos. ${progress}`,
                { id: toastId }
              );
            } else {
              toast.error("No se pudo actualizar ningún jugador de este lote. Revisa los errores de la API.", {
                id: toastId,
              });
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error inesperado", { id: toastId });
          }
        })
      }
    >
      <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} />
      {pending ? "Actualizando lote..." : "Actualizar siguiente lote"}
    </Button>
  );
}
