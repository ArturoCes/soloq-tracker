import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchPlayers } from "@/lib/queries/players";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchPlayers(q);
  return NextResponse.json(
    results.map((p) => ({
      id: p.id,
      gameName: p.gameName,
      tagLine: p.tagLine,
      profileIconId: p.profileIconId,
      tier: p.tier,
      rankDivision: p.rankDivision,
      leaguePoints: p.leaguePoints,
    }))
  );
}
