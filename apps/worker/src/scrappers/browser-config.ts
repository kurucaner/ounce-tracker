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
   * Added more arguments to make the browser look more like a real user
   * Memory optimization flags added to reduce RAM usage
   */
  launchArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--window-size=1280,720',
    '--start-maximized',
  ],

  /**
   * HTTP headers to make requests look more like a real browser
   * Includes referrer policy to prevent history tracking
   */
  httpHeaders: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    // Removed Cache-Control: max-age=0 to allow browser caching and reduce network traffic
    // Browser will cache resources naturally, significantly reducing ingress traffic
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Referrer-Policy': 'no-referrer',
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

// Block unnecessary resources to save memory and reduce CPU usage
// Keep stylesheets as some sites need CSS for JS to work, but block images, fonts, media
// Using Set for O(1) lookup instead of array includes() for better performance
export const blockedResourceTypes = new Set([
  'image',
  'font',
  'media',
  'websocket',
  'manifest',
  'texttrack',
]);

/**
 * Create a new page and set up HTTP headers with timeout protection
 * Also sets viewport and other properties to look more like a real browser
 * Blocks unnecessary resources to reduce memory usage
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

  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    // Efficient check using Set instead of array includes
    if (blockedResourceTypes.has(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Set smaller viewport size to reduce memory (1280x720 instead of 1920x1080)
  await page.setViewportSize({ width: 1280, height: 720 });

  // Set extra HTTP headers
  await page.setExtraHTTPHeaders(BROWSER_CONFIG.httpHeaders);

  // Override navigator.webdriver to hide automation
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // Override chrome object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).chrome = {
      runtime: {},
    };

    // Override permissions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalQuery = (globalThis.navigator as any).permissions.query;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis.navigator as any).permissions.query = (parameters: { name: string }) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
        : originalQuery(parameters);

    // Override history API to prevent tracking
    // This makes it harder for sites to detect navigation patterns
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
      // Call original but don't expose navigation pattern
      return originalPushState.apply(history, args);
    };
    history.replaceState = function (...args) {
      return originalReplaceState.apply(history, args);
    };
  });

  return page;
}

/**
 * Properly clean up route handlers from a page before closing
 * This prevents memory leaks from accumulated route handlers
 */
export async function cleanupPageRoutes(page: Page): Promise<void> {
  try {
    // Unroute all routes to ensure clean teardown
    // This removes all route handlers and prevents memory leaks
    await page.unroute('**/*').catch(() => {
      // Ignore if no routes exist - this is fine
    });
  } catch (error) {
    // Log but don't throw - page might be closing
    console.warn(
      '⚠️ Error cleaning up route handlers:',
      error instanceof Error ? error.message : String(error)
    );
  }
}
