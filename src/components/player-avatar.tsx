import Image from "next/image";
import { cn } from "@/lib/utils";
import { profileIconUrl } from "@/lib/riot/ddragon";

export function PlayerAvatar({
  ddragonVersion,
  profileIconId,
  size = 40,
  className,
}: {
  ddragonVersion: string;
  profileIconId: number;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={profileIconUrl(ddragonVersion, profileIconId || 29)}
      alt=""
      width={size}
      height={size}
      className={cn("rounded-full border border-border/60", className)}
    />
  );
}
