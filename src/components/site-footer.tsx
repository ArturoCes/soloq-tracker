import { SocialLinks } from "@/components/social-links";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 py-8 text-sm text-muted-foreground">
        <div>
          <p className="max-w-3xl">
            Este proyecto es <strong className="text-foreground">independiente y no oficial</strong>.
            No está afiliado, respaldado ni patrocinado por Riot Games ni por los organizadores del
            SoloQ Challenge. League of Legends es una marca registrada de Riot Games, Inc.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} SoloQ Tracker — proyecto de fan hecho de forma independiente.
          </p>
        </div>
        <SocialLinks />
      </div>
    </footer>
  );
}
