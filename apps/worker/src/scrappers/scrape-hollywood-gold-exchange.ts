import type { ScraperResult, ProductConfig } from '../types';
import * as cheerio from 'cheerio';

/**
 * Scraper: Hollywood Gold Exchange
 * Uses cheerio to parse static HTML
 * Prioritizes GTM hidden data, falls back to WooCommerce price structure
 */
export async function scrapeHollywoodGoldExchange(
  productConfig: ProductConfig,
  baseUrl: string,
  _page: import('playwright').Page // Not used - this scraper uses fetch instead of browser
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  try {
    console.info(`🔍 Scraping Hollywood Gold Exchange - ${productConfig.name}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Helper function to clean and parse the price string
    const cleanAndParsePrice = (priceString: string): number | null => {
      // Removes non-digit characters except the decimal point (e.g., removes '$', ',', spaces)
      const cleanedPrice = priceString.replaceAll(/[^0-9.]/g, '');
      const price = Number.parseFloat(cleanedPrice);
      return !Number.isNaN(price) && price > 0 ? price : null;
    };

    // Check for out-of-stock element
    // Multiple selectors to catch different variations of out-of-stock indicators

    const outOfStockP = $('p.stock.out-of-stock').first();

    const isOutOfStock = outOfStockP.length > 0;

    let price: number | null = null;
    let inStock = true;

    if (isOutOfStock) {
      console.info('⚠️ Product is out of stock');
      inStock = false;
      price = 0;
    } else {
      // 1. **PRIORITY: GTM Hidden Data**
      // Find the hidden input containing the GTM JSON data and extract the price property.
      const gtmInput = $('input[name="gtm4wp_product_data"][type="hidden"]').first();

      if (gtmInput.length > 0) {
        const jsonString = gtmInput.attr('value');
        if (jsonString) {
          try {
            // Unescape and parse the JSON string to get the price number
            const unescapedString = jsonString.replaceAll('&quot;', '"');
            const gtmData = JSON.parse(unescapedString);

            if (gtmData && gtmData.price) {
              const parsedPrice = Number.parseFloat(gtmData.price);
              if (!Number.isNaN(parsedPrice) && parsedPrice > 0) {
                console.info(`📍 Found price via robust GTM data attribute: ${parsedPrice}`);
                price = parsedPrice;
              }
            }
          } catch {
            console.warn('⚠️ Failed to parse GTM JSON data.');
          }
        }
      }

      // 2. **FALLBACK: Specific WooCommerce Price Structure**
      if (price === null) {
        const priceSelector = 'p.price span.woocommerce-Price-amount.amount';
        const priceElement = $(priceSelector).first();

        if (priceElement.length > 0) {
          const rawPriceText = priceElement.text().trim();
          if (rawPriceText) {
            console.warn(`⚠️ Found price via WooCommerce structure fallback: ${rawPriceText}`);
            price = cleanAndParsePrice(rawPriceText);
          }
        }
      }

      if (price === null) {
        throw new Error('Price not found using GTM data or WooCommerce fallback.');
      }
    }

    console.info(`✅ Hollywood Gold Exchange - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name, inStock };
  } catch (error) {
    console.error(`❌ Failed to scrape Hollywood Gold Exchange - ${productConfig.name}:`, error);
    throw error;
  }
}
