import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { type ProductListingsResponse, type ProductListingItem } from '@/types/database';

/**
 * GET /api/pamp/lady-fortuna
 * Fetches all dealer listings for PAMP Suisse Lady Fortuna 1 oz Gold Bar
 */
export async function GET() {
  try {
    const supabase = createSupabaseClient();

    // Query to fetch all listings for the PAMP Lady Fortuna product
    const { data, error } = await supabase
      .from('dealer_listings')
      .select(
        `
        price,
        currency,
        in_stock,
        product_url,
        last_updated,
        products!inner (
          name,
          mint,
          metal
        ),
        dealers!inner (
          name,
          slug
        )
      `
      )
      .eq('products.name', '1 oz Gold Bar PAMP Suisse Lady Fortuna');
    console.log('data', data);

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        {
          success: false,
          data: [],
          error: error.message,
        } as ProductListingsResponse,
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
        } as ProductListingsResponse,
        { status: 200 }
      );
    }

    // Transform the data to match our API response type
    const listings: ProductListingItem[] = data.map((item) => ({
      dealerName: (item.dealers as unknown as { name: string }).name,
      dealerSlug: (item.dealers as unknown as { slug: string }).slug,
      price: item.price,
      currency: item.currency,
      inStock: item.in_stock,
      productUrl: item.product_url,
      lastUpdated: item.last_updated,
    }));

    // Sort by price (lowest first)
    listings.sort((a, b) => a.price - b.price);

    const response: ProductListingsResponse = {
      success: true,
      data: listings,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } as ProductListingsResponse,
      { status: 500 }
    );
  }
}
