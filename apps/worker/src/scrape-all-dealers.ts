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
import { MemoryProfiler } from './memory-profiler';

// Enable detailed memory profiling if ENABLE_MEMORY_PROFILING is set
const ENABLE_PROFILING = true;

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

const CLOUDFLARE_PROTECTED_DEALERS = new Set(['bullion-trading-llc', 'apmex']);

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
 * Delete a single IndexedDB database
 * Extracted to reduce nesting depth
 */
function deleteDatabase(dbName: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const deleteReq = indexedDB.deleteDatabase(dbName);
    deleteReq.onsuccess = () => resolve();
    deleteReq.onerror = () => resolve();
    deleteReq.onblocked = () => resolve();
  });
}

/**
 * Clear IndexedDB databases in browser context
 * Extracted to reduce function nesting
 */
function clearIndexedDB(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!('indexedDB' in globalThis.window)) {
      resolve();
      return;
    }

    if (!indexedDB.databases) {
      // Fallback for older browsers
      resolve();
      return;
    }

    indexedDB
      .databases()
      .then((databases) => {
        const deletePromises = databases
          .filter((db) => db.name)
          .map((db) => deleteDatabase(db?.name ?? ''));

        Promise.all(deletePromises).then(() => resolve());
      })
      .catch(() => resolve());
  });
}

/**
 * Unregister a single service worker
 * Extracted to reduce nesting depth
 */
async function unregisterWorker(registration: ServiceWorkerRegistration): Promise<void> {
  return await registration
    .unregister()
    .then(() => undefined)
    .catch(() => {
      // Ignore errors
    });
}

/**
 * Unregister all service workers
 * FIX #2: Service workers can cache data and keep references alive
 */
async function unregisterServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  return await navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      const unregisterPromises = registrations.map((registration) =>
        unregisterWorker(registration)
      );
      return Promise.all(unregisterPromises).then(() => undefined);
    })
    .catch(() => {
      // Ignore errors
    });
}

/**
 * Clear all browser storage to free memory
 * FIX #1: Added IndexedDB clearing to prevent database accumulation
 * FIX #2: Added service worker unregistration to prevent cache accumulation
 */
