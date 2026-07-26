import type { Metadata } from "next";
import { getTimelineSnapshots } from "@/lib/queries/timeline";
import { getLatestDDragonVersion } from "@/lib/riot/ddragon";
import { TimelineViewer } from "@/components/timeline-viewer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Línea temporal",
  description: "Revive cómo cambió la clasificación del SoloQ Challenge a lo largo del tiempo.",
};

export default async function HistorialPage() {
  const [snapshots, ddragonVersion] = await Promise.all([
    getTimelineSnapshots(),
    getLatestDDragonVersion(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Línea temporal</h1>
      <p className="mt-1 text-muted-foreground">
        Mueve el deslizador o dale a reproducir para ver cómo cambió la clasificación en cada
        actualización.
      </p>

      <div className="mt-8">
        <TimelineViewer snapshots={snapshots} ddragonVersion={ddragonVersion} />
      </div>
    </div>
  );
}
