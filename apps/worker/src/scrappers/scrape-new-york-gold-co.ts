import type { ScraperResult, ProductConfig } from '../types';
import * as cheerio from 'cheerio';

/**
 * Scraper: New York Gold Co
 * Uses cheerio to parse static HTML
 * Selector: span.woocommerce-Price-amount.amount bdi
 */
export async function scrapeNYGoldCo(productConfig: ProductConfig, baseUrl: string): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  try {
    console.info(`🔍 Scraping New York Gold Co - ${productConfig.name}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const priceText = $('span.woocommerce-Price-amount.amount bdi').first().text().trim();

    if (!priceText) {
      throw new Error('Price element not found');
    }

    // Example: "$4,170.49" -> 4170.49
    const cleanedPrice = priceText.replaceAll(/[^0-9.]/g, '');
    const price = Number.parseFloat(cleanedPrice);

    if (Number.isNaN(price) || price <= 0) {
      throw new Error(`Invalid price parsed: ${priceText}`);
    }

    console.info(`✅ NY Gold Co - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape NY Gold Co - ${productConfig.name}:`, error);
    throw error;
  }
}
