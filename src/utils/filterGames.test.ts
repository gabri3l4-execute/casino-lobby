import { describe, it, expect } from "vitest";
import { filterGames } from "./filterGames";
import type { Game } from "../types/lobby";

describe("filterGames", () => {
  const games: Game[] = [
    { id: 1, name: "A", studioId: 10, gameTags: [1] },
    { id: 2, name: "B", studioId: 11, gameTags: [1], blockedCurrencies: "EUR" },
    { id: 3, name: "C", studioId: 10, gameTags: [2] },
    { id: 4, name: "D", studioId: 12, gameTags: [1], blockedCurrencies: ["USD"] },
  ];

  it("allows all games when no currency selected", () => {
    const res = filterGames(games, { selectedCurrency: "", studioAllow: new Map(), studioBlocked: new Map() });
    expect(res.map((g) => g.id)).toEqual([1, 2, 3, 4]);
  });

  it("filters out games when studio blocks the currency", () => {
    const studioBlocked = new Map<number, Set<string>>([[10, new Set(["EUR"])]]);
    const res = filterGames(games, { selectedCurrency: "EUR", studioBlocked });
    // games from studio 10 (id 1 and 3) should be filtered out because studio 10 blocks EUR
    // game 2 also blocks EUR at game-level, so it's removed as well; only game 4 remains
    expect(res.map((g) => g.id)).toEqual([4]);
  });

  it("filters out games when game blocks the currency (string)", () => {
    const res = filterGames(games, { selectedCurrency: "EUR" });
    // game 2 blocks EUR explicitly, so removed; others allowed
    expect(res.map((g) => g.id)).toEqual([1, 3, 4]);
  });

  it("filters out games when game blocks the currency (array)", () => {
    const res = filterGames(games, { selectedCurrency: "USD" });
    // game 4 blocks USD via array, so removed
    expect(res.map((g) => g.id)).toEqual([1, 2, 3]);
  });

  it("respects studio allowlist when present", () => {
    const studioAllow = new Map<number, Set<string>>([[10, new Set(["USD"])], [11, new Set(["EUR"])]]);
    const res = filterGames(games, { selectedCurrency: "EUR", studioAllow });
    // studio 10 allowlist doesn't include EUR -> games 1 and 3 removed; studio 11 allows EUR but game 2 blocks EUR itself -> removed
    // studio 12 has no allowlist -> game 4 stays
    expect(res.map((g) => g.id)).toEqual([4]);
  });
});
