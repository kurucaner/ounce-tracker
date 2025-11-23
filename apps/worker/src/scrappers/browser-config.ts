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
  headless: false,

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
  return chromium.launch({
    headless: BROWSER_CONFIG.headless,
    args: BROWSER_CONFIG.launchArgs,
  });
}

/**
 * Create a new page and set up HTTP headers
 */
export async function createPageWithHeaders(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders(BROWSER_CONFIG.httpHeaders);
  return page;
}
