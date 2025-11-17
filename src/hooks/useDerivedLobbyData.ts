import { useMemo } from "react";
import type { Game, Studio, CurrencyEntry } from "../types/lobby";

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

  // Only show studios that have games in the selected category (if a category is selected)
  const visibleStudios = useMemo(() => {
    // If no tag selected and no currency restriction, return all studios
    const currency = selectedCurrencyEffective
      ? selectedCurrencyEffective.toUpperCase().trim()
      : "";

    if (selectedTagId === null && !currency) return studios;

    const studioIds = new Set<number>();

    for (const g of games) {
      // tag filtering (if selected)
      if (selectedTagId !== null) {
        if (!Array.isArray(g.gameTags) || !g.gameTags.includes(selectedTagId)) continue;
      }

      // currency filtering (if selected)
      if (currency) {
        // external studio blocked map
        const sBlocked = studioBlockedCurrencies.get(g.studioId);
        if (sBlocked && sBlocked.has(currency)) continue;

        // game-level blocked currencies
        const gb = (g as unknown as { blockedCurrencies?: string | string[] | null }).blockedCurrencies;
        if (gb) {
          const parts = new Set<string>();
          if (typeof gb === "string") {
            for (const part of gb.split(",")) {
              const p = String(part).trim().toUpperCase();
              if (p) parts.add(p);
            }
          } else if (Array.isArray(gb)) {
            for (const p of gb) parts.add(String(p).trim().toUpperCase());
          }
          if (parts.has(currency)) continue;
        }

        // studio allowlist: if present and non-empty, require membership
        const allow = studioCurrencyAllowlist.get(g.studioId);
        if (allow && allow.size > 0 && !allow.has(currency)) continue;
      }

      studioIds.add(g.studioId);
    }

    return studios.filter((s) => studioIds.has(s.id));
  }, [studios, games, selectedTagId, selectedCurrencyEffective, studioBlockedCurrencies, studioCurrencyAllowlist]);

  const filteredGames = useMemo(() => {
    return games.filter((g: Game) => {
      // studio filter
      if (selectedStudioId && g.studioId !== selectedStudioId) return false;

      // category/tag filter
      if (
        selectedTagId !== null &&
        Array.isArray(g.gameTags) &&
        !g.gameTags.includes(selectedTagId)
      )
        return false;

      // currency allowlist: if we have an allowlist for the studio, require the selected currency
      const effCurrency = selectedCurrencyEffective;
      if (effCurrency) {
        const effUpper = effCurrency.toUpperCase();
        // studio-level blocked currencies
        const blockedStudio = studioBlockedCurrencies.get(g.studioId);
        if (blockedStudio && blockedStudio.has(effUpper)) return false;

        // game-level blocked currencies (games may contain a comma-separated string or array)
        type GameWithBlocked = Game & { blockedCurrencies?: string | string[] };
        const gb = (g as GameWithBlocked).blockedCurrencies;
        if (gb) {
          if (typeof gb === "string") {
            const parts = gb.split(",").map((p: string) => p.trim().toUpperCase()).filter(Boolean);
            if (parts.includes(effUpper)) return false;
          } else if (Array.isArray(gb)) {
            const parts = gb.map((p) => String(p).toUpperCase());
            if (parts.includes(effUpper)) return false;
          }
        }

        const allow = studioCurrencyAllowlist.get(g.studioId);
        if (allow && allow.size > 0 && !allow.has(effUpper)) return false;
      }

      return true;
    });
  }, [games, selectedTagId, selectedStudioId, selectedCurrencyEffective, studioCurrencyAllowlist, studioBlockedCurrencies]);

  return {
    visibleStudios,
    studioCurrencyAllowlist,
    studioBlockedCurrencies,
    filteredGames,
  };
}
