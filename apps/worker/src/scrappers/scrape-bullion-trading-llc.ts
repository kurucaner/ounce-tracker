import type { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';
// Browser is now managed by scrape-all-dealers.ts

/**
 * Extracts the primary price from the Bullion Trading LLC product page DOM.
 *
 * Requirements:
 * 1. Target the main visible price.
 * 2. Rely on robust WooCommerce class names to be "future-proof-ish".
 *
 * @param page The Playwright Page object.
 * @returns The raw price string (e.g., "$4,346.89") or null if not found.
 */
async function extractBullionTradingPriceFromPage(page: Page): Promise<string | null> {
  const priceText = await page.evaluate(() => {
    try {
      // 1. Target the most specific, persistent price wrapper element
      // which uses the standard WooCommerce class for the price amount.
      const selector = '.woocommerce-Price-amount.amount';
      const priceElement = document.querySelector(selector);

      if (priceElement && priceElement.textContent) {
        console.info('📍 Found price using robust WooCommerce price selector.');
        // The text content should contain the currency symbol and price, e.g., "$4,346.89"
        return priceElement.textContent.trim();
      }

      console.warn(`⚠️ Could not find price using primary selector: ${selector}`);

      // 2. Fallback: Target the <p class="price"> element and try to extract a standard currency format.
      const fallbackElement = document.querySelector('p.price');
      if (
        fallbackElement &&
        fallbackElement.textContent &&
        fallbackElement.textContent.includes('$')
      ) {
        console.warn('⚠️ Found price using <p class="price"> fallback. Applying regex cleanup.');

        const rawText = fallbackElement.textContent.trim();
        // Regex to find a currency format ($X,XXX.XX)
        const priceRegex = /\$?[\d,]+\.\d{2}/;
        const priceMatch = priceRegex.exec(rawText);

        return priceMatch ? priceMatch[0] : null;
      }

      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation:', e);
      return null;
    }
  });

  return priceText;
}

// --------------------------------------------------------------------------------

/**
 * Main scraper function for Bullion Trading LLC.
 *
 * @returns A promise that resolves to ScraperResult.
 */
export async function scrapeBullionTradingLLC(
  productConfig: ProductConfig,
  baseUrl: string,
  page: Page
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  console.info(`🔍 Scraping Bullion Trading LLC - ${productConfig.name}...`);

  // Navigate to the product URL (browser is already launched and page is ready)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });

  // Wait for the price element to appear
  await page.waitForSelector('.woocommerce-Price-amount.amount', { timeout: 10000 });

  // Call the extraction logic
  const priceText = await extractBullionTradingPriceFromPage(page);

  if (!priceText) {
    throw new Error('Price not found on page after JavaScript rendering');
  }

  // Standard cleaning and parsing logic
  // Removes non-digit characters except the decimal point (e.g., removes '$', ',')
  const cleanedPrice = priceText.replaceAll(/[^0-9.]/g, '');
  const price = Number.parseFloat(cleanedPrice);

  if (Number.isNaN(price) || price <= 0) {
    throw new Error(`Invalid price parsed: ${priceText}`);
  }

  const inStock = true; // Bullion Trading LLC doesn't show out-of-stock, assume in stock

  console.info(`✅ Bullion Trading LLC - ${productConfig.name}: $${price.toFixed(2)}`);
  return { price, url, productName: productConfig.name, inStock };
}
