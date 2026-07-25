import type { Metadata } from "next";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "En mantenimiento",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Wrench className="size-10 text-primary" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Estamos en mantenimiento</h1>
      <p className="mt-2 text-muted-foreground">
        SoloQ Tracker vuelve enseguida. Estamos actualizando la clasificación o realizando tareas
        técnicas. Prueba de nuevo en unos minutos.
      </p>
    </div>
  );
}
