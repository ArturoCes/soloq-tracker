/** Riot platform routing values, grouped by their regional routing (used for Account-V1 / Match-V5). */
export const PLATFORM_TO_REGION: Record<string, "americas" | "europe" | "asia" | "sea"> = {
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  oc1: "sea",
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
  kr: "asia",
  jp1: "asia",
};

export const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_TO_REGION);

export function regionalRoutingFor(platform: string) {
  const region = PLATFORM_TO_REGION[platform];
  if (!region) {
    throw new Error(`Unknown Riot platform routing value: "${platform}"`);
  }
  return region;
}

/** Ordered from lowest to highest, used to compute rank deltas across tiers/divisions. */
export const TIER_ORDER = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
] as const;

export const DIVISION_ORDER = ["IV", "III", "II", "I"] as const;

const APEX_TIERS = new Set(["MASTER", "GRANDMASTER", "CHALLENGER"]);

/**
 * Converts a tier + division + LP into a single comparable integer so that
 * a player's overall rank progress can be diffed across updates even when
 * they cross a tier or division boundary.
 */
export function rankValue(tier: string, division: string | null, leaguePoints: number): number {
  const tierIndex = TIER_ORDER.indexOf(tier.toUpperCase() as (typeof TIER_ORDER)[number]);
  const safeTierIndex = tierIndex === -1 ? 0 : tierIndex;

  if (APEX_TIERS.has(tier.toUpperCase())) {
    return safeTierIndex * 400 + leaguePoints;
  }

  const divisionIndex = division
    ? DIVISION_ORDER.indexOf(division.toUpperCase() as (typeof DIVISION_ORDER)[number])
    : 0;
  const safeDivisionIndex = divisionIndex === -1 ? 0 : divisionIndex;

  return safeTierIndex * 400 + safeDivisionIndex * 100 + leaguePoints;
}
