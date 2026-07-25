const FALLBACK_VERSION = "14.23.1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedVersion: { value: string; fetchedAt: number } | null = null;

/** Latest Data Dragon patch version, used to build CDN asset URLs (avatars, champion icons). */
export async function getLatestDDragonVersion(): Promise<string> {
  if (cachedVersion && Date.now() - cachedVersion.fetchedAt < CACHE_TTL_MS) {
    return cachedVersion.value;
  }
  try {
    const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json", {
      next: { revalidate: 3600 },
    });
    const versions = (await res.json()) as string[];
    const value = versions[0] ?? FALLBACK_VERSION;
    cachedVersion = { value, fetchedAt: Date.now() };
    return value;
  } catch {
    return cachedVersion?.value ?? FALLBACK_VERSION;
  }
}

export function profileIconUrl(version: string, profileIconId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`;
}

export function championIconUrl(version: string, championName: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
}
