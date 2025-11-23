import type { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';
import { launchBrowser, createPageWithHeaders } from './browser-config';

/**
 * Extracts the "As Low As" price and returns it as a number.
 *
 * @param page The Playwright Page object.
 * @returns The extracted price as a number (e.g., 4266.90) or null if not found.
 */
async function extractPriceFromPage(page: Page): Promise<number | null> {
  const priceValue = await page.evaluate(() => {
    try {
      // Helper function to clean and parse the price string
      const cleanAndParsePrice = (priceString: string): number | null => {
        // Removes non-digit characters except the decimal point (e.g., removes '$', ',', spaces)
        const cleanedPrice = priceString.replaceAll(/[^0-9.]/g, '');
        const price = Number.parseFloat(cleanedPrice);

        if (Number.isNaN(price) || price <= 0) {
          return null;
        }
        return price;
      };

      // 1. Find the "As Low As" text element (the anchor).
      const asLowAsElement = Array.from(document.querySelectorAll('div, span, p')).find(
        (el) => el.textContent?.trim() === 'As Low As'
      );

      if (!asLowAsElement) {
        console.warn('⚠️ Could not find the "As Low As" anchor text.');
        return null;
      }

      // 2. The target price is the immediate next sibling of the container holding "As Low As".
      const priceElement = asLowAsElement.nextElementSibling;

      if (priceElement && priceElement.textContent?.includes('$')) {
        const rawPriceText = priceElement.textContent.trim();
        console.info(`📍 Found price using 'As Low As' sibling navigation: ${rawPriceText}`);

        // Return the cleaned and parsed NUMBER
        return cleanAndParsePrice(rawPriceText);
      }

      console.warn(
        '⚠️ Found "As Low As" but could not find the price in the expected next sibling element.'
      );

      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation:', e);
      return null;
    }
  });

  // Ensure we return null if the cleaning/parsing inside evaluate failed
  return priceValue;
}

export async function scrapeJMBullion(
  productConfig: ProductConfig,
  baseUrl: string
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  let browser;
  try {
    console.info(`🔍 Scraping JM Bullion - ${productConfig.name} (using stealth browser)...`);

    browser = await launchBrowser();
    const page = await createPageWithHeaders(browser);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Wait for the "As Low As" text to appear (loaded dynamically via JavaScript)
    await page.waitForSelector(':text("As Low As")', { timeout: 10000 });

    const priceNumber = await extractPriceFromPage(page);

    if (priceNumber === null) {
      throw new Error('Price not found using JavaScript data extraction.');
    }

    const price = priceNumber;

    console.info(`✅ JM Bullion - ${productConfig.name}: $${price}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape JM Bullion - ${productConfig.name}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
