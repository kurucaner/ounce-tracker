export type DealerSlug = 'NY_GOLD_CO' | 'BULLION_EXCHANGES' | 'NYC_BULLION';

export type ProductKeys = '1-oz-gold-bar-pamp-suisse-lady-fortuna';
export type ProductName = '1 oz Gold Bar PAMP Suisse Lady Fortuna';

interface ProductEndpoint {
  name: ProductName;
  url: string;
  productUrl: string;
}

export const ENDPOINTS: Record<DealerSlug, Record<ProductKeys, ProductEndpoint>> = {
  NY_GOLD_CO: {
    '1-oz-gold-bar-pamp-suisse-lady-fortuna': {
      name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
      url: 'https://nygoldco.com',
      productUrl: '/gold/gold-bars/1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay',
    },
  },
  BULLION_EXCHANGES: {
    '1-oz-gold-bar-pamp-suisse-lady-fortuna': {
      name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
      url: 'https://bullionexchanges.com',
      productUrl: '/1-oz-gold-bar-pamp-suisse-lady-fortuna-veriscan-carbon-neutral-in-assay',
    },
  },
  NYC_BULLION: {
    '1-oz-gold-bar-pamp-suisse-lady-fortuna': {
      name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
      url: 'https://www.nycbullion.com/1-oz-gold-bar-pamp-fortuna-1pampf',
      productUrl: '/1-oz-gold-bar-pamp-fortuna-1pampf',
    },
  },
};
