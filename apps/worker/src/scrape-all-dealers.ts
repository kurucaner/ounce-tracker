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
import type { ScraperFunction, ProductConfig, DealerConfig } from './types';
import { scrapeJMBullion } from './scrappers/scrape-jm-bullion';
import { scrapeAMPEX } from './scrappers/scrape-ampex';
import { scrapeSDBullion } from './scrappers/scrape-sd-bullion';
import { scrapeBGASC } from './scrappers/scrape-bgasc';
import { scrapePimbex } from './scrappers/scrape-pimbex';
import { scrapeGoldDealerCom } from './scrappers/scrape-golddealercom';
import { scrapeHollywoodGoldExchange } from './scrappers/scrape-hollywood-gold-exchange';
import {
  launchBrowser,
  createPageWithHeaders,
  cleanupPageRoutes,
  blockedResourceTypes,
} from './scrappers/browser-config';
import { Browser, Page } from 'playwright';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const SCRAPER_MAP: Record<string, ScraperFunction> = {
  // 'new-york-gold-co': scrapeNYGoldCo,
  // 'bullion-exchanges': scrapeBullionExchanges,
  // 'nyc-bullion': scrapeNYCBullion,
  'bullion-trading-llc': scrapeBullionTradingLLC,
  // 'jm-bullion': scrapeJMBullion,
  // apmex: scrapeAMPEX,
  // 'sd-bullion': scrapeSDBullion,
  // bgasc: scrapeBGASC,
  // pimbex: scrapePimbex,
  // golddealercom: scrapeGoldDealerCom,
  // 'hollywood-gold-exchange': scrapeHollywoodGoldExchange,
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

const CLOUDFLARE_PROTECTED_DEALERS = new Set(['bullion-trading-llc']);

type ScrapeResult = {
  successful: Array<{ dealer: string; product: string; price: number }>;
  failed: Array<{ dealer: string; product: string; error?: string }>;
};

/**
 * Get or create page for Cloudflare-protected sites
 */
async function getPageForScraping(
  browser: Browser,
  defaultPage: Page,
  isCloudflareProtected: boolean
): Promise<{ page: Page; shouldClose: boolean }> {
  if (!isCloudflareProtected) {
    return { page: defaultPage, shouldClose: false };
  }

  try {
    const page = await createPageWithHeaders(browser);
    console.info('📄 Created new page for Cloudflare-protected site (fresh navigation history)');
    return { page, shouldClose: true };
  } catch (error) {
    console.warn('⚠️ Failed to create new page, using default page:', error);
    return { page: defaultPage, shouldClose: false };
  }
}

/**
 * Clean up page if it was created for Cloudflare protection
 */
async function cleanupPageIfNeeded(
  page: Page,
  defaultPage: Page,
  shouldClose: boolean,
  dealerName: string
): Promise<void> {
  if (!shouldClose || page === defaultPage) {
    return;
  }

  try {
    await cleanupPageRoutes(page);
    await page.close();
  } catch (error) {
    console.warn(
      `⚠️ Error closing page for ${dealerName}:`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Scrape a single product
 */
async function scrapeProduct(
  scraper: ScraperFunction,
  product: ProductConfig,
  dealer: { name: string; slug: string; url: string },
  page: Page,
  results: ScrapeResult
): Promise<void> {
  try {
    const result = await retry(() => scraper(product, dealer.url, page));
    await retry(() =>
      updatePrice(dealer.slug, product.name, result.price, result.url, result.inStock)
    );
    results.successful.push({
      dealer: dealer.name,
      product: product.name,
      price: result.price,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed ${dealer.name} - ${product.name}:`, errorMessage);
    results.failed.push({
      dealer: dealer.name,
      product: product.name,
      error: errorMessage,
    });
  }
}

/**
 * Scrape all products for a dealer
 */
async function scrapeDealerProducts(
  browser: Browser,
  defaultPage: Page,
  dealer: DealerConfig,
  scraper: ScraperFunction,
  results: ScrapeResult
): Promise<void> {
  const isCloudflareProtected = CLOUDFLARE_PROTECTED_DEALERS.has(dealer.slug);

  for (const product of dealer.products) {
    const { page, shouldClose } = await getPageForScraping(
      browser,
      defaultPage,
      isCloudflareProtected
    );

    try {
      await scrapeProduct(scraper, product, dealer, page, results);
    } finally {
      await cleanupPageIfNeeded(page, defaultPage, shouldClose, dealer.name);
    }

    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * Clear navigation history after scraping a dealer
 */
async function clearNavigationHistory(defaultPage: Page, dealerName: string): Promise<void> {
  try {
    await defaultPage.goto('about:blank', {
      waitUntil: 'domcontentloaded',
      timeout: 5000,
    });
  } catch (error) {
    console.warn(
      `⚠️ Could not clear navigation history after ${dealerName}:`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Display scrape cycle summary
 */
function displaySummary(results: ScrapeResult): void {
  console.info('\n' + '='.repeat(60));
  console.info('📊 SCRAPE CYCLE SUMMARY');
  console.info('='.repeat(60));

  console.info(`\n✅ Successfully Scraped (${results.successful.length}):`);
  if (results.successful.length > 0) {
    results.successful.forEach((item) => {
      console.info(`   • ${item.dealer} - ${item.product}: $${item.price.toFixed(2)}`);
    });
  } else {
    console.info('   (none)');
  }

  console.info(`\n❌ Failed to Scrape (${results.failed.length}):`);
  if (results.failed.length > 0) {
    results.failed.forEach((item) => {
      const errorMsg = item.error ? ` - ${item.error.split('\n')[0]}` : '';
      console.info(`   • ${item.dealer} - ${item.product}${errorMsg}`);
    });
  } else {
    console.info('   (none)');
  }

  console.info(
    `\n📈 Total: ${results.successful.length} successful, ${results.failed.length} failed`
  );
  console.info('='.repeat(60) + '\n');
}

/**
 * Scrape all dealers and products
 * Uses a single browser instance for everything (launched once, never closed)
 * For Cloudflare-protected sites, creates a new page for each product to avoid navigation history tracking
 * Tracks and displays summary of successful and failed scrapes
 */
async function scrapeAll(browser: Browser, defaultPage: Page): Promise<void> {
  console.info('\n🚀 Starting scrape cycle...\n');

  const results: ScrapeResult = {
    successful: [],
    failed: [],
  };

  for (const dealer of DEALERS) {
    console.info(`\n🏢 Scraping ${dealer.name}...`);

    const scraper = SCRAPER_MAP[dealer.slug];
    if (!scraper) {
      console.error(`❌ No scraper for ${dealer.slug}`);
      for (const product of dealer.products) {
        results.failed.push({
          dealer: dealer.name,
          product: product.name,
          error: 'No scraper found',
        });
      }
      continue;
    }

    await scrapeDealerProducts(browser, defaultPage, dealer, scraper, results);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await clearNavigationHistory(defaultPage, dealer.name);
  }

  displaySummary(results);

  results.successful.length = 0;
  results.failed.length = 0;
}

/**
 * Get memory usage in MB
 */
function getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } {
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100,
    heapTotal: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100,
    external: Math.round((usage.external / 1024 / 1024) * 100) / 100,
  };
}

/**
 * Clean up browser context to free memory
 * Also cleans up route handlers from the default page
 */
async function cleanupBrowserContext(defaultPage: Page): Promise<void> {
  try {
    const context = defaultPage.context();
    // Clear all cookies to free memory
    await context.clearCookies();

    // Clean up route handlers from default page to prevent accumulation
    // Note: We'll re-add the route handler after cleanup if needed
    await cleanupPageRoutes(defaultPage);

    // Navigate to blank page to clear page state and navigation history
    await defaultPage
      .goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 5000 })
      .catch(() => {
        // Ignore errors
      });

    await defaultPage.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (blockedResourceTypes.has(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });
  } catch (error) {
    console.warn(
      '⚠️ Browser cleanup warning:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Main loop - runs continuously
 * Launches browser once at startup and reuses it forever
 */
export async function scrapeAllDealers(): Promise<void> {
  console.info('🚀 Launching browser (will stay open for entire worker lifecycle)...\n');
  const browser = await launchBrowser();
  const defaultPage = await createPageWithHeaders(browser);
  console.info('✅ Browser ready, starting scrape loop...\n');

  let cycleCount = 0;
  const CLEANUP_INTERVAL = 3; // Clean up browser context every 3 cycles (reduced from 10 to prevent accumulation)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const memoryBefore = getMemoryUsage();
      console.info(
        `💾 Memory before cycle: ${memoryBefore.heapUsed}MB / ${memoryBefore.heapTotal}MB`
      );

      await scrapeAll(browser, defaultPage);

      cycleCount++;
      const memoryAfter = getMemoryUsage();
      console.info(`💾 Memory after cycle: ${memoryAfter.heapUsed}MB / ${memoryAfter.heapTotal}MB`);

      // Periodic cleanup every N cycles to prevent memory accumulation
      if (cycleCount % CLEANUP_INTERVAL === 0) {
        console.info('🧹 Performing periodic browser cleanup...');
        await cleanupBrowserContext(defaultPage);
        const memoryAfterCleanup = getMemoryUsage();
        console.info(
          `💾 Memory after cleanup: ${memoryAfterCleanup.heapUsed}MB / ${memoryAfterCleanup.heapTotal}MB`
        );
      }

      // Force garbage collection if available (requires --expose-gc flag)
      if (globalThis.gc) {
        globalThis.gc();
        const memoryAfterGC = getMemoryUsage();
        console.info(
          `💾 Memory after GC: ${memoryAfterGC.heapUsed}MB / ${memoryAfterGC.heapTotal}MB`
        );
      }
    } catch (error) {
      console.error('❌ Scrape cycle error:', error);
    }
    // Wait 30 seconds before next cycle
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
}
