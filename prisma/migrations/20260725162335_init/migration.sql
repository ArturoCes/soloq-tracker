-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "summonerId" TEXT,
    "profileIconId" INTEGER NOT NULL DEFAULT 0,
    "platform" TEXT NOT NULL DEFAULT 'euw1',
    "isUnofficial" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT,
    "rankDivision" TEXT,
    "leaguePoints" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "previousLp" INTEGER,
    "previousRankValue" INTEGER,
    "mainRole" TEXT,
    "avgKda" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LpHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "rankDivision" TEXT,
    "leaguePoints" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL DEFAULT 0,
    "updateLogId" TEXT,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LpHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LpHistory_updateLogId_fkey" FOREIGN KEY ("updateLogId") REFERENCES "UpdateLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "champion" TEXT NOT NULL,
    "win" BOOLEAN NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "role" TEXT,
    "lane" TEXT,
    "queueId" INTEGER NOT NULL DEFAULT 420,
    "gameCreation" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UpdateLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'running',
    "playersUpdated" INTEGER NOT NULL DEFAULT 0,
    "playersFailed" INTEGER NOT NULL DEFAULT 0,
    "triggeredBy" TEXT NOT NULL DEFAULT 'admin'
);

-- CreateTable
CREATE TABLE "ApiError" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "updateLogId" TEXT,
    "playerId" TEXT,
    "endpoint" TEXT NOT NULL,
    "statusCode" INTEGER,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiError_updateLogId_fkey" FOREIGN KEY ("updateLogId") REFERENCES "UpdateLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ApiError_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Config" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_puuid_key" ON "Player"("puuid");

-- CreateIndex
CREATE INDEX "Player_leaguePoints_idx" ON "Player"("leaguePoints");

-- CreateIndex
CREATE UNIQUE INDEX "Player_gameName_tagLine_platform_key" ON "Player"("gameName", "tagLine", "platform");

-- CreateIndex
CREATE INDEX "LpHistory_playerId_capturedAt_idx" ON "LpHistory"("playerId", "capturedAt");

-- CreateIndex
CREATE INDEX "MatchHistory_playerId_gameCreation_idx" ON "MatchHistory"("playerId", "gameCreation");

-- CreateIndex
CREATE UNIQUE INDEX "MatchHistory_playerId_matchId_key" ON "MatchHistory"("playerId", "matchId");
