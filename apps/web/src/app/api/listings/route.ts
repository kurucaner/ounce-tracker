import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import type { ProductListingItem } from '@/types/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('dealer_listings')
      .select(
        `
        price,
        currency,
        in_stock,
        product_url,
        updated_at,
        dealers (name, slug, website_url)
      `
      )
      .eq('product_id', productId);

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Transform the data to match our API response type
    const listings: ProductListingItem[] = data.map((item) => ({
      dealerName: (item.dealers as unknown as { name: string }).name,
      dealerSlug: (item.dealers as unknown as { slug: string }).slug,
      dealerWebsiteUrl: (item.dealers as unknown as { website_url: string }).website_url || '#',
      price: item.price,
      currency: item.currency,
      inStock: item.in_stock,
      productUrl: item.product_url,
      updatedAt: item.updated_at,
    }));

    // Sort: in-stock items first, then by price (lowest first)
    listings.sort((a, b) => {
      // First, sort by stock status (in stock items first)
      if (a.inStock !== b.inStock) {
        return a.inStock ? -1 : 1;
      }
      // If stock status is the same, sort by price (lowest first)
      return a.price - b.price;
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
