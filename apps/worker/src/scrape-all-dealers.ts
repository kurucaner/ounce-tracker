/**
 * Generic Scraper Orchestrator
 * Fetches live prices from all dealers for all products and updates Supabase
 */
import { createClient } from '@supabase/supabase-js';
import { DEALERS } from './scrappers/endpoints';
import { scrapeNYGoldCo } from './scrappers/scrape-new-york-gold-co';
import { scrapeBullionExchanges } from './scrappers/scrape-bullion-exchanges';
import { scrapeNYCBullion } from './scrappers/scrape-nyc-bullion';
import { scrapeBullionTradingLLC } from './scrappers/scrape-bullion-trading-llc';
import type { ScraperFunction, ScraperResult, DealerConfig, ProductConfig } from './types';

// Initialize Supabase client with service role key
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

// Map dealer slugs to their scraper functions
const SCRAPER_MAP: Record<string, ScraperFunction> = {
  'new-york-gold-co': scrapeNYGoldCo,
  'bullion-exchanges': scrapeBullionExchanges,
  'nyc-bullion': scrapeNYCBullion,
  'bullion-trading-llc': scrapeBullionTradingLLC,
};

/**
 * Update dealer listing in Supabase
 */
async function updateListingPrice(
  dealerSlug: string,
  productName: string,
  price: number,
  productUrl: string
): Promise<void> {
  try {
    // Get dealer ID
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', dealerSlug)
      .single();

    if (dealerError || !dealer) {
      throw new Error(`Dealer not found: ${dealerSlug}`);
    }

    // Get product ID
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('name', productName)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${productName}`);
    }

    // Update dealer listing
    const { error: updateError } = await supabase
      .from('dealer_listings')
      .upsert({
        dealer_id: dealer.id,
        product_id: product.id,
        currency: 'USD',
        in_stock: true,
        price,
        product_url: productUrl,
      })
      .eq('dealer_id', dealer.id)
      .eq('product_id', product.id);

    if (updateError) {
      throw new Error(`Failed to update listing: ${updateError.message}`);
    }

    console.log(`💾 Updated ${dealerSlug} - ${productName}: $${price.toFixed(2)}`);
  } catch (error) {
    console.error(`❌ Failed to update ${dealerSlug} - ${productName}:`, error);
    throw error;
  }
}

/**
 * Scrape a single product for a dealer
 */
async function scrapeProduct(
  dealer: DealerConfig,
  product: ProductConfig,
  scraperFn: ScraperFunction
): Promise<ScraperResult | null> {
  try {
    const result = await scraperFn(product, dealer.url);
    await updateListingPrice(dealer.slug, product.name, result.price, result.url);
    return result;
  } catch (error) {
    console.error(`⚠️  Skipping ${dealer.name} - ${product.name} due to error:`, error);
    return null;
  }
}

/**
 * Scrape all products for a dealer
 */
async function scrapeDealer(dealer: DealerConfig): Promise<Record<string, number>> {
  console.log(`\n🏢 Scraping ${dealer.name}...`);

  const scraperFn = SCRAPER_MAP[dealer.slug];
  if (!scraperFn) {
    console.error(`❌ No scraper function found for dealer: ${dealer.slug}`);
    return {};
  }

  const results: Record<string, number> = {};

  for (const product of dealer.products) {
    const result = await scrapeProduct(dealer, product, scraperFn);
    if (result) {
      results[product.name] = result.price;
    }
  }

  return results;
}

/**
 * Main execution
 */
async function run(): Promise<void> {
  console.log('🚀 Starting multi-product scraper for all dealers...\n');

  // Validate environment variables
  if (!process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  try {
    const allResults: Record<string, Record<string, number>> = {};

    // Scrape each dealer
    for (const dealer of DEALERS) {
      const dealerResults = await scrapeDealer(dealer);
      if (Object.keys(dealerResults).length > 0) {
        allResults[dealer.slug] = dealerResults;
      }
    }

    // Summary
    console.log('\n✅ Scraping completed!');
    console.log('📊 Updated prices:');

    for (const [dealerSlug, products] of Object.entries(allResults)) {
      console.log(`\n  ${dealerSlug}:`);
      for (const [productName, price] of Object.entries(products)) {
        console.log(`    - ${productName}: $${price.toFixed(2)}`);
      }
    }

    const totalUpdates = Object.values(allResults).reduce(
      (sum, products) => sum + Object.keys(products).length,
      0
    );

    console.log(`\n📈 Total listings updated: ${totalUpdates}`);

    if (totalUpdates === 0) {
      throw new Error('All scrapers failed');
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the scraper (top-level await)
await run();
