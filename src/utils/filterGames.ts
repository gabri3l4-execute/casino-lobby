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
      const gb = (g as unknown as { blockedCurrencies?: string | string[] | null }).blockedCurrencies;
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

/**
 * Return set of tag ids present in the game list. Useful to populate category selector (includes ALL outside).
 */
export function getAvailableTagIds(allGames: Game[]): Set<number> {
  const s = new Set<number>();
  for (const g of allGames) {
    if (Array.isArray(g.gameTags)) {
      for (const t of g.gameTags) {
        s.add(t);
      }
    }
  }
  return s;
}

/**
 * Return a set of studioIds that have at least one game matching optional `tagId` and optional `effCurrency`.
 * - If `tagId` is null/undefined, matches any tag.
 * - If `effCurrency` is provided, games (and their studio) that are blocked for that currency are skipped.
 * This helps the UI restrict the studio dropdown to only studios that actually have games for the selected category/currency.
 */
export function getStudiosForTag(
  allGames: Game[],
  tagId?: number | null,
  effCurrency?: string,
  studioBlocked?: Map<number, Set<string>>
): Set<number> {
  const res = new Set<number>();
  const currency = effCurrency ? String(effCurrency).trim().toUpperCase() : "";

  for (const g of allGames) {
    if (tagId != null && Array.isArray(g.gameTags) && !g.gameTags.includes(tagId)) continue;

    if (currency) {
      // studio blocked map (external)
      const sBlocked = studioBlocked?.get(g.studioId);
      if (sBlocked && sBlocked.has(currency)) continue;

      // game-level blockedCurrencies
      const gb = (g as unknown as { blockedCurrencies?: string | string[] | null }).blockedCurrencies;
      if (gb) {
        const parts = parseBlockedString(gb);
        if (parts.has(currency)) continue;
      }
    }

    res.add(g.studioId);
  }

  return res;
}
