import { chromium } from 'playwright-extra';
import type { Browser, Page } from 'playwright';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin to avoid detection (only needs to be done once)
chromium.use(StealthPlugin());

/**
 * Centralized browser configuration
 * Change headless mode here to affect all scrapers
 */
export const BROWSER_CONFIG = {
  /**
   * Set to false to see browser windows (useful for debugging)
   * Set to true for production (faster, no GUI)
   */
  headless: true,

  /**
   * Browser launch arguments
   */
  launchArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
  ],

  /**
   * HTTP headers to make requests look more like a real browser
   */
  httpHeaders: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cache-Control': 'max-age=0',
  },
};

/**
 * Launch a browser with the shared configuration
 */
export async function launchBrowser(): Promise<Browser> {
  // Increased timeout to handle system load - no artificial delay needed
  // The delay between scrapes in scrape-all-dealers.ts is sufficient
  return chromium.launch({
    headless: BROWSER_CONFIG.headless,
    args: BROWSER_CONFIG.launchArgs,
    timeout: 30000, // 30 seconds to handle system load
  });
}

/**
 * Create a new page and set up HTTP headers with timeout protection
 */
export async function createPageWithHeaders(browser: Browser): Promise<Page> {
  // Wrap newPage() with timeout since it doesn't have a built-in timeout option
  const pagePromise = browser.newPage();
  const timeoutPromise = new Promise<Page>((_, reject) => {
    setTimeout(() => {
      reject(new Error('browser.newPage() timeout: Timeout 15000ms exceeded'));
    }, 15000); // Increased to 15 seconds
  });

  const page = await Promise.race([pagePromise, timeoutPromise]);
  await page.setExtraHTTPHeaders(BROWSER_CONFIG.httpHeaders);
  return page;
}

/**
 * Safely close browser - simplified version
 * Just close it and ignore errors (browser might already be closed)
 */
export async function safeCloseBrowser(browser: Browser | null | undefined): Promise<void> {
  if (!browser) {
    return;
  }

  try {
    // Try to close all pages first (best practice)
    const contexts = browser.contexts();
    for (const context of contexts) {
      for (const page of context.pages()) {
        await page.close().catch(() => {
          // Ignore - page might already be closed
        });
      }
      await context.close().catch(() => {
        // Ignore - context might already be closed
      });
    }

    // Close browser with timeout - if it takes more than 3 seconds, give up
    await Promise.race([
      browser.close(),
      new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('⚠️  Browser close timeout, continuing anyway');
          resolve();
        }, 3000);
      }),
    ]).catch(() => {
      // Ignore all errors - browser cleanup is best-effort
    });
  } catch {
    // Ignore all errors - browser might already be closed
  }
}
