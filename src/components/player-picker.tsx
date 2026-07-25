"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { formatRank } from "@/lib/ranks";

type Result = {
  id: string;
  gameName: string;
  tagLine: string;
  tier: string | null;
  rankDivision: string | null;
  leaguePoints: number;
};

export function PlayerPicker({ slot, label }: { slot: "a" | "b"; label: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) return;
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
      setResults(await res.json());
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function select(player: Result) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(slot, player.id);
    router.push(`/comparar?${params.toString()}`);
    setQuery(`${player.gameName}#${player.tagLine}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        placeholder={label}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && query.trim() && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-md">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => select(r)}
              >
                <span>
                  {r.gameName}#{r.tagLine}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRank(r.tier, r.rankDivision)} · {r.leaguePoints} LP
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
