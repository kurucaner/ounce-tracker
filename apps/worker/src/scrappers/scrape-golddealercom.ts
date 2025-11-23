import type { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';
import { launchBrowser, createPageWithHeaders, safeCloseBrowser } from './browser-config';

/**
 * Extracts the "Live Ask Price" by targeting the span element with itemprop="price"
 * inside the main container.
 *
 * @param page The Playwright Page object.
 * @returns The extracted price as a number (e.g., 4215.95) or null if not found.
 */
async function extractPriceFromPage(page: Page): Promise<number | null> {
  const priceValue = await page.evaluate(() => {
    try {
      // Helper function to clean and parse the price string
      const cleanAndParsePrice = (priceString: string): number | null => {
        // Removes non-digit characters except the decimal point (e.g., removes '$', ',', spaces)
        const cleanedPrice = priceString.replaceAll(/[^0-9.]/g, '');
        const price = Number.parseFloat(cleanedPrice);
        return !Number.isNaN(price) && price > 0 ? price : null;
      };

      // 1. Target the element using the robust itemprop="price" attribute.
      const priceSelector = '#priceBuySell2 span[itemprop="price"]';
      const priceElement = document.querySelector(priceSelector);

      if (priceElement && priceElement.textContent) {
        const rawPriceText = priceElement.textContent.trim();
        console.info(`📍 Found price via itemprop selector: ${rawPriceText}`);

        // Return the cleaned and parsed NUMBER
        return cleanAndParsePrice(rawPriceText);
      }

      // 2. Fallback: Use the specific ID if itemprop fails for some reason.
      const fallbackPriceElement = document.getElementById('sellPrice');
      if (fallbackPriceElement && fallbackPriceElement.textContent) {
        const rawPriceText = fallbackPriceElement.textContent.trim();
        console.warn(`⚠️ Found price via ID fallback: ${rawPriceText}`);
        return cleanAndParsePrice(rawPriceText);
      }

      console.warn('⚠️ Could not extract price using itemprop or ID selector.');
      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation:', e);
      return null;
    }
  });

  return priceValue;
}

export async function scrapeGoldDealerCom(
  productConfig: ProductConfig,
  baseUrl: string
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  let browser;
  try {
    console.info(`🔍 Scraping GoldDealer.com - ${productConfig.name} (using stealth browser)...`);

    browser = await launchBrowser();
    const page = await createPageWithHeaders(browser);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });

    // Wait for the price element to appear (loaded dynamically via JavaScript)
    // Try both selectors to be safe
    try {
      await page.waitForSelector('#priceBuySell2 span[itemprop="price"]', { timeout: 10000 });
    } catch {
      // Fallback: wait for the ID selector
      await page.waitForSelector('#sellPrice', { timeout: 10000 });
    }

    const priceNumber = await extractPriceFromPage(page);

    if (priceNumber === null) {
      throw new Error('Price not found using JavaScript data extraction.');
    }

    const price = priceNumber;

    console.info(`✅ GoldDealer.com - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape GoldDealer.com - ${productConfig.name}:`, error);
    throw error;
  } finally {
    await safeCloseBrowser(browser);
  }
}