async function clearBrowserStorage(context: ReturnType<Page['context']>): Promise<void> {
  try {
    // Clear cookies
    await context.clearCookies();

    // Clear all storage (localStorage, sessionStorage, IndexedDB) for all origins
    const pages = context.pages();
    for (const page of pages) {
      try {
        // Clear localStorage, sessionStorage, and IndexedDB
        await page
          .evaluate(() => {
            // Clear localStorage and sessionStorage
            localStorage.clear();
            sessionStorage.clear();
          })
          .catch(() => {
            // Ignore errors (page might be closed or on about:blank)
          });

        // Clear IndexedDB separately to avoid deep nesting
        await page.evaluate(clearIndexedDB).catch(() => {
          // Ignore errors
        });

        // FIX #2: Unregister service workers
        await page.evaluate(unregisterServiceWorkers).catch(() => {
          // Ignore errors
        });
      } catch {
        // Ignore errors
      }
    }
  } catch (error) {
    console.warn(
      '⚠️ Error clearing browser storage:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Clear browser caches via CDP (Chrome DevTools Protocol)
 * This aggressively clears network cache, image cache, and other browser caches
 */
async function clearBrowserCachesViaCDP(page: Page): Promise<void> {
  try {
    const context = page.context();
    const cdpSession = await context.newCDPSession(page);

    // Clear browser cache
    await cdpSession.send('Network.clearBrowserCache').catch(() => {
      // Ignore errors
    });

    // Clear browser cookies (complementary to context.clearCookies)
    await cdpSession.send('Network.clearBrowserCookies').catch(() => {
      // Ignore errors
    });

    // Clear data for all storage types
    await cdpSession
      .send('Storage.clearDataForOrigin', {
        origin: '*',
        storageTypes: 'all',
      })
      .catch(() => {
        // Ignore errors
      });

    await cdpSession.detach().catch(() => {
      // Ignore errors
    });
  } catch {
    // Silently fail - CDP might not be available or page might be closed
  }
}

/**
 * Clean up browser context to free memory
 * Also cleans up route handlers from the default page
 */
async function cleanupBrowserContext(defaultPage: Page): Promise<void> {
  try {
    const context = defaultPage.context();

    // Clear all browser storage (cookies, localStorage, sessionStorage)
    await clearBrowserStorage(context);

    // Clear browser caches via CDP for more aggressive cleanup
    await clearBrowserCachesViaCDP(defaultPage);

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
 * Recreate default page to fully reset its state
 * This is more aggressive than cleanup and prevents long-term memory accumulation
 */
async function recreateDefaultPage(browser: Browser, currentPage: Page): Promise<Page> {
  try {
    // Clean up old page completely
    await cleanupPageRoutes(currentPage);
    await currentPage.close();
  } catch (error) {
    console.warn(
      '⚠️ Error closing old default page:',
      error instanceof Error ? error.message : String(error)
    );
  }

  // Create fresh page
  const newPage = await createPageWithHeaders(browser);
  console.info('🔄 Recreated default page (fresh state)');
  return newPage;
}

/**
 * Recreate browser context to fully reset browser state
 * This is the most aggressive cleanup and prevents long-term memory accumulation
 * Closes all contexts and creates a fresh one
 */
async function recreateBrowserContext(browser: Browser, currentPage: Page): Promise<Page> {
  try {
    const oldContext = currentPage.context();

    // Close all pages in the old context
    const pages = oldContext.pages();
    for (const page of pages) {
      try {
        await cleanupPageRoutes(page);
        await page.close();
      } catch {
        // Ignore errors
      }
    }

    // Close the old context
    await oldContext.close();
  } catch (error) {
    console.warn(
      '⚠️ Error closing old browser context:',
      error instanceof Error ? error.message : String(error)
    );
  }

  // Create fresh page (which creates a new default context)
  const newPage = await createPageWithHeaders(browser);
  console.info('🔄 Recreated browser context (fresh state)');
  return newPage;
}

/**
 * Monitor browser context count and alert if growing
 * This helps detect context leaks early
 */
function monitorBrowserContexts(browser: Browser): void {
  try {
    const contexts = browser.contexts();
    const contextCount = contexts.length;
    const totalPages = contexts.reduce((sum, ctx) => sum + ctx.pages().length, 0);

    // Alert if context count exceeds expected threshold (should be 1 for default context)
    if (contextCount > 1) {
      console.warn(
        `🚨 WARNING: Browser context count is ${contextCount} (expected 1). Possible context leak!`
      );
      console.warn(`   Total pages across contexts: ${totalPages}`);
    }

    // Alert if page count per context is high
    for (const context of contexts) {
      const pages = context.pages();
      if (pages.length > 5) {
        console.warn(
          `⚠️ WARNING: Context has ${pages.length} pages (expected 1-2). Possible page leak!`
        );
      }
    }
  } catch (error) {
    console.warn(
      '⚠️ Error monitoring browser contexts:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Main loop - runs continuously
 * Launches browser once at startup and reuses it forever
 * Periodically recreates the default page to prevent memory accumulation
 */
export async function scrapeAllDealers(): Promise<void> {
  console.info('🚀 Launching browser (will stay open for entire worker lifecycle)...\n');
  const browser = await launchBrowser();
  let defaultPage = await createPageWithHeaders(browser);
  console.info('✅ Browser ready, starting scrape loop...\n');

  // Initialize memory profiler if enabled
  const profiler = ENABLE_PROFILING ? new MemoryProfiler() : null;
  if (profiler) {
    console.info('📊 Memory profiling ENABLED - detailed diagnostics will be logged\n');
    await profiler.takeSnapshot(browser, 'Initial state');
  }

  let cycleCount = 0;
  const CLEANUP_INTERVAL = 3; // Clean up browser context every 3 cycles
  const RECREATE_PAGE_INTERVAL = 10; // Recreate default page every 10 cycles to fully reset state
  const RECREATE_CONTEXT_INTERVAL = 30; // Recreate browser context every 30 cycles for most aggressive cleanup
  const PROFILING_ANALYSIS_INTERVAL = 20; // Show detailed analysis every 20 cycles
  const SNAPSHOT_CLEANUP_INTERVAL = 5; // Clear old snapshots every 5 cycles to prevent accumulation

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      if (profiler) {
        profiler.incrementCycle();
      }

      await scrapeAll(browser, defaultPage);

      cycleCount++;

      // Take snapshot after scrape (reduced frequency)
      if (profiler) {
        await profiler.takeSnapshot(browser, 'After scrape');
      }

      // Periodic cleanup every N cycles to prevent memory accumulation
      if (cycleCount % CLEANUP_INTERVAL === 0) {
        await cleanupBrowserContext(defaultPage);
        if (profiler) {
          await profiler.takeSnapshot(browser, 'After cleanup');
        }
      }

      // Recreate default page periodically to fully reset its state
      // This is more aggressive than cleanup and prevents long-term accumulation
      if (cycleCount % RECREATE_PAGE_INTERVAL === 0) {
        console.info('🔄 Recreating default page to reset state...');
        defaultPage = await recreateDefaultPage(browser, defaultPage);
        if (profiler) {
          await profiler.takeSnapshot(browser, 'After page recreate');
        }
      }

      // Recreate browser context periodically for most aggressive cleanup
      if (cycleCount % RECREATE_CONTEXT_INTERVAL === 0) {
        console.info('🔄 Recreating browser context to reset state...');
        defaultPage = await recreateBrowserContext(browser, defaultPage);
      }

      // Clear old snapshots more aggressively to prevent accumulation
      if (profiler && cycleCount % SNAPSHOT_CLEANUP_INTERVAL === 0) {
        profiler.clearOldSnapshots(50);
      }

      // Monitor browser contexts and alert if growing
      monitorBrowserContexts(browser);

      // Show detailed analysis periodically
      if (profiler && cycleCount % PROFILING_ANALYSIS_INTERVAL === 0) {
        console.info(await profiler.getAnalysis());
      }

      // Force garbage collection if available (requires --expose-gc flag)
      if (globalThis.gc) {
        globalThis.gc();
      }
    } catch (error) {
      console.error('❌ Scrape cycle error:', error);
    }
    // Wait 30 seconds before next cycle
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
}
