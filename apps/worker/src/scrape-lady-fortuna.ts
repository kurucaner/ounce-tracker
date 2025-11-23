/**
 * PAMP Suisse Lady Fortuna Price Scraper (Legacy - for single product)
 * Fetches live prices from multiple dealers and updates Supabase
 *
 * NOTE: Consider using scrape-all-dealers.ts for multi-product scraping
 */
import { createClient } from '@supabase/supabase-js';
import { scrapeBullionExchanges } from './scrappers/scrape-bullion-exchanges';
import { scrapeNYGoldCo } from './scrappers/scrape-new-york-gold-co';
import { scrapeNYCBullion } from './scrappers/scrape-nyc-bullion';
import { scrapeBullionTradingLLC } from './scrappers/scrape-bullion-trading-llc';
import { DEALERS } from './scrappers/dealers';

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

    // Find the product config for Lady Fortuna across all dealers
    for (const dealer of DEALERS) {
      const productConfig = dealer.products.find((p) => p.name === PRODUCT_NAME);

      if (!productConfig) {
        console.warn(`⚠️  Product "${PRODUCT_NAME}" not found for ${dealer.name}`);
        continue;
      }

      try {
        let result;

        switch (dealer.slug) {
          case 'new-york-gold-co':
            result = await scrapeNYGoldCo(productConfig, dealer.url);
            break;
          case 'bullion-exchanges':
            result = await scrapeBullionExchanges(productConfig, dealer.url);
            break;
          case 'nyc-bullion':
            result = await scrapeNYCBullion(productConfig, dealer.url);
            break;
          case 'bullion-trading-llc':
            result = await scrapeBullionTradingLLC(productConfig, dealer.url);
            break;
          default:
            console.warn(`⚠️  No scraper found for ${dealer.slug}`);
            continue;
        }

        if (result) {
          await updateListingPrice(dealer.slug, product.id, result.price, result.url);
          results[dealer.slug] = result.price;
        }
      } catch (error) {
        console.error(`⚠️  Skipping ${dealer.name} due to error:`, error);
      }
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
