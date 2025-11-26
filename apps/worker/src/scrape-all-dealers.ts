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
import { launchBrowser, createPageWithHeaders } from './scrappers/browser-config';

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
 * Scrape one product using an existing page (browser reuse)
 */
async function scrapeProduct(
  dealer: DealerConfig,
  product: ProductConfig,
  page: import('playwright').Page
): Promise<void> {
  const scraper = SCRAPER_MAP[dealer.slug];
  if (!scraper) {
    console.error(`❌ No scraper for ${dealer.slug}`);
    return;
  }

  try {
    const result = await retry(() => scraper(product, dealer.url, page));
    await retry(() =>
      updatePrice(dealer.slug, product.name, result.price, result.url, result.inStock)
    );
    console.log(`✅ ${dealer.name} - ${product.name}: $${result.price.toFixed(2)}`);
  } catch (error) {
    console.error(
      `❌ Failed ${dealer.name} - ${product.name}:`,
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * Scrape all dealers and products
 * Uses a single browser instance for everything (launched once, never closed)
 */
async function scrapeAll(page: import('playwright').Page): Promise<void> {
  console.log('\n🚀 Starting scrape cycle...\n');

  for (const dealer of DEALERS) {
    console.log(`\n🏢 Scraping ${dealer.name}...`);

    const scraper = SCRAPER_MAP[dealer.slug];
    if (!scraper) {
      console.error(`❌ No scraper for ${dealer.slug}`);
      continue;
    }

    // Scrape all products for this dealer using the same browser/page
    for (const product of dealer.products) {
      await scrapeProduct(dealer, product, page);
      // Small delay between products to avoid overwhelming the site
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Small delay between dealers
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Scrape cycle completed\n');
}

/**
 * Main loop - runs continuously
 * Launches browser once at startup and reuses it forever
 */
export async function scrapeAllDealers(): Promise<void> {
  console.log('🚀 Launching browser (will stay open for entire worker lifecycle)...\n');
  const browser = await launchBrowser();
  const page = await createPageWithHeaders(browser);
  console.log('✅ Browser ready, starting scrape loop...\n');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await scrapeAll(page);
    } catch (error) {
      console.error('❌ Scrape cycle error:', error);
    }
    // Wait 1 second before next cycle
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Browser stays open - never closed (worker runs forever)
}
