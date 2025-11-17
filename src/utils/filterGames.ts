import type { Game } from "../types/lobby";

export interface FilterContext {
  selectedCurrency?: string | null;
  selectedStudioId?: number | null;
  selectedTagId?: number | null;
  studioAllow?: Map<number, Set<string>>;
  studioBlocked?: Map<number, Set<string>>;
}

export function normalizeCurrency(v?: string | null) {
  return v ? String(v).trim().toUpperCase() : "";
}

export function parseBlockedString(raw?: string | string[] | null): Set<string> {
  const set = new Set<string>();
  if (!raw) return set;
  if (typeof raw === "string") {
    for (const part of raw.split(",")) {
      const p = part.trim();
      if (p) set.add(p.toUpperCase());
    }
    return set;
  }
  if (Array.isArray(raw)) {
    for (const part of raw) {
      const p = String(part).trim();
      if (p) set.add(p.toUpperCase());
    }
  }
  return set;
}

export function filterGames(allGames: Game[], ctx: FilterContext): Game[] {
  const { selectedCurrency, selectedStudioId, selectedTagId, studioAllow, studioBlocked } = ctx;
  const effCurrency = normalizeCurrency(selectedCurrency);

  return allGames.filter((g) => {
    if (selectedStudioId && g.studioId !== selectedStudioId) return false;
    if (selectedTagId != null && Array.isArray(g.gameTags) && !g.gameTags.includes(selectedTagId)) return false;

    if (effCurrency) {
      // studio blocked
      const sBlocked = studioBlocked?.get(g.studioId);
      if (sBlocked && sBlocked.has(effCurrency)) return false;

      // game-level blockedCurrencies (string or array)
      const gb = (g as any).blockedCurrencies;
      if (gb) {
        const parts = parseBlockedString(gb);
        if (parts.has(effCurrency)) return false;
      }

      // studio allowlist (if present, require membership)
      const allow = studioAllow?.get(g.studioId);
      if (allow && allow.size > 0 && !allow.has(effCurrency)) return false;
    }

    return true;
  });
}

export default filterGames;
