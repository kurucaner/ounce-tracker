import { chromium } from 'playwright-extra';
import type { Page } from 'playwright';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { ScraperResult, ProductConfig } from '../types';
import { safeCloseBrowser } from './browser-utils';

// Add stealth plugin to avoid detection
chromium.use(StealthPlugin());

/**
 * Extracts the initial price from the embedded JavaScript data.
 * It targets the 'initialFinalPrice' variable inside the initPrice475 function.
 *
 * @param page The Playwright Page object.
 * @returns The raw price number or null if not found.
 */
async function extractPriceFromPage(page: Page): Promise<number | null> {
  const priceValue = await page.evaluate(() => {
    try {
      // 1. Find the script block containing the price initialization function (initPrice475)
      // Note: We use querySelector('script:contains("...")') which is an extension sometimes used
      // in jQuery/some tools. For Playwright's page.evaluate, standard DOM is safer.
      const allScripts = Array.from(document.querySelectorAll('script'));
      const scriptElement = allScripts.find((s) => s.textContent?.includes('initPrice'));

      if (!scriptElement || !scriptElement.textContent) {
        console.warn('⚠️ Could not find the price initialization script block.');
        return null;
      }

      const scriptContent = scriptElement.textContent;

      // 2. Use a regex to extract the initialFinalPrice value (which is the 1-4 price)
      // This is the most direct target.
      const initialPriceMatch = scriptContent.match(/initialFinalPrice:\s*(\d+\.?\d*),/);

      if (initialPriceMatch && initialPriceMatch[1]) {
        const price = Number.parseFloat(initialPriceMatch[1]);
        if (!Number.isNaN(price) && price > 0) {
          console.info(`📍 Found initial price via JavaScript variable: ${price}`);
          return price;
        }
      }

      // 3. Fallback: Extract the first tier price (for quantity 5)
      const tierPricesMatch = scriptContent.match(/initialTierPrices:\s*(\[.*?\]),/s);

      if (tierPricesMatch && tierPricesMatch[1]) {
        // Parse the extracted JSON string
        const tierPricesJsonString = tierPricesMatch[1];
        const tierPrices = JSON.parse(tierPricesJsonString);

        if (Array.isArray(tierPrices) && tierPrices.length > 0) {
          // Extract the price for the lowest tier quantity (e.g., qty 5)
          const firstTierPrice = tierPrices[0].website_price;
          const price = Number.parseFloat(firstTierPrice);

          if (!Number.isNaN(price) && price > 0) {
            console.info(`📍 Found first tier price (qty 5+) via JavaScript variable: ${price}`);
            return price;
          }
        }
      }

      console.warn('⚠️ Could not extract price using either initial price or tier price regex.');
      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation / JSON parsing:', e);
      return null;
    }
  });

  return priceValue;
}

export async function scrapeNYCBullion(
  productConfig: ProductConfig,
  baseUrl: string
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  let browser;
  try {
    console.info(`🔍 Scraping NYC Bullion - ${productConfig.name} (using stealth browser)...`);

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'max-age=0',
    });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Wait for the price script to be loaded (NYC Bullion uses JavaScript to set prices)
    // Wait for any script tag that contains 'initPrice' - this indicates price data is loaded
    await page.waitForFunction(
      () => {
        const scripts = Array.from(document.querySelectorAll('script'));
        return scripts.some((s) => s.textContent?.includes('initPrice'));
      },
      { timeout: 10000 }
    );

    const priceNumber = await extractPriceFromPage(page);

    if (priceNumber === null) {
      throw new Error('Price not found using JavaScript data extraction.');
    }

    const price = priceNumber;

    console.info(`✅ NYC Bullion - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape NYC Bullion - ${productConfig.name}:`, error);
    throw error;
  } finally {
    await safeCloseBrowser(browser);
  }
}
