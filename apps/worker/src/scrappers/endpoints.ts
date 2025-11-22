export type DealerSlug = 'NY_GOLD_CO' | 'BULLION_EXCHANGES' | 'NYC_BULLION';

export type ProductName =
  | '1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay'
  | '1-oz-gold-bar-pamp-suisse-lady-fortuna-veriscan-carbon-neutral-in-assay';

export const ENDPOINTS = {
  NY_GOLD_CO: {
    '1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay': {
      name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
      url: 'https://nygoldco.com/gold/gold-bars/1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay/',
    },
  },
  BULLION_EXCHANGES: {
    '1-oz-gold-bar-pamp-suisse-lady-fortuna-veriscan-carbon-neutral-in-assay': {
      name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
      url: 'https://bullionexchanges.com/1-oz-gold-bar-pamp-suisse-lady-fortuna-veriscan-carbon-neutral-in-assay',
    },
  },
  NYC_BULLION: {
    '1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay': {
      name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
      url: 'https://www.nycbullion.com/1-oz-gold-bar-pamp-fortuna-1pampf',
    },
  },
};
