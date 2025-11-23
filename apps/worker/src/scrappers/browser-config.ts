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
  return chromium.launch({
    headless: BROWSER_CONFIG.headless,
    args: BROWSER_CONFIG.launchArgs,
    timeout: 5000,
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
      reject(new Error('browser.newPage() timeout: Timeout 5000ms exceeded'));
    }, 5000);
  });

  const page = await Promise.race([pagePromise, timeoutPromise]);
  await page.setExtraHTTPHeaders(BROWSER_CONFIG.httpHeaders);
  return page;
}

/**
 * Safely close browser with timeout to prevent hanging
 * Especially important when page.goto() times out and browser is in bad state
 */
export async function safeCloseBrowser(browser: Browser | null | undefined): Promise<void> {
  if (!browser) {
    return;
  }

  try {
    // Close all pages first - this prevents browser.close() from waiting
    // for ongoing network requests, JavaScript execution, or WebSocket connections
    const contexts = browser.contexts();
    const allPages: Page[] = [];
    for (const context of contexts) {
      allPages.push(...context.pages());
    }

    await Promise.allSettled(
      allPages.map((page: Page) =>
        Promise.race([
          page.close(),
          new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 1000); // 1 second timeout per page
          }),
        ])
      )
    );

    // Now close the browser with timeout protection
    await Promise.race([
      browser.close(),
      new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('⚠️  Browser close timeout, continuing anyway');
          resolve();
        }, 3000); // 3 second timeout
      }),
    ]);
  } catch (closeError) {
    // Ignore close errors - browser might already be closed or in bad state
    // This is expected when browser is in a bad state after timeout
    if (closeError instanceof Error && !closeError.message.includes('Target closed')) {
      // Only log unexpected errors
      console.warn(`⚠️  Browser close warning: ${closeError.message}`);
    }
  }
}
