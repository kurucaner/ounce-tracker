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
import { scrapePimbex } from './scrappers/scrape-pimbex';
import { scrapeGoldDealerCom } from './scrappers/scrape-golddealercom';
import { scrapeHollywoodGoldExchange } from './scrappers/scrape-hollywood-gold-exchange';

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
  pimbex: scrapePimbex,
  golddealercom: scrapeGoldDealerCom,
  'hollywood-gold-exchange': scrapeHollywoodGoldExchange,
};

/**
 * Helper to add timeout to Supabase queries
 * Properly handles PromiseLike queries that might hang
 */
async function withTimeout<T>(
  query: PromiseLike<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  // Convert PromiseLike to actual Promise and race it with timeout
  const queryPromise = Promise.resolve(query);

  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${errorMessage} (timeout after ${timeoutMs}ms)`));
    }, timeoutMs);
  });

  return Promise.race([queryPromise, timeoutPromise]);
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = initialDelayMs * Math.pow(2, attempt);
      console.warn(`⚠️  Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Update dealer listing in Supabase with retry logic and overall timeout protection
 */
async function updateListingPrice(
  dealerSlug: string,
  productName: string,
  price: number,
  productUrl: string
): Promise<void> {
  // Overall timeout: 10 seconds total (covers all retries)
  // This ensures the function never hangs indefinitely
  const overallTimeoutMs = 10000;

  const updateOperation = async (): Promise<void> => {
    // Retry the entire database update operation (3 attempts with exponential backoff)
    await retryWithBackoff(
      async () => {
        // Get dealer ID with timeout
        const dealerQuery = supabase.from('dealers').select('id').eq('slug', dealerSlug).single();

        const { data: dealer, error: dealerError } = await withTimeout(
          dealerQuery,
          10000, // 10 second timeout
          `Dealer query timeout for ${dealerSlug}`
        );

        if (dealerError || !dealer) {
          throw new Error(`Dealer not found: ${dealerSlug}`);
        }

        // Get product ID with timeout
        const productQuery = supabase
          .from('products')
          .select('id')
          .eq('name', productName)
          .single();

        const { data: product, error: productError } = await withTimeout(
          productQuery,
          10000, // 10 second timeout
          `Product query timeout for ${productName}`
        );

        if (productError || !product) {
          throw new Error(`Product not found: ${productName}`);
        }

        // Update dealer listing with timeout
        const updateQuery = supabase
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

        const { error: updateError } = await withTimeout(
          updateQuery,
          10000, // 10 second timeout
          `Update listing timeout for ${dealerSlug} - ${productName}`
        );

        if (updateError) {
          throw new Error(`Failed to update listing: ${updateError.message}`);
        }
      },
      3,
      1000
    ); // 3 retries, starting with 1 second delay

    console.log(`💾 Updated ${dealerSlug} - ${productName}: $${price.toFixed(2)}`);
  };

  try {
    // Wrap entire operation with overall timeout
    await withTimeout(
      updateOperation(),
      overallTimeoutMs,
      `Overall timeout for updateListingPrice: ${dealerSlug} - ${productName}`
    );
  } catch (error) {
    console.error(`❌ Failed to update ${dealerSlug} - ${productName}:`, error);
    throw error;
  }
}

/**
 * Scrape a single product for a dealer with retry logic
 */
async function scrapeProduct(
  dealer: DealerConfig,
  product: ProductConfig,
  scraperFn: ScraperFunction
): Promise<ScraperResult | null> {
  const maxRetries = 2; // Retry once (2 total attempts)
  const retryDelayMs = 3000; // 3 second delay between retries

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.warn(
          `🔄 Retrying ${dealer.name} - ${product.name} (attempt ${attempt + 1}/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }

      const result = await scraperFn(product, dealer.url);

      // Wrap DB update with timeout at scrapeProduct level (safety net)
      // This ensures one hanging update doesn't block all subsequent products
      const dbUpdateTimeoutMs = 15000; // 15 seconds

      try {
        await withTimeout(
          updateListingPrice(dealer.slug, product.name, result.price, result.url),
          dbUpdateTimeoutMs,
          `DB update timeout at scrapeProduct level: ${dealer.name} - ${product.name}`
        );
      } catch (dbError) {
        // Log DB update failure but don't fail the entire scrape
        const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        const shortMessage = errorMessage.split('\n')[0];
        console.error(`⚠️  DB update failed for ${dealer.name} - ${product.name}: ${shortMessage}`);
        // Return null to skip this product but continue with others
        return null;
      }

      return result;
    } catch (error) {
      // If this is the last attempt, log and give up
      if (attempt === maxRetries - 1) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const shortMessage = errorMessage.split('\n')[0];
        console.error(
          `⚠️  Skipping ${dealer.name} - ${product.name} after ${maxRetries} attempts: ${shortMessage}`
        );
        return null; // Return null to continue with other products
      }
      // Otherwise, the loop will retry
    }
  }

  return null;
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

      // Add 2 second delay after each product scraping
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
