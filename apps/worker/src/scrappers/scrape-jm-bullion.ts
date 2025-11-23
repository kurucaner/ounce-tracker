import { chromium } from 'playwright-extra';
import type { Page } from 'playwright';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { ScraperResult, ProductConfig } from '../types';

// Add stealth plugin to avoid detection
chromium.use(StealthPlugin());

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
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

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
