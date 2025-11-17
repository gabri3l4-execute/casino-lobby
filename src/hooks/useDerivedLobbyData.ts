import { useMemo } from "react";
import type { Game, Studio, CurrencyEntry } from "../types/lobby";
import filterGames from "../utils/filterGames";

export interface DerivedParams {
  games: Game[];
  studios: Studio[];
  currencyEntries: CurrencyEntry[];
  selectedTagId: number | null;
  selectedStudioId: number | null;
  selectedCurrencyEffective: string | null;
}

export default function useDerivedLobbyData({
  games,
  studios,
  currencyEntries,
  selectedTagId,
  selectedStudioId,
  selectedCurrencyEffective,
}: DerivedParams) {
  // Build an allowlist map from studioId -> Set(UPPERCASED currency codes)
  const studioCurrencyAllowlist = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const entry of currencyEntries || []) {
      const sid = entry.studioId;
      const list = new Set<string>();
      for (const c of entry.currencies || []) {
        if (typeof c === "string") list.add(c.toUpperCase());
      }
      map.set(sid, list);
    }
    return map;
  }, [currencyEntries]);

  // Build a blocked-currencies map from studioId -> Set(UPPERCASED currency codes)
  const studioBlockedCurrencies = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const s of studios || []) {
      const set = new Set<string>();
      const raw = (s.blockedCurrencies ?? "") as unknown as string;
      if (typeof raw === "string" && raw.trim().length > 0) {
        for (const part of raw.split(",")) {
          const v = part.trim();
          if (v) set.add(v.toUpperCase());
        }
      }
      map.set(s.id, set);
    }
    return map;
  }, [studios]);

  // Derive visible studios from the set of games that would be visible for the
  // current tag+currency selection. This guarantees the studio dropdown only
  // contains studios that actually have games matching those filters.
  const visibleStudios = useMemo(() => {
    const effCurrency = selectedCurrencyEffective || "";

    // Use the utility filter to get games matching tag+currency, but do not
    // pass `selectedStudioId` so we don't pre-filter studios based on an
    // already-selected studio.
    const gamesForStudios = filterGames(games || [], {
      selectedCurrency: effCurrency,
      selectedTagId: selectedTagId ?? null,
      selectedStudioId: null,
      studioAllow: studioCurrencyAllowlist,
      studioBlocked: studioBlockedCurrencies,
    });

    // If no tag and no currency, return all studios
    if (selectedTagId === null && !effCurrency) return studios;

    const studioIds = new Set<number>();
    for (const g of gamesForStudios) studioIds.add(g.studioId);

    return studios.filter((s) => studioIds.has(s.id));
  }, [studios, games, selectedTagId, selectedCurrencyEffective, studioCurrencyAllowlist, studioBlockedCurrencies]);

  const filteredGames = useMemo(() => {
    return filterGames(games || [], {
      selectedCurrency: selectedCurrencyEffective ?? null,
      selectedStudioId: selectedStudioId ?? null,
      selectedTagId: selectedTagId ?? null,
      studioAllow: studioCurrencyAllowlist,
      studioBlocked: studioBlockedCurrencies,
    });
  }, [games, selectedTagId, selectedStudioId, selectedCurrencyEffective, studioCurrencyAllowlist, studioBlockedCurrencies]);

  return {
    visibleStudios,
    studioCurrencyAllowlist,
    studioBlockedCurrencies,
    filteredGames,
  };
}
