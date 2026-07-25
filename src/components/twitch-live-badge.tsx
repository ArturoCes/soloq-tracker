import { isChannelLive } from "@/lib/twitch";
import { TwitchIcon } from "@/components/brand-icons";

export async function TwitchLiveBadge() {
  const live = await isChannelLive();
  if (!live) return null;

  return (
    <a
      href="https://www.twitch.tv/hardgam3rpro"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/25"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
      </span>
      <TwitchIcon className="size-3.5" />
      En directo
    </a>
  );
}
