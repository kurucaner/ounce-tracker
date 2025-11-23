import { chromium } from 'playwright-extra';
import type { Page } from 'playwright';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { ScraperResult, ProductConfig } from '../types';
import { safeCloseBrowser } from './browser-utils';

// Add stealth plugin to avoid detection
chromium.use(StealthPlugin());

/**
 * Extracts the primary price by locating the <span id="price_..."> element
 * inside the payment-inner container.
 *
 * @param page The Playwright Page object.
 * @returns The extracted price as a number (e.g., 4198.90) or null if not found.
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

      // 1. Target the element based on your specific request:
      // Inside .payment-inner, find a span whose ID starts with 'price_'.
      const primarySelector = '.payment-inner span[id^="price_"]';
      const priceElement = document.querySelector(primarySelector);

      if (priceElement && priceElement.textContent) {
        const rawPriceText = priceElement.textContent.trim();
        console.info(`📍 Found price via ID selector: ${primarySelector} - ${rawPriceText}`);

        // Return the cleaned and parsed NUMBER
        return cleanAndParsePrice(rawPriceText);
      }

      console.warn('⚠️ Could not find price using the requested ID selector.');

      // 2. Fallback: Use the most robust data attribute from the table (1+ Qty, Check/Wire price)
      const fallbackSelector = '#producttable tbody tr:first-child td:first-child + td[data-price]';
      const fallbackPriceCell = document.querySelector(fallbackSelector);

      if (fallbackPriceCell) {
        const priceContent = fallbackPriceCell.getAttribute('data-price');

        if (priceContent) {
          const price = Number.parseFloat(priceContent);
          if (!Number.isNaN(price) && price > 0) {
            console.info(`📍 Found fallback price via data attribute ('data-price'): ${price}`);
            return price;
          }
        }
      }

      console.warn('⚠️ Could not extract price using the ID or the robust table fallback.');
      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation:', e);
      return null;
    }
  });

  return priceValue;
}

export async function scrapeBGASC(
  productConfig: ProductConfig,
  baseUrl: string
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  let browser;
  try {
    console.info(`🔍 Scraping BGASC - ${productConfig.name} (using stealth browser)...`);

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

    console.info(`✅ BGASC - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape BGASC - ${productConfig.name}:`, error);
    throw error;
  } finally {
    await safeCloseBrowser(browser);
  }
}
