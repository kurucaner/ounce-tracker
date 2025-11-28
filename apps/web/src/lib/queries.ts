import type { ProductListingItem } from '@/types/database';

export interface Product {
  id: string;
  name: string;
  mint: string;
  metal: string;
  form: string;
  weight_oz: number;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
}

interface ListingsResponse {
  success: boolean;
  data: ProductListingItem[];
}

// Query Keys
export const queryKeys = {
  products: ['products'] as const,
  listings: (productId: string) => ['listings', productId] as const,
};

// Query Functions
export const queryFns = {
  products: async (): Promise<Product[]> => {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data: ProductsResponse = await response.json();

    if (data.success && data.products.length > 0) {
      localStorage.setItem('ounce-tracker-products', JSON.stringify(data.products));
    }
    return data.products || [];
  },

  listings: async (productId: string): Promise<ProductListingItem[]> => {
    const response = await fetch(`/api/listings?productId=${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }
    const data: ListingsResponse = await response.json();
    return data.data || [];
  },
};

// Query Options (optional - for common configurations)
export const queryOptions = {
  products: {
    staleTime: 5 * 60 * 1000, // 5 minutes - products don't change often
  },
  listings: {
    staleTime: 0, // 1 minute - prices change more frequently
  },
};
