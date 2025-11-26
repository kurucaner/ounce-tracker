/**
 * Simple Scraper - Scrapes all dealers and updates database
 * Loops continuously with retries on failure
 */
import { createClient } from '@supabase/supabase-js';
import { DEALERS } from './scrappers/dealers';
import { scrapeNYGoldCo } from './scrappers/scrape-new-york-gold-co';
import { scrapeBullionExchanges } from './scrappers/scrape-bullion-exchanges';
import { scrapeNYCBullion } from './scrappers/scrape-nyc-bullion';
import { scrapeBullionTradingLLC } from './scrappers/scrape-bullion-trading-llc';
import type { ScraperFunction, DealerConfig, ProductConfig } from './types';
import { scrapeJMBullion } from './scrappers/scrape-jm-bullion';
import { scrapeAMPEX } from './scrappers/scrape-ampex';
import { scrapeSDBullion } from './scrappers/scrape-sd-bullion';
import { scrapeBGASC } from './scrappers/scrape-bgasc';
import { scrapePimbex } from './scrappers/scrape-pimbex';
import { scrapeGoldDealerCom } from './scrappers/scrape-golddealercom';
import { scrapeHollywoodGoldExchange } from './scrappers/scrape-hollywood-gold-exchange';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

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
 * Retry a function up to 3 times
 */
async function retry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        console.warn(`⚠️  Attempt ${attempt}/${maxAttempts} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay
      }
    }
  }
  throw lastError;
}

/**
 * Update price in database
 */
async function updatePrice(
  dealerSlug: string,
  productName: string,
  price: number,
  url: string,
  inStock: boolean
): Promise<void> {
  const { data: dealer } = await supabase
    .from('dealers')
    .select('id')
    .eq('slug', dealerSlug)
    .single();
  if (!dealer) throw new Error(`Dealer not found: ${dealerSlug}`);

  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('name', productName)
    .single();
  if (!product) throw new Error(`Product not found: ${productName}`);

  const { error } = await supabase
    .from('dealer_listings')
    .upsert({
      dealer_id: dealer.id,
      product_id: product.id,
      price,
      product_url: url,
      in_stock: inStock,
      currency: 'USD',
    })
    .eq('dealer_id', dealer.id)
    .eq('product_id', product.id);

  if (error) throw error;
  console.log(`💾 Updated ${dealerSlug} - ${productName}: $${price.toFixed(2)}`);
}

/**
 * Scrape one product for one dealer
 */
async function scrapeProduct(dealer: DealerConfig, product: ProductConfig): Promise<void> {
  const scraper = SCRAPER_MAP[dealer.slug];
  if (!scraper) {
    console.error(`❌ No scraper for ${dealer.slug}`);
    return;
  }

  try {
    const result = await retry(() => scraper(product, dealer.url));
    await retry(() =>
      updatePrice(dealer.slug, product.name, result.price, result.url, result.inStock)
    );
    console.log(`✅ ${dealer.name} - ${product.name}: $${result.price.toFixed(2)}`);
  } catch (error) {
    console.error(
      `❌ Failed ${dealer.name} - ${product.name}:`,
      error instanceof Error ? error.message : error
    );
  } finally {
    // Small delay to prevent overwhelming the system with browser launches
    // 2 seconds is enough - browsers are heavy but we need to balance speed vs stability
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

/**
 * Scrape all dealers and products
 */
async function scrapeAll(): Promise<void> {
  console.log('\n🚀 Starting scrape cycle...\n');

  for (const dealer of DEALERS) {
    console.log(`\n🏢 Scraping ${dealer.name}...`);
    for (const product of dealer.products) {
      await scrapeProduct(dealer, product);
      // Delay is already in scrapeProduct's finally block
    }
  }

  console.log('\n✅ Scrape cycle completed\n');
}

/**
 * Main loop - runs continuously
 */
export async function scrapeAllDealers(): Promise<void> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await scrapeAll();
    } catch (error) {
      console.error('❌ Scrape cycle error:', error);
    }
    // Wait 1 second before next cycle
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
