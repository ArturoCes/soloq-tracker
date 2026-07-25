import { riotRateLimiter } from "./rate-limiter";
import { regionalRoutingFor } from "./regions";
import type {
  RiotAccountDto,
  RiotLeagueEntryDto,
  RiotMatchDto,
  RiotSummonerDto,
} from "./types";

export class RiotApiError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "RiotApiError";
  }
}

function apiKey(): string {
  const key = process.env.RIOT_API_KEY;
  if (!key) {
    throw new RiotApiError("RIOT_API_KEY is not set", "config");
  }
  return key;
}

/** Fetches from the Riot API, queued through the rate limiter, with retry on 429/5xx. */
async function riotFetch<T>(url: string, endpointLabel: string, attempt = 0): Promise<T> {
  const MAX_ATTEMPTS = 4;

  return riotRateLimiter.schedule(async () => {
    const res = await fetch(url, {
      headers: { "X-Riot-Token": apiKey() },
      cache: "no-store",
    });

    if (res.status === 429 || res.status >= 500) {
      if (attempt >= MAX_ATTEMPTS - 1) {
        throw new RiotApiError(
          `Riot API failed after ${MAX_ATTEMPTS} attempts (status ${res.status})`,
          endpointLabel,
          res.status
        );
      }
      const retryAfterHeader = res.headers.get("Retry-After");
      const retryAfterMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : 500 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, retryAfterMs));
      return riotFetch<T>(url, endpointLabel, attempt + 1);
    }

    if (res.status === 404) {
      throw new RiotApiError("Not found", endpointLabel, 404);
    }

    if (!res.ok) {
      throw new RiotApiError(
        `Riot API error: ${res.status} ${res.statusText}`,
        endpointLabel,
        res.status
      );
    }

    return (await res.json()) as T;
  });
}

export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  platform: string
): Promise<RiotAccountDto> {
  const region = regionalRoutingFor(platform);
  const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch<RiotAccountDto>(url, "account-by-riot-id");
}

export async function getSummonerByPuuid(
  puuid: string,
  platform: string
): Promise<RiotSummonerDto> {
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotFetch<RiotSummonerDto>(url, "summoner-by-puuid");
}

export async function getLeagueEntriesByPuuid(
  puuid: string,
  platform: string
): Promise<RiotLeagueEntryDto[]> {
  const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  return riotFetch<RiotLeagueEntryDto[]>(url, "league-entries-by-puuid");
}

export async function getMatchIdsByPuuid(
  puuid: string,
  platform: string,
  count = 10
): Promise<string[]> {
  const region = regionalRoutingFor(platform);
  const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=${count}`;
  return riotFetch<string[]>(url, "match-ids-by-puuid");
}

export async function getMatchById(
  matchId: string,
  platform: string
): Promise<RiotMatchDto> {
  const region = regionalRoutingFor(platform);
  const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  return riotFetch<RiotMatchDto>(url, "match-by-id");
}
