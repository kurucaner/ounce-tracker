export interface ScraperResult {
  price: number;
  url: string;
  productName: string;
  inStock: boolean;
}

export interface ProductConfig {
  name: string;
  productUrl: string;
}

export interface DealerConfig {
  name: string;
  slug: string;
  url: string;
  products: ProductConfig[];
}

export type ScraperFunction = (
  productConfig: ProductConfig,
  baseUrl: string
) => Promise<ScraperResult>;
