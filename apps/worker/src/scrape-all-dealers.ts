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
  console.info(`💾 Updated ${dealerSlug} - ${productName}: $${price.toFixed(2)}`);
}

/**
 * Scrape all dealers and products
 * Uses a single browser instance for everything (launched once, never closed)
 * Tracks and displays summary of successful and failed scrapes
 */
async function scrapeAll(page: import('playwright').Page): Promise<void> {
  console.info('\n🚀 Starting scrape cycle...\n');

  const successful: Array<{ dealer: string; product: string; price: number }> = [];
  const failed: Array<{ dealer: string; product: string; error?: string }> = [];

  for (const dealer of DEALERS) {
    console.info(`\n🏢 Scraping ${dealer.name}...`);

    const scraper = SCRAPER_MAP[dealer.slug];
    if (!scraper) {
      console.error(`❌ No scraper for ${dealer.slug}`);
      for (const product of dealer.products) {
        failed.push({ dealer: dealer.name, product: product.name, error: 'No scraper found' });
      }
      continue;
    }

    // Scrape all products for this dealer using the same browser/page
    for (const product of dealer.products) {
      try {
        const result = await retry(() => scraper(product, dealer.url, page));
        await retry(() =>
          updatePrice(dealer.slug, product.name, result.price, result.url, result.inStock)
        );
        console.info(`✅ ${dealer.name} - ${product.name}: $${result.price.toFixed(2)}`);
        successful.push({
          dealer: dealer.name,
          product: product.name,
          price: result.price,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed ${dealer.name} - ${product.name}:`, errorMessage);
        failed.push({
          dealer: dealer.name,
          product: product.name,
          error: errorMessage,
        });
      }

      // Small delay between products to avoid overwhelming the site
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Small delay between dealers
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Display summary
  console.info('\n' + '='.repeat(60));
  console.info('📊 SCRAPE CYCLE SUMMARY');
  console.info('='.repeat(60));

  console.info(`\n✅ Successfully Scraped (${successful.length}):`);
  if (successful.length > 0) {
    successful.forEach((item) => {
      console.info(`   • ${item.dealer} - ${item.product}: $${item.price.toFixed(2)}`);
    });
  } else {
    console.info('   (none)');
  }

  console.info(`\n❌ Failed to Scrape (${failed.length}):`);
  if (failed.length > 0) {
    failed.forEach((item) => {
      const errorMsg = item.error ? ` - ${item.error.split('\n')[0]}` : '';
      console.info(`   • ${item.dealer} - ${item.product}${errorMsg}`);
    });
  } else {
    console.info('   (none)');
  }

  console.info(`\n📈 Total: ${successful.length} successful, ${failed.length} failed`);
  console.info('='.repeat(60) + '\n');
}

/**
 * Main loop - runs continuously
 * Launches browser once at startup and reuses it forever
 */
export async function scrapeAllDealers(): Promise<void> {
  console.info('🚀 Launching browser (will stay open for entire worker lifecycle)...\n');
  const browser = await launchBrowser();
  const page = await createPageWithHeaders(browser);
  console.info('✅ Browser ready, starting scrape loop...\n');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await scrapeAll(page);
    } catch (error) {
      console.error('❌ Scrape cycle error:', error);
    }
    // Wait 1 second before next cycle
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }

  // Browser stays open - never closed (worker runs forever)
}
