export interface Game {
  id: number;
  name: string;
  imageUrl?: string;
  studioId: number;
  gameTags?: number[];
  translations?: any[];
  [k: string]: any;
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
  [k: string]: any;
}

export interface Tag {
  id: number;
  name: string;
  nameId?: string;
  display?: boolean;
  [k: string]: any;
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
  [k: string]: any;
}
