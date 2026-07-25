import { KickIcon, TikTokIcon, TwitchIcon, YouTubeIcon } from "@/components/brand-icons";

const SOCIALS = [
  { name: "Kick", href: "https://kick.com/hardc0repr0gamer", Icon: KickIcon },
  { name: "Twitch", href: "https://www.twitch.tv/hardgam3rpro", Icon: TwitchIcon },
  { name: "TikTok", href: "https://tiktok.com/@hardcoreprogamer", Icon: TikTokIcon },
  { name: "YouTube", href: "https://youtube.com/@hardcoreprogamer7391", Icon: YouTubeIcon },
];

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">Sígueme</p>
      <ul className="mt-1.5 flex items-center gap-3">
        {SOCIALS.map(({ name, href, Icon }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Icon className="size-5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
