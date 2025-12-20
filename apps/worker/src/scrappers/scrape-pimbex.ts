import type { ScraperResult, ProductConfig } from '../types';
import * as cheerio from 'cheerio';

/**
 * Scraper: Pimbex
 * Uses cheerio to parse static HTML
 * Extracts price for 1-9 quantity, ACH/Wire payment method from structured UL tier list
 */
export async function scrapePimbex(
  productConfig: ProductConfig,
  baseUrl: string,
  _page: import('playwright').Page // Not used - this scraper uses fetch instead of browser
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  try {
    console.info(`🔍 Scraping Pimbex - ${productConfig.name}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for out-of-stock element
    const outOfStockElement = $('.out-status-blurb').first();
    const isOutOfStock = outOfStockElement.length > 0;

    // Helper function to clean and parse the price string
    const cleanAndParsePrice = (priceString: string): number | null => {
      const cleanedPrice = priceString.replaceAll(/[^0-9.]/g, '');
      const price = Number.parseFloat(cleanedPrice);
      return !Number.isNaN(price) && price > 0 ? price : null;
    };

    let price: number | null = null;
    let inStock = true;

    // 1. Find the specific tier list item for "1 - 9" quantity.
    // We look inside the main container with the ID 'pricingTable' for a tier list.
    if (isOutOfStock) {
      console.info('⚠️ Product is out of stock');
      inStock = false;
      price = 0;
    } else {
      const pricingTable = $('#pricingTable');

      if (pricingTable.length === 0) {
        throw new Error('Could not find the main pricingTable container.');
      }

      // Look for the tier list item where the first <li> contains "1 - 9"
      let targetTier: ReturnType<typeof $> | null = null;
      pricingTable.find('.pricing-tier').each((_, element) => {
        const firstLi = $(element).find('li').first();
        const firstLiText = firstLi.text().trim();
        if (firstLiText === '1 - 9') {
          targetTier = $(element);
          return false; // Break the loop
        }
        return undefined;
      });

      if (!targetTier) {
        throw new Error('Could not find the price for the 1-9 ACH/Wire tier.');
      }

      // 2. The price for "ACH/Wire" is the second <li> in the tier row.
      // (1st li is Quantity, 2nd li is ACH/Wire, 3rd li is Card/PayPal)
      const achWirePriceElement = (targetTier as ReturnType<typeof $>).find('li:nth-child(2)');

      if (achWirePriceElement.length === 0) {
        throw new Error('Could not find ACH/Wire price element in tier.');
      }

      const rawPriceText = achWirePriceElement.text().trim();
      if (!rawPriceText) {
        throw new Error('ACH/Wire price element is empty.');
      }

      console.info(`📍 Found price via structured UL tier (1-9 ACH/Wire): ${rawPriceText}`);

      price = cleanAndParsePrice(rawPriceText);
      if (price === null) {
        throw new Error('Could not parse price from ACH/Wire tier.');
      }
    }

    console.info(`✅ Pimbex - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name, inStock };
  } catch (error) {
    console.error(`❌ Failed to scrape Pimbex - ${productConfig.name}:`, error);
    throw error;
  }
}
