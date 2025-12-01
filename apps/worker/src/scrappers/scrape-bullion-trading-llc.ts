import type { ScraperResult, ProductConfig } from '../types';
import * as cheerio from 'cheerio';

/**
 * Scraper: Bullion Trading LLC
 * Uses cheerio to parse static HTML
 * Extracts price from WooCommerce price elements
 */
export async function scrapeBullionTradingLLC(
  productConfig: ProductConfig,
  baseUrl: string,
  _page: import('playwright').Page // Not used - this scraper uses fetch instead of browser
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  try {
    console.info(`🔍 Scraping Bullion Trading LLC - ${productConfig.name}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let priceText: string | null = null;

    // 1. Target the most specific, persistent price wrapper element
    // which uses the standard WooCommerce class for the price amount.
    const selector = '.woocommerce-Price-amount.amount';
    const priceElement = $(selector).first();

    if (priceElement.length > 0) {
      const text = priceElement.text().trim();
      if (text) {
        console.info('📍 Found price using robust WooCommerce price selector.');
        priceText = text;
      }
    }

    // 2. Fallback: Target the <p class="price"> element and try to extract a standard currency format.
    if (!priceText) {
      console.warn(`⚠️ Could not find price using primary selector: ${selector}`);
      const fallbackElement = $('p.price').first();

      if (fallbackElement.length > 0) {
        const rawText = fallbackElement.text().trim();
        if (rawText.includes('$')) {
          console.warn('⚠️ Found price using <p class="price"> fallback. Applying regex cleanup.');

          // Regex to find a currency format ($X,XXX.XX)
          const priceRegex = /\$?[\d,]+\.\d{2}/;
          const regex = new RegExp(priceRegex);
          const priceMatch = regex.exec(rawText);

          if (priceMatch) {
            priceText = priceMatch[0];
          }
        }
      }
    }

    if (!priceText) {
      throw new Error('Price not found using WooCommerce selectors.');
    }

    const cleanedPrice = priceText.replaceAll(/[^0-9.]/g, '');
    const price = Number.parseFloat(cleanedPrice);

    if (Number.isNaN(price) || price <= 0) {
      throw new Error(`Invalid price parsed: ${priceText}`);
    }

    const inStock = true;

    console.info(`✅ Bullion Trading LLC - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name, inStock };
  } catch (error) {
    console.error(`❌ Failed to scrape Bullion Trading LLC - ${productConfig.name}:`, error);
    throw error;
  }
}
