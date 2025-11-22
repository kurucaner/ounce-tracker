import { chromium } from 'playwright-extra';
import type { Page } from 'playwright';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { ScraperResult, ProductConfig } from '../types';

// Add stealth plugin to avoid detection
chromium.use(StealthPlugin());

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
export async function scrapeBullionTradingLLC(productConfig: ProductConfig, baseUrl: string): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  let browser;
  try {
    console.info(`🔍 Scraping Bullion Trading LLC - ${productConfig.name} (using stealth browser)...`);

    // Launch browser with stealth plugin (automatically handles bot detection)
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

    // Navigate and wait for content
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Wait for the price element to appear
    await page.waitForSelector('.woocommerce-Price-amount.amount', { timeout: 30000 });

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

    console.info(`✅ Bullion Trading LLC - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape Bullion Trading LLC - ${productConfig.name}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
