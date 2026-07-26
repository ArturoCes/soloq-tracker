export type RiotAccountDto = {
  puuid: string;
  gameName: string;
  tagLine: string;
};

export type RiotSummonerDto = {
  id?: string; // encrypted summoner id (legacy, may be absent on newer accounts)
  accountId?: string;
  puuid: string;
  profileIconId: number;
  summonerLevel: number;
};

export type RiotLeagueEntryDto = {
  leagueId: string;
  puuid: string;
  queueType: string; // e.g. RANKED_SOLO_5x5
  tier: string;
  rank: string; // division: I, II, III, IV
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
};

export type RiotMatchParticipantDto = {
  puuid: string;
  championName: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  teamPosition: string; // TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
  lane: string;
  pentaKills: number;
  quadraKills: number;
  tripleKills: number;
  doubleKills: number;
  totalDamageDealtToChampions: number;
  visionScore: number;
  goldEarned: number;
};

export type RiotMatchDto = {
  metadata: { matchId: string };
  info: {
    gameCreation: number;
    queueId: number;
    participants: RiotMatchParticipantDto[];
  };
};
