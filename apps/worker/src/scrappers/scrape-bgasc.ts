import type { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';

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
  baseUrl: string,
  page: Page
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  console.info(`🔍 Scraping BGASC - ${productConfig.name}...`);

  // Navigate to the product URL (browser is already launched and page is ready)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });

  // Wait for the price element to appear (loaded dynamically via JavaScript)
  // Try primary selector first, fallback to table
  try {
    await page.waitForSelector('.payment-inner span[id^="price_"]', { timeout: 10000 });
  } catch {
    // Fallback: wait for the product table
    await page.waitForSelector('#producttable', { timeout: 10000 });
  }

  const priceNumber = await extractPriceFromPage(page);

  if (priceNumber === null) {
    throw new Error('Price not found using JavaScript data extraction.');
  }

  const price = priceNumber;
  const inStock = true; // BGASC doesn't show out-of-stock, assume in stock

  console.info(`✅ BGASC - ${productConfig.name}: $${price.toFixed(2)}`);
  return { price, url, productName: productConfig.name, inStock };
}
