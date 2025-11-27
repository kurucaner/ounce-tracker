import type { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';

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

  await randomDelay(3000, 5000);

  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: 60000,
    referer: '',
  });

  await randomDelay(2000, 4000);

  try {
    await page.waitForSelector('.woocommerce-Price-amount.amount', { timeout: 20000 });
  } catch (error) {
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
      console.warn('⚠️ Cloudflare re-challenging detected, waiting longer...');
      await randomDelay(2000, 3000);
      await page.waitForSelector('.woocommerce-Price-amount.amount', { timeout: 20000 });
    } else {
      throw error;
    }
  }

  const priceText = await extractBullionTradingPriceFromPage(page);

  if (!priceText) {
    throw new Error('Price not found on page after JavaScript rendering');
  }

  const cleanedPrice = priceText.replaceAll(/[^0-9.]/g, '');
  const price = Number.parseFloat(cleanedPrice);

  if (Number.isNaN(price) || price <= 0) {
    throw new Error(`Invalid price parsed: ${priceText}`);
  }

  const inStock = true;

  console.info(`✅ Bullion Trading LLC - ${productConfig.name}: $${price.toFixed(2)}`);
  return { price, url, productName: productConfig.name, inStock };
}
