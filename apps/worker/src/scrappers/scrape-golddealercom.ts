import type { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';
// Browser is now managed by scrape-all-dealers.ts

/**
 * Checks if the product is out of stock by looking for "Sold Out" text
 *
 * @param page The Playwright Page object.
 * @returns True if product is sold out, false otherwise.
 */
async function checkOutOfStock(page: Page): Promise<boolean> {
  const isOutOfStock = await page.evaluate(() => {
    // Check for "Sold Out" text within the priceBuySell2 container
    const priceContainer = document.getElementById('priceBuySell2');
    if (priceContainer && priceContainer.textContent) {
      const text = priceContainer.textContent.trim();
      return text.includes('Sold Out');
    }
    return false;
  });

  return isOutOfStock;
}

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
  baseUrl: string,
  page: Page
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  console.info(`🔍 Scraping GoldDealer.com - ${productConfig.name}...`);

  // Navigate to the product URL (browser is already launched and page is ready)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });

  // Wait for the price container to appear
  await page.waitForSelector('#priceBuySell2', { timeout: 10000 });

  // Check if product is out of stock
  const isOutOfStock = await checkOutOfStock(page);

  let price = 0;
  let inStock = true;

  if (isOutOfStock) {
    console.info('⚠️ Product is out of stock');
    inStock = false;
  } else {
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

    price = priceNumber;
  }

  console.info(`✅ GoldDealer.com - ${productConfig.name}: $${price.toFixed(2)}`);
  return { price, url, productName: productConfig.name, inStock };
}
