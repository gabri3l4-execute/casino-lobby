// no React hooks needed here
import { useQuery } from "@tanstack/react-query";
import type {
  Game,
  Studio,
  Tag,
  CurrencyEntry,
  LobbyData,
} from "../types/lobby";

export interface LobbyState {
  games: Game[];
  studios: Studio[];
  tags: Tag[];
  currencyEntries: CurrencyEntry[];
  currencies: string[];
  loading: boolean;
  error: string | null;
}

export function useLobbyData(fetchUrl?: string): LobbyState {
  const url =
    fetchUrl ||
    (import.meta.env.VITE_LOBBY_URL as string) ||
    "https://cubeia-code-tests.s3.eu-west-1.amazonaws.com/lobby.json";

  const { data, isLoading, error } = useQuery<LobbyData, Error>({
    queryKey: ["lobby", url],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch lobby data: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 60_000, // 1 min SWR
    cacheTime: 5 * 60_000, // 5 min
    refetchOnWindowFocus: false,
  });

  const games = data?.games ?? [];
  const studios = data?.studios ?? [];
  const tags = data?.tags ?? [];
  const currencyEntries = data?.currencies ?? [];

  // Flatten currencies
  const currencySet = new Set<string>();
  for (const entry of currencyEntries) {
    entry.currencies?.forEach((c) => currencySet.add(c));
  }

  const currencies = Array.from(currencySet).sort();

  return {
    games,
    studios,
    tags,
    currencyEntries,
    currencies,
    loading: isLoading,
    error: error ? error.message : null,
  };
}

export default useLobbyData;
