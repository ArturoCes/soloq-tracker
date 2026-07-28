export const TIER_LABEL_ES: Record<string, string> = {
  IRON: "Hierro",
  BRONZE: "Bronce",
  SILVER: "Plata",
  GOLD: "Oro",
  PLATINUM: "Platino",
  EMERALD: "Esmeralda",
  DIAMOND: "Diamante",
  MASTER: "Maestro",
  GRANDMASTER: "Gran Maestro",
  CHALLENGER: "Retador",
  UNRANKED: "Sin clasificar",
};

/** Tailwind text-color utility per tier, used for badges and highlights. */
export const TIER_COLOR: Record<string, string> = {
  IRON: "text-neutral-400",
  BRONZE: "text-amber-700",
  SILVER: "text-slate-300",
  GOLD: "text-yellow-400",
  PLATINUM: "text-teal-300",
  EMERALD: "text-emerald-400",
  DIAMOND: "text-sky-400",
  MASTER: "text-purple-400",
  GRANDMASTER: "text-rose-500",
  CHALLENGER: "text-amber-300",
  UNRANKED: "text-muted-foreground",
};

export function formatRank(tier: string | null | undefined, division: string | null | undefined): string {
  if (!tier) return TIER_LABEL_ES.UNRANKED;
  const label = TIER_LABEL_ES[tier] ?? tier;
  return division ? `${label} ${division}` : label;
}

const ROLE_LABEL_ES: Record<string, string> = {
  TOP: "Top",
  JUNGLE: "Jungla",
  MIDDLE: "Medio",
  BOTTOM: "ADC",
  UTILITY: "Soporte",
};

export function formatRole(role: string | null | undefined): string {
  if (!role) return "—";
  return ROLE_LABEL_ES[role] ?? role;
}

export function winrate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 1000) / 10;
}

/** The name to show first: the streamer's public alias if known, otherwise their Riot ID. */
export function displayName(player: { streamerName?: string | null; gameName: string }): string {
  return player.streamerName || player.gameName;
}
