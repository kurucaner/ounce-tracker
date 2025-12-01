import { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';
import * as cheerio from 'cheerio';

/**
 * Scraper: SD Bullion
 * Uses cheerio to parse static HTML
 * Prioritizes data-price-amount attribute, falls back to table structure
 */
export async function scrapeSDBullion(
  productConfig: ProductConfig,
  baseUrl: string,
  _page: Page // Not used - this scraper uses fetch instead of browser
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  try {
    console.info(`🔍 Scraping SD Bullion - ${productConfig.name}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for out-of-stock element
    const outOfStockElement = $('p.unavailable.stock').first();
    const isOutOfStock = outOfStockElement.length > 0;

    let price: number | null = null;
    let inStock = true;

    if (isOutOfStock) {
      console.info('⚠️ Product is out of stock');
      inStock = false;
      price = 0;
    } else {
      // 1. Prioritize the Check/Wire (cash_price) price via its data attribute.
      const cashPriceSelector = 'span[data-nfusions-payment-type="cash_price"][data-price-amount]';
      const priceElement = $(cashPriceSelector).first();

      if (priceElement.length > 0) {
        const priceContent = priceElement.attr('data-price-amount');

        if (priceContent) {
          const parsedPrice = Number.parseFloat(priceContent);
          if (!Number.isNaN(parsedPrice) && parsedPrice > 0) {
            console.info(`📍 Found price via data attribute ('cash_price'): ${parsedPrice}`);
            price = parsedPrice;
          }
        }
      }

      // 2. Fallback: Extract the same price from the visible <strong> tag.
      if (price === null) {
        const table = $('table.prices-tier.items');
        if (table.length > 0) {
          // Find the second cell (td) of the first data row (1+)
          const firstRowPriceCell = table.find('tbody tr:first-child td:nth-child(2)');

          if (firstRowPriceCell.length > 0) {
            const strongPriceElement = firstRowPriceCell.find('strong.price-formatted');

            if (strongPriceElement.length > 0) {
              const rawPriceText = strongPriceElement.text().trim();

              if (rawPriceText) {
                // Clean the text by removing '$' and ','
                const cleanedPrice = rawPriceText.replaceAll(/[^0-9.]/g, '');
                const parsedPrice = Number.parseFloat(cleanedPrice);

                if (!Number.isNaN(parsedPrice) && parsedPrice > 0) {
                  console.info(`📍 Found fallback price via table structure: ${parsedPrice}`);
                  price = parsedPrice;
                }
              }
            }
          }
        }
      }

      if (price === null) {
        throw new Error('Price not found using data attribute or table structure fallback.');
      }
    }

    console.info(`✅ SD Bullion - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name, inStock };
  } catch (error) {
    console.error(`❌ Failed to scrape SD Bullion - ${productConfig.name}:`, error);
    throw error;
  }
}
