import { getLeaderboard } from "@/lib/queries/players";
import { getLatestDDragonVersion } from "@/lib/riot/ddragon";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { FadeIn } from "@/components/fade-in";
import { ExportImageButton } from "@/components/export-image-button";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [entries, ddragonVersion, lastUpdate] = await Promise.all([
    getLeaderboard(),
    getLatestDDragonVersion(),
    prisma.updateLog.findFirst({
      where: { status: { in: ["success", "partial"] } },
      orderBy: { finishedAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clasificación</h1>
          <p className="mt-1 text-muted-foreground">
            Seguimiento no oficial del SoloQ Challenge — {entries.length} jugadores en pista.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate?.finishedAt && (
            <p className="text-sm text-muted-foreground">
              Última actualización:{" "}
              <span className="text-foreground">
                {lastUpdate.finishedAt.toLocaleString("es-ES", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </p>
          )}
          <ExportImageButton targetId="leaderboard-capture" fileName="soloq-clasificacion.png" />
        </div>
      </div>

      <FadeIn>
        <div id="leaderboard-capture" className="bg-background p-1">
          <LeaderboardTable entries={entries} ddragonVersion={ddragonVersion} />
        </div>
      </FadeIn>
    </div>
  );
}
