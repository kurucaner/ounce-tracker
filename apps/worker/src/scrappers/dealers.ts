import type { DealerConfig } from '../types';

export type DealerSlug =
  | 'new-york-gold-co'
  | 'bullion-exchanges'
  | 'nyc-bullion'
  | 'bullion-trading-llc'
  | 'jm-bullion'
  | 'apmex'
  | 'sd-bullion'
  | 'bgasc'
  | 'pimbex';

export const DEALERS: DealerConfig[] = [
  {
    name: 'New York Gold Co',
    slug: 'new-york-gold-co',
    url: 'https://nygoldco.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/gold/gold-bars/1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay',
      },
      {
        name: '1 oz Gold Bar Royal Canadian Mint',
        productUrl: '/gold/gold-bars/1-oz-gold-bar-royal-canadian-mint-new-style-in-assay',
      },
      {
        name: '1 oz Gold Bar Perth Mint',
        productUrl: '/gold/gold-bars/1-oz-gold-bar-perth-mint-in-assay',
      },
    ],
  },
  {
    name: 'Bullion Exchanges',
    slug: 'bullion-exchanges',
    url: 'https://bullionexchanges.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/1-oz-gold-bar-pamp-suisse-lady-fortuna-veriscan-carbon-neutral-in-assay',
      },
      {
        name: '1 oz Gold Bar Royal Canadian Mint',
        productUrl: '/1-oz-gold-wafer-bar-rcm-in-assay-random-year',
      },
      {
        name: '1 oz Gold Bar Perth Mint',
        productUrl: '/1-oz-perth-mint-gold-bar-in-assay',
      },
    ],
  },
  {
    name: 'NYC Bullion',
    slug: 'nyc-bullion',
    url: 'https://www.nycbullion.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/1-oz-gold-bar-pamp-fortuna-1pampf',
      },
      // {
      //   name: '1 oz Gold Bar Royal Canadian Mint',
      //   productUrl: '',
      // },
      {
        name: '1 oz Gold Bar Perth Mint',
        productUrl: '/1-oz-gold-bar-perth-1perth',
      },
    ],
  },
  {
    name: 'Bullion Trading LLC',
    slug: 'bullion-trading-llc',
    url: 'https://bulliontradingllc.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/product/1-oz-pamp-suisse-gold-bar-lady-fortuna-in-assay',
      },
      {
        name: '1 oz Gold Bar Royal Canadian Mint',
        productUrl: '/product/royal-canadian-mint-1-oz-gold-bar-classic-assay',
      },
      {
        name: '1 oz Gold Bar Perth Mint',
        productUrl: '/product/1-oz-gold-bar-perth-mint-in-assay',
      },
    ],
  },
  {
    name: 'JM Bullion',
    slug: 'jm-bullion',
    url: 'https://www.jmbullion.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/1-oz-pamp-suisse-gold-bar-carbon-neutral',
      },
      {
        name: '1 oz Gold Bar Royal Canadian Mint',
        productUrl: '/1-oz-rcm-gold-bar-proudly-canadian-assay',
      },
      {
        name: '1 oz Gold Bar Perth Mint',
        productUrl: '/1-oz-perth-mint-gold-bar',
      },
    ],
  },
  {
    name: 'APMEX',
    slug: 'apmex',
    url: 'https://www.apmex.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/product/82236/1-oz-gold-bar-pamp-lady-fortuna-veriscan-in-assay',
      },
      {
        name: '1 oz Gold Bar Royal Canadian Mint',
        productUrl: '/product/98353/1-oz-gold-bar-royal-canadian-mint-new-design-in-assay',
      },
      {
        name: '1 oz Gold Bar Perth Mint',
        productUrl: '/product/57159/1-oz-gold-bar-perth-mint-in-assay',
      },
    ],
  },
  {
    name: 'SD Bullion',
    slug: 'sd-bullion',
    url: 'https://www.sdbullion.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/new-1-oz-pamp-suisse-gold-bar',
      },
      // {
      //   name: '1 oz Gold Bar Royal Canadian Mint',
      //   productUrl: '/new-1-oz-rcm-gold-bar',
      // },
      // {
      //   name: '1 oz Gold Bar Perth Mint',
      //   productUrl: '/new-1-oz-perth-mint-gold-bar',
      // },
    ],
  },
  {
    name: 'BGASC',
    slug: 'bgasc',
    url: 'https://www.bgasc.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/product/1-oz-pamp-suisse-gold-bar-carbon-neutral',
      },
      {
        name: '1 oz Gold Bar Royal Canadian Mint',
        productUrl: '/product/1-oz-rcm-gold-bar-w-proudly-canadian',
      },
      {
        name: '1 oz Gold Bar Perth Mint',
        productUrl: '/product/1-oz-perth-mint-gold-bar',
      },
    ],
  },
  {
    name: 'Pimbex',
    slug: 'pimbex',
    url: 'https://www.pimbex.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/purchase-bullion/1-oz-gold-bar-pamp-fortuna',
      },
      // {
      //   name: '1 oz Gold Bar Royal Canadian Mint',
      //   productUrl: '/purchase-bullion/1-oz-gold-bar-rcm-proudly-canadian/',
      // },
      {
        name: '1 oz Gold Bar Perth Mint',
        productUrl: '/purchase-bullion/1-oz-gold-bar-perth-mint',
      },
    ],
  },
];
