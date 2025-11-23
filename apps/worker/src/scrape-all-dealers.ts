/**
 * Generic Scraper Orchestrator
 * Fetches live prices from all dealers for all products and updates Supabase
 */
import { createClient } from '@supabase/supabase-js';
import { DEALERS } from './scrappers/dealers';
import { scrapeNYGoldCo } from './scrappers/scrape-new-york-gold-co';
import { scrapeBullionExchanges } from './scrappers/scrape-bullion-exchanges';
import { scrapeNYCBullion } from './scrappers/scrape-nyc-bullion';
import { scrapeBullionTradingLLC } from './scrappers/scrape-bullion-trading-llc';
import type { ScraperFunction, ScraperResult, DealerConfig, ProductConfig } from './types';
import { scrapeJMBullion } from './scrappers/scrape-jm-bullion';
import { scrapeAMPEX } from './scrappers/scrape-ampex';
import { scrapeSDBullion } from './scrappers/scrape-sd-bullion';
import { scrapeBGASC } from './scrappers/scrape-bgasc';

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
  'jm-bullion': scrapeJMBullion,
  apmex: scrapeAMPEX,
  'sd-bullion': scrapeSDBullion,
  bgasc: scrapeBGASC,
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
    // Log error message only (not full stack trace) to reduce noise
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Extract just the main error message (before stack trace)
    const shortMessage = errorMessage.split('\n')[0];
    console.error(`⚠️  Skipping ${dealer.name} - ${product.name}: ${shortMessage}`);
    return null; // Return null to continue with other products
  }
}

/**
 * Scrape all products for a dealer
 */
async function scrapeDealer(dealer: DealerConfig): Promise<Record<string, number>> {
  try {
    console.log(`\n🏢 Scraping ${dealer.name}...`);

    const scraperFn = SCRAPER_MAP[dealer.slug];
    if (!scraperFn) {
      console.error(`❌ No scraper function found for dealer: ${dealer.slug}`);
      return {};
    }

    const results: Record<string, number> = {};

    for (const product of dealer.products) {
      try {
        const result = await scrapeProduct(dealer, product, scraperFn);
        if (result) {
          results[product.name] = result.price;
        }
      } catch (error) {
        // Individual product failure - log and continue
        console.error(`⚠️  Failed to scrape ${dealer.name} - ${product.name}:`, error);
        // Continue with next product
      }
    }

    return results;
  } catch (error) {
    // Entire dealer failure - log and return empty results
    console.error(`❌ Failed to scrape dealer ${dealer.name}:`, error);
    return {};
  }
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

    // Scrape each dealer - wrap in try-catch to continue even if one fails
    for (const dealer of DEALERS) {
      try {
        const dealerResults = await scrapeDealer(dealer);
        if (Object.keys(dealerResults).length > 0) {
          allResults[dealer.slug] = dealerResults;
        }
      } catch (error) {
        // Dealer-level error - log and continue with next dealer
        console.error(`❌ Error processing dealer ${dealer.name}:`, error);
        // Continue with next dealer
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
      console.warn('⚠️  Warning: No listings were updated. Some scrapers may have failed.');
      // Don't throw - allow scheduler to retry on next interval
    }
  } catch (error) {
    console.error('\n❌ Fatal error in scraper:', error);
    // Log but don't throw - allow scheduler to continue and retry
    // This prevents the entire worker from crashing
  }
}

// Export the run function for scheduler integration
export { run as scrapeAllDealers };

// Run the scraper if called directly (not imported)
if (import.meta.main) {
  try {
    await run();
    console.log('\n✅ Process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  }
}
