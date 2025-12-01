import type { ScraperResult, ProductConfig } from '../types';
import * as cheerio from 'cheerio';

/**
 * Scraper: JM Bullion
 * Uses cheerio to parse static HTML
 * Finds "As Low As" text and extracts price from next sibling element
 */
export async function scrapeJMBullion(
  productConfig: ProductConfig,
  baseUrl: string,
  _page: import('playwright').Page // Not used - this scraper uses fetch instead of browser
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  try {
    console.info(`🔍 Scraping JM Bullion - ${productConfig.name}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for out-of-stock element
    // Search for "Currently Out of Stock" text in the HTML
    let isOutOfStock = false;
    $('*').each((_, element) => {
      const text = $(element).text();
      if (text.includes('Currently Out of Stock')) {
        isOutOfStock = true;
        return false; // Break the loop
      }
      return undefined;
    });

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

    if (isOutOfStock) {
      console.info('⚠️ Product is out of stock');
      inStock = false;
      price = 0;
    } else {
      // Try multiple methods to extract price from static HTML

      // Method 1: Check for structured data meta tag (like AMPEX)
      const metaPriceElement = $('meta[itemprop="price"]').first();
      if (metaPriceElement.length > 0) {
        const priceContent = metaPriceElement.attr('content');
        if (priceContent) {
          const metaPrice = Number.parseFloat(priceContent);
          if (!Number.isNaN(metaPrice) && metaPrice > 0) {
            console.info(`📍 Found price via structured data (meta tag): ${metaPrice}`);
            price = metaPrice;
          }
        }
      }

      // Method 2: Check for price in script tags (like NYC Bullion)
      if (price === null) {
        const scripts = $('script');
        scripts.each((_, scriptElement) => {
          const scriptContent = $(scriptElement).html() || '';
          // Look for common price patterns in JavaScript
          const pricePatterns = [
            /price["\s:]*(\d+\.?\d*)/i,
            /"price"["\s:]*(\d+\.?\d*)/i,
            /priceAmount["\s:]*(\d+\.?\d*)/i,
            /finalPrice["\s:]*(\d+\.?\d*)/i,
          ];

          for (const pattern of pricePatterns) {
            const regex = new RegExp(pattern);
            const match = regex.exec(scriptContent);
            if (match && match[1]) {
              const foundPrice = Number.parseFloat(match[1]);
              if (!Number.isNaN(foundPrice) && foundPrice > 1000 && foundPrice < 100000) {
                // Reasonable price range for gold bars
                console.info(`📍 Found price via script tag pattern: ${foundPrice}`);
                price = foundPrice;
                return false; // Break the loop
              }
            }
          }
          return undefined;
        });
      }

      // Method 3: Check for data attributes with price
      if (price === null) {
        const priceDataElements = $('[data-price], [data-price-amount], [data-value]');
        priceDataElements.each((_, element) => {
          const dataPrice =
            $(element).attr('data-price') ||
            $(element).attr('data-price-amount') ||
            $(element).attr('data-value');
          if (dataPrice) {
            const parsedPrice = Number.parseFloat(dataPrice);
            if (!Number.isNaN(parsedPrice) && parsedPrice > 1000 && parsedPrice < 100000) {
              console.info(`📍 Found price via data attribute: ${parsedPrice}`);
              price = parsedPrice;
              return false; // Break the loop
            }
          }
          return undefined;
        });
      }

      // Method 4: Try to find "As Low As" text (original method - may not work if loaded dynamically)
      if (price === null) {
        let asLowAsElement: ReturnType<typeof $> | null = null;
        $('div, span, p').each((_, element) => {
          const text = $(element).text().trim();
          if (text === 'As Low As') {
            asLowAsElement = $(element);
            return false; // Break the loop
          }
          return undefined;
        });

        if (asLowAsElement) {
          const priceElement = (asLowAsElement as ReturnType<typeof $>).next();
          if (priceElement.length > 0) {
            const rawPriceText = priceElement.text().trim();
            if (rawPriceText.includes('$')) {
              console.info(`📍 Found price using 'As Low As' sibling navigation: ${rawPriceText}`);
              price = cleanAndParsePrice(rawPriceText);
            }
          }
        }
      }

      // If all methods failed, throw error
      if (price === null) {
        throw new Error(
          'Could not find price using any method (meta tags, script tags, data attributes, or "As Low As" text). The price may be loaded dynamically via JavaScript.'
        );
      }
    }

    console.info(`✅ JM Bullion - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name, inStock };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to scrape JM Bullion - ${productConfig.name}: ${errorMessage}`);
    throw error;
  }
}
