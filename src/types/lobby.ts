export interface Game {
  id: number;
  name: string;
  imageUrl?: string;
  image?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  studioId: number;
  gameTags?: number[];
  translations?: unknown[];
  [k: string]: unknown;
}

export interface Studio {
  id: number;
  name: string;
  externalId?: string;
  integration?: string;
  enabled?: boolean;
  imageUrl?: string;
  blockedCountries?: string;
  blockedCurrencies?: string;
  [k: string]: unknown;
}

export interface Tag {
  id: number;
  name: string;
  nameId?: string;
  display?: boolean;
  [k: string]: unknown;
}

export interface CurrencyEntry {
  integration?: string;
  currencies: string[];
  studioId: number;
}

export interface LobbyData {
  games: Game[];
  studios: Studio[];
  tags: Tag[];
  currencies: CurrencyEntry[];
  [k: string]: unknown;
}
