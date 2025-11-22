/**
 * PAMP Suisse Lady Fortuna Price Scraper
 * Fetches live prices from multiple dealers and updates Supabase
 */
import { createClient } from '@supabase/supabase-js';
import { scrapeBullionExchanges } from './scrappers/scrape-bullion-exchanges';
import { scrapeNYGoldCo } from './scrappers/scrape-new-york-gold-co';
import { scrapeNYCBullion } from './scrappers/scrape-nyc-bullion';
import { scrapeBullionTradingLLC } from './scrappers/scrape-bullion-trading-llc';

// Product identifier
const PRODUCT_NAME = '1 oz Gold Bar PAMP Suisse Lady Fortuna';

// Initialize Supabase client with service role key
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

/**
 * Update dealer listing in Supabase
 */
async function updateListingPrice(
  dealerSlug: string,
  productId: string,
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

    // Update dealer listing
    const { error: updateError } = await supabase
      .from('dealer_listings')
      .upsert({
        dealer_id: dealer.id,
        product_id: productId,
        currency: 'USD',
        in_stock: true,
        price,
        product_url: productUrl,
      })
      .eq('dealer_id', dealer.id)
      .eq('product_id', productId);

    if (updateError) {
      throw new Error(`Failed to update listing: ${updateError.message}`);
    }

    console.log(`💾 Updated ${dealerSlug}: $${price.toFixed(2)}`);
  } catch (error) {
    console.error(`❌ Failed to update ${dealerSlug}:`, error);
    throw error;
  }
}

/**
 * Main execution
 */
async function run(): Promise<void> {
  console.log('🚀 Starting PAMP Lady Fortuna price scraper...\n');

  // Validate environment variables
  if (!process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  try {
    // Get product ID
    console.log(`📦 Fetching product: "${PRODUCT_NAME}"...`);
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('name', PRODUCT_NAME)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${PRODUCT_NAME}`);
    }

    console.log(`✅ Product ID: ${product.id}\n`);

    // Scrape and update each dealer
    const results: Record<string, number> = {};

    // New York Gold Co
    try {
      const { price: nyPrice, url: nyUrl } = await scrapeNYGoldCo();
      await updateListingPrice('new-york-gold-co', product.id, nyPrice, nyUrl);
      results.ny_gold_co = nyPrice;
    } catch (error) {
      console.error('⚠️  Skipping NY Gold Co due to error:', error);
    }

    // Bullion Exchanges
    try {
      const { price: exPrice, url: exUrl } = await scrapeBullionExchanges();
      await updateListingPrice('bullion-exchanges', product.id, exPrice, exUrl);
      results.bullion_exchanges = exPrice;
    } catch (error) {
      console.error('⚠️  Skipping Bullion Exchanges due to error:', error);
    }

    // NYC Bullion
    try {
      const { price: nycPrice, url: nycUrl } = await scrapeNYCBullion();
      await updateListingPrice('nyc-bullion', product.id, nycPrice, nycUrl);
      results.nyc_bullion = nycPrice;
    } catch (error) {
      console.error('⚠️  Skipping NYC Bullion due to error:', error);
    }

    // Bullion Trading LLC
    try {
      const { price: btPrice, url: btUrl } = await scrapeBullionTradingLLC();
      await updateListingPrice('bullion-trading-llc', product.id, btPrice, btUrl);
      results.bullion_trading_llc = btPrice;
    } catch (error) {
      console.error('⚠️  Skipping Bullion Trading LLC due to error:', error);
    }

    // Summary
    console.log('\n✅ Scraping completed!');
    console.log('📊 Updated prices:', JSON.stringify(results, null, 2));

    if (Object.keys(results).length === 0) {
      throw new Error('All scrapers failed');
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the scraper (top-level await)
await run();
