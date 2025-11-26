import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClient();

    // Fetch all products that have dealer listings
    const { data, error } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        mint,
        metal,
        form,
        weight_oz
      `
      )
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sort products to put "1 oz Gold Bar PAMP Suisse Lady Fortuna" at the top
    const products = (data || []).sort((a, b) => {
      const targetProduct = '1 oz Gold Bar PAMP Suisse Lady Fortuna';
      if (a.name === targetProduct) return -1;
      if (b.name === targetProduct) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
