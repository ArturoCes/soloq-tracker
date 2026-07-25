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
          const toastId = toast.loading("Consultando la Riot API y actualizando la clasificación...");
          try {
            const summary = await updateClassificationAction();
            if (summary.status === "success") {
              toast.success(`Clasificación actualizada: ${summary.playersUpdated} jugadores.`, {
                id: toastId,
              });
            } else if (summary.status === "partial") {
              toast.warning(
                `Actualizado con errores: ${summary.playersUpdated} ok, ${summary.playersFailed} fallidos.`,
                { id: toastId }
              );
            } else {
              toast.error("No se pudo actualizar ningún jugador. Revisa los errores de la API.", {
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
      {pending ? "Actualizando..." : "Actualizar clasificación"}
    </Button>
  );
}
