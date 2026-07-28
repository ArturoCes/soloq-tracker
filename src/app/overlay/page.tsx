import { prisma } from "@/lib/db";
import { getLatestDDragonVersion } from "@/lib/riot/ddragon";
import { displayName, winrate } from "@/lib/ranks";
import { PlayerAvatar } from "@/components/player-avatar";
import { RankBadge } from "@/components/rank-badge";
import { DeltaBadge } from "@/components/delta-badge";
import { AutoReload } from "@/components/auto-reload";

export const dynamic = "force-dynamic";

export default async function OverlayPage() {
  const [player, ddragonVersion] = await Promise.all([
    prisma.player.findFirst({
      where: { isUnofficial: true },
      include: { lpHistory: { orderBy: { capturedAt: "desc" }, take: 1 } },
    }),
    getLatestDDragonVersion(),
  ]);

  return (
    <div className="p-4">
      <AutoReload seconds={60} />
      {player ? (
        <div className="flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-black/60 px-4 py-3 shadow-lg backdrop-blur-sm">
          <PlayerAvatar ddragonVersion={ddragonVersion} profileIconId={player.profileIconId} size={48} />
          <div>
            <p className="font-semibold text-white">
              {displayName(player)}
              <span className="ml-1 text-sm font-normal text-white/60">
                {player.gameName}#{player.tagLine}
              </span>
            </p>
            <div className="flex items-center gap-2 text-sm">
              <RankBadge tier={player.tier} division={player.rankDivision} />
              <span className="text-white/70">{player.leaguePoints} LP</span>
              <DeltaBadge delta={player.lpHistory[0]?.delta ?? 0} />
            </div>
            <p className="text-xs text-white/50">
              {player.wins}V {player.losses}D · {winrate(player.wins, player.losses)}% WR
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/60">Configura tu cuenta no oficial en /admin.</p>
      )}
    </div>
  );
}
