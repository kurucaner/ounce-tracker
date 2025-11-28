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
import type { ScraperFunction } from './types';
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

const CLOUDFLARE_PROTECTED_DEALERS = new Set(['bullion-trading-llc']);

/**
 * Scrape all dealers and products
 * Uses a single browser instance for everything (launched once, never closed)
 * For Cloudflare-protected sites, creates a new page for each product to avoid navigation history tracking
 * Tracks and displays summary of successful and failed scrapes
 */
async function scrapeAll(
  browser: import('playwright').Browser,
  defaultPage: import('playwright').Page
): Promise<void> {
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

    // For Cloudflare-protected sites, use a new page for each product
    // This avoids navigation history tracking
    const isCloudflareProtected = CLOUDFLARE_PROTECTED_DEALERS.has(dealer.slug);

    // Scrape all products for this dealer
    for (const product of dealer.products) {
      let pageToUse = defaultPage;

      // Create a fresh page for Cloudflare-protected sites to avoid navigation history
      if (isCloudflareProtected) {
        try {
          pageToUse = await createPageWithHeaders(browser);
          console.info(
            '📄 Created new page for Cloudflare-protected site (fresh navigation history)'
          );
        } catch (error) {
          console.warn('⚠️ Failed to create new page, using default page:', error);
          pageToUse = defaultPage;
        }
      }

      try {
        const result = await retry(() => scraper(product, dealer.url, pageToUse));
        await retry(() =>
          updatePrice(dealer.slug, product.name, result.price, result.url, result.inStock)
        );
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
      } finally {
        // Close the page if we created a new one (for Cloudflare sites)
        if (isCloudflareProtected && pageToUse !== defaultPage) {
          try {
            await pageToUse.close();
          } catch {
            // Ignore errors when closing
          }
        }
      }

      const delay = Math.floor(Math.random() * 2000) + 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Small delay between dealers
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear default page state between dealers to prevent memory accumulation
    try {
      // Navigate to blank page to clear navigation history and page state
      await defaultPage
        .goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 5000 })
        .catch(() => {
          // Ignore errors - page might already be on about:blank
        });
      // Clear any remaining requests/responses from memory
      await defaultPage
        .evaluate(() => {
          // Clear any cached data
          if ('performance' in globalThis && 'clearResourceTimings' in performance) {
            performance.clearResourceTimings();
          }
        })
        .catch(() => {
          // Ignore errors
        });
    } catch {
      // Ignore errors during cleanup
    }
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

  // Clear arrays to prevent memory growth
  successful.length = 0;
  failed.length = 0;
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
 * Note: We don't clear HTTP cache here to allow browser caching and reduce network traffic
 */
async function cleanupBrowserContext(defaultPage: import('playwright').Page): Promise<void> {
  try {
    const context = defaultPage.context();
    // Clear all cookies to free memory (but keep HTTP cache for network efficiency)
    await context.clearCookies();
    // Clear permissions
    await context.clearPermissions();
    // Navigate to blank page to clear page state and navigation history
    await defaultPage
      .goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 5000 })
      .catch(() => {
        // Ignore errors
      });
    // Note: We intentionally don't clear HTTP cache here to reduce network traffic
    // The browser's HTTP cache helps reduce ingress significantly
  } catch (error) {
    console.warn(
      '⚠️ Browser cleanup warning:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Main loop - runs continuously
 * Launches browser once at startup and reuses it
 * Optionally restarts browser periodically to prevent memory leaks
 */
export async function scrapeAllDealers(): Promise<void> {
  console.info('🚀 Launching browser...\n');
  let browser = await launchBrowser();
  let defaultPage = await createPageWithHeaders(browser);
  console.info('✅ Browser ready, starting scrape loop...\n');

  let cycleCount = 0;
  const CLEANUP_INTERVAL = 5; // Clean up browser context every 5 cycles (more frequent)
  const BROWSER_RESTART_INTERVAL = 100; // Restart browser every 100 cycles (~50 minutes) to prevent leaks
  // Increased from 50 to 100 to reduce network traffic spikes from browser restarts

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

      // Periodic browser restart to prevent memory leaks from accumulating
      if (cycleCount % BROWSER_RESTART_INTERVAL === 0) {
        console.info('🔄 Restarting browser to prevent memory leaks...');
        try {
          await defaultPage.close();
          await browser.close();
          // Small delay before restart
          await new Promise((resolve) => setTimeout(resolve, 2000));
          browser = await launchBrowser();
          defaultPage = await createPageWithHeaders(browser);
          console.info('✅ Browser restarted successfully');
          const memoryAfterRestart = getMemoryUsage();
          console.info(
            `💾 Memory after restart: ${memoryAfterRestart.heapUsed}MB / ${memoryAfterRestart.heapTotal}MB`
          );
        } catch (error) {
          console.error('❌ Error restarting browser:', error);
          // Try to continue with existing browser
        }
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

  // Browser stays open - never closed (worker runs forever)
}
