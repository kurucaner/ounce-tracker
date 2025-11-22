/**
 * Database types for Supabase tables
 */

export interface Product {
  id: string;
  name: string;
  mint: string;
  metal: string;
  created_at?: string;
  updated_at?: string;
}

export interface Dealer {
  id: string;
  name: string;
  slug: string;
  website_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DealerListing {
  id: string;
  dealer_id: string;
  product_id: string;
  price: number;
  currency: string;
  in_stock: boolean;
  product_url: string;
  last_updated: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * API response types
 */

export interface ProductListingItem {
  dealerName: string;
  dealerSlug: string;
  price: number;
  currency: string;
  inStock: boolean;
  productUrl: string;
  updatedAt: string;
}

export interface ProductListingsResponse {
  success: boolean;
  data: ProductListingItem[];
  error?: string;
}
