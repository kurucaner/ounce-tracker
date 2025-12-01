import type { ScraperResult, ProductConfig } from '../types';
import * as cheerio from 'cheerio';

/**
 * Scraper: BGASC
 * Uses cheerio to parse static HTML
 * Prioritizes span with ID starting with 'price_', falls back to data-price attribute
 */
export async function scrapeBGASC(
  productConfig: ProductConfig,
  baseUrl: string,
  _page: import('playwright').Page // Not used - this scraper uses fetch instead of browser
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  try {
    console.info(`🔍 Scraping BGASC - ${productConfig.name}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for out-of-stock element
    const outOfStockElement = $('.out-of-stock-info').first();
    const isOutOfStock = outOfStockElement.length > 0;

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

    let price: number | null = null;
    let inStock = true;

    // 1. Target the element: Inside .payment-inner, find a span whose ID starts with 'price_'.
    const primarySelector = '.payment-inner span[id^="price_"]';
    const priceElement = $(primarySelector).first();

    if (priceElement.length > 0) {
      const rawPriceText = priceElement.text().trim();
      if (rawPriceText) {
        console.info(`📍 Found price via ID selector: ${primarySelector} - ${rawPriceText}`);
        price = cleanAndParsePrice(rawPriceText);
      }
    }

    // 2. Fallback: Use the most robust data attribute from the table (1+ Qty, Check/Wire price)
    if (price === null) {
      console.warn('⚠️ Could not find price using the requested ID selector.');
      const fallbackSelector = '#producttable tbody tr:first-child td:first-child + td[data-price]';
      const fallbackPriceCell = $(fallbackSelector).first();

      if (fallbackPriceCell.length > 0) {
        const priceContent = fallbackPriceCell.attr('data-price');

        if (priceContent) {
          const parsedPrice = Number.parseFloat(priceContent);
          if (!Number.isNaN(parsedPrice) && parsedPrice > 0) {
            console.info(
              `📍 Found fallback price via data attribute ('data-price'): ${parsedPrice}`
            );
            price = parsedPrice;
          }
        }
      }
    }

    if (isOutOfStock) {
      console.info('⚠️ Product is out of stock');
      inStock = false;
      price = 0;
    } else {
      if (price === null) {
        throw new Error('Price not found using ID selector or data-price attribute fallback.');
      }
    }

    console.info(`✅ BGASC - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name, inStock };
  } catch (error) {
    console.error(`❌ Failed to scrape BGASC - ${productConfig.name}:`, error);
    throw error;
  }
}
