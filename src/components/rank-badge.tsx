import { cn } from "@/lib/utils";
import { formatRank, TIER_COLOR } from "@/lib/ranks";

export function RankBadge({
  tier,
  division,
  className,
}: {
  tier: string | null | undefined;
  division: string | null | undefined;
  className?: string;
}) {
  const color = TIER_COLOR[tier ?? "UNRANKED"] ?? TIER_COLOR.UNRANKED;
  return (
    <span className={cn("text-sm font-medium", color, className)}>
      {formatRank(tier, division)}
    </span>
  );
}
