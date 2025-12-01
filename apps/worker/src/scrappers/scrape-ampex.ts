import type { ScraperResult, ProductConfig } from '../types';
import * as cheerio from 'cheerio';

/**
 * Scraper: AMPEX
 * Uses cheerio to parse static HTML
 * Prioritizes structured data meta tag, falls back to volume pricing table
 */
export async function scrapeAMPEX(
  productConfig: ProductConfig,
  baseUrl: string,
  _page: import('playwright').Page // Not used - this scraper uses fetch instead of browser
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  try {
    console.info(`🔍 Scraping AMPEX - ${productConfig.name}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let price: number | null = null;

    // 1. Prioritize Structured Data: Extract from the <meta itemprop="price"> tag
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

    // 2. Fallback: Extract the lowest tier price (Check/Wire for 25+ quantity)
    if (price === null) {
      const table = $('table.product-volume-pricing');
      if (table.length > 0) {
        // Select the last row in the body (which corresponds to the highest quantity tier: 25+)
        const lastRow = table.find('tbody tr').last();
        if (lastRow.length > 0) {
          // Select the second cell (td) in that row:
          // 1st column is Quantity, 2nd column is Check/Wire (the lowest price option)
          const lowestPriceCell = lastRow.find('td:nth-child(2)');

          if (lowestPriceCell.length > 0) {
            const rawPriceText = lowestPriceCell.text().trim();
            if (rawPriceText) {
              // Clean the text by removing '$' and ','
              const cleanedPrice = rawPriceText.replaceAll(/[^0-9.]/g, '');
              const parsedPrice = Number.parseFloat(cleanedPrice);

              if (!Number.isNaN(parsedPrice) && parsedPrice > 0) {
                console.info(
                  `📍 Found fallback price via volume table (25+ Check/Wire): ${parsedPrice}`
                );
                price = parsedPrice;
              }
            }
          }
        }
      }
    }

    if (price === null) {
      throw new Error('Price not found in structured data meta tag or volume pricing table.');
    }

    const inStock = true; // AMPEX doesn't show out-of-stock, assume in stock

    console.info(`✅ AMPEX - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name, inStock };
  } catch (error) {
    console.error(`❌ Failed to scrape AMPEX - ${productConfig.name}:`, error);
    throw error;
  }
}
