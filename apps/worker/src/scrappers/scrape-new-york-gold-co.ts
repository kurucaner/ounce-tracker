import { ScraperResult } from '../types';
import * as cheerio from 'cheerio';
import { ENDPOINTS } from './endpoints';

/**
 * Scraper #1: New York Gold Co
 * URL: https://nygoldco.com/gold/gold-bars/1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay/
 * Selector: span.woocommerce-Price-amount.amount bdi
 */
export async function scrapeNYGoldCo(): Promise<ScraperResult> {
  const url =
    ENDPOINTS.NY_GOLD_CO['1-oz-gold-bar-pamp-suisse-lady-fortuna'].url +
    ENDPOINTS.NY_GOLD_CO['1-oz-gold-bar-pamp-suisse-lady-fortuna'].productUrl;

  try {
    console.info('🔍 Scraping New York Gold Co...');
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

    console.info(`✅ NY Gold Co: $${price.toFixed(2)}`);
    return { price, url };
  } catch (error) {
    console.error('❌ Failed to scrape NY Gold Co:', error);
    throw error;
  }
}
