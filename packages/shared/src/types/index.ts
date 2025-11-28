/**
 * Shared types for the OunceTracker application
 */

/**
 * Precious metals supported by the application
 */
export enum Metal {
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  PLATINUM = 'PLATINUM',
  PALLADIUM = 'PALLADIUM',
}

/**
 * Product interface representing a bullion product
 */
export interface Product {
  id: string;
  dealerId: string;
  name: string;
  metal: Metal;
  weight: number; // in troy ounces
  price: number; // in USD
  pricePerOunce: number; // calculated price per ounce
  imageUrl?: string;
  productUrl: string;
  inStock: boolean;
  lastUpdated: Date;
  premium: number; // percentage over spot price
}

/**
 * Dealer interface representing a bullion dealer
 */
export interface Dealer {
  id: string;
  name: string;
  websiteUrl: string;
  logoUrl?: string;
  isActive: boolean;
  lastScraped?: Date;
  scrapingEnabled: boolean;
}

/**
 * Spot price interface for precious metals
 */
export interface SpotPrice {
  metal: Metal;
  price: number; // price per troy ounce in USD
  timestamp: Date;
  source: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

/**
 * Pagination interface
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}
