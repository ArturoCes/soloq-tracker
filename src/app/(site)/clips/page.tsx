import type { Metadata } from "next";
import Image from "next/image";
import { Play } from "lucide-react";
import { getTopClips } from "@/lib/twitch";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Clips",
  description: "Los clips más vistos del canal de Twitch de HardProGramer.",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function ClipsPage() {
  const clips = await getTopClips();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Clips</h1>
      <p className="mt-1 text-muted-foreground">
        Los mejores momentos, recortados por la comunidad en Twitch.
      </p>

      {clips.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Todavía no hay clips disponibles, o falta configurar TWITCH_CLIENT_ID /
          TWITCH_CLIENT_SECRET.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clips.map((clip) => (
            <a key={clip.id} href={clip.url} target="_blank" rel="noopener noreferrer">
              <Card className="group overflow-hidden transition-transform hover:-translate-y-0.5">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={clip.thumbnailUrl}
                    alt={clip.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="size-10 fill-white text-white" />
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                    {formatDuration(clip.durationSeconds)}
                  </span>
                </div>
                <CardContent className="p-3">
                  <p className="truncate text-sm font-medium">{clip.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {clip.viewCount.toLocaleString("es-ES")} visitas ·{" "}
                    {new Date(clip.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
