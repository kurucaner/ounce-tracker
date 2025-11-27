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

/**
 * Random delay to simulate human behavior
 * Returns a delay between min and max milliseconds
 */
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

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

  // Add a longer random delay before navigation to make it look more human-like
  // Cloudflare tracks rapid navigation patterns, so we need longer delays
  await randomDelay(5000, 10000); // 5-10 seconds random delay before navigation

  // Navigate to the product URL with networkidle to ensure all resources are loaded
  // This is important for Cloudflare-protected sites
  // Set referer to empty string to prevent history tracking
  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: 60000,
    referer: '', // No referrer to prevent history tracking
  });

  // After Cloudflare challenge, add a longer delay to let the page fully settle
  // This helps avoid triggering another challenge immediately
  await randomDelay(2000, 4000);

  // Wait for the price element to appear (with longer timeout for Cloudflare sites)
  // If challenge completed, this should work. If not, we'll get a clear error.
  try {
    await page.waitForSelector('.woocommerce-Price-amount.amount', { timeout: 20000 });
  } catch (error) {
    // If price element not found, check if we're still on a challenge page
    const isStillChallenging = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return (
        bodyText.includes('challenges.cloudflare.com') ||
        bodyText.includes('Checking your browser') ||
        bodyText.includes('Please wait') ||
        bodyText.includes('Just a moment')
      );
    });
    if (isStillChallenging) {
      // If we're being re-challenged, wait longer and try to get clearance again
      console.warn('⚠️ Cloudflare re-challenging detected, waiting longer...');
      await randomDelay(2000, 3000); // Longer delay after re-challenge
      // Try waiting for price element again
      await page.waitForSelector('.woocommerce-Price-amount.amount', { timeout: 20000 });
    } else {
      throw error; // Re-throw original error if not a challenge issue
    }
  }

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
