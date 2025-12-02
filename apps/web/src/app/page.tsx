import { DealersListing } from '@/components/home/dealers-listing';
import { HomeStructuredData } from '@/components/home/home-structured-data';
import { InformativeSections } from '@/components/home/informative-sections';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Suspense } from 'react';

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = createSupabaseServerClient();

    // Fetch products count and dealers count for dynamic description
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: dealersCount } = await supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true });

    const products = productsCount || 3;
    const dealers = dealersCount || 4;

    const title = 'OunceTracker - Compare Precious Metal Prices | Gold & Silver Bullion';
    const description = `Compare prices for ${products}+ precious metal products from ${dealers} trusted bullion dealers. Find the best prices on gold bars, silver coins, and more. Real-time price comparison updated every minute.`;

    const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';

    return {
      title,
      description,
      keywords: [
        'precious metals',
        'gold prices',
        'silver prices',
        'bullion prices',
        'gold bars',
        'silver coins',
        'precious metal comparison',
        'bullion dealers',
        'gold price tracker',
        'silver price tracker',
        'best gold prices',
        'best silver prices',
        'compare bullion prices',
        'PAMP Suisse',
        'Royal Canadian Mint',
        'gold bar prices',
        'silver coin prices',
        'nyc bullion',
        'bullion trading llc',
        'new york gold co',
        'bullion exchanges',
        'gold coin prices',
        'silver bar prices',
      ],
      authors: [{ name: 'OunceTracker' }],
      creator: 'OunceTracker',
      publisher: 'OunceTracker',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL(url),
      alternates: {
        canonical: '/',
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url,
        siteName: 'OunceTracker',
        title,
        description,
      },
      twitter: {
        card: 'summary',
        title,
        description,
        creator: '@ouncetracker',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    // Fallback metadata
    return {
      title: 'OunceTracker - Compare Precious Metal Prices',
      description:
        'Compare prices for precious metal products from trusted bullion dealers. Find the best prices on gold bars, silver coins, and more.',
    };
  }
}

const HeroSection = () => {
  return (
    <div className="mx-auto px-4 pt-8 sm:px-6 sm:pt-12 bg-muted/40">
      <h1 className="text-center !text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        Compare Precious Metal Prices
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-base text-muted-foreground sm:text-lg">
        Find the best prices on gold bars, silver coins, and more from trusted bullion dealers
      </p>
    </div>
  );
};

export default async function HomePage() {
  // Fetch products for structured data
  let products: Array<{
    id: string;
    name: string;
    mint: string;
    metal: string;
    form: string;
    weight_oz: number;
  }> = [];
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('products')
      .select('id, name, mint, metal, form, weight_oz')
      .limit(10); // Limit for structured data

    // Filter out products with null form or weight_oz
    products =
      data?.filter(
        (
          p
        ): p is {
          id: string;
          name: string;
          mint: string;
          metal: string;
          form: string;
          weight_oz: number;
        } => p.form !== null && p.weight_oz !== null
      ) || [];
  } catch (error) {
    console.error('Error fetching products for structured data:', error);
    products = [];
  }

  return (
    <>
      <HomeStructuredData products={products} />
      <HeroSection />
      <Suspense>
        <DealersListing />
      </Suspense>
      <InformativeSections />
    </>
  );
}
