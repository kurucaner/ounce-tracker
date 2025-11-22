/**
 * PAMP Suisse Lady Fortuna Price Scraper
 * Fetches live prices from multiple dealers and updates Supabase
 */

import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import { type ScraperResult } from './types';
import { scrapeBullionExchanges } from './scrape-bullion-exchanges';

// Product identifier
const PRODUCT_NAME = '1 oz Gold Bar PAMP Suisse Lady Fortuna';

// Initialize Supabase client with service role key
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

/**
 * Scraper #1: New York Gold Co
 * URL: https://nygoldco.com/gold/gold-bars/1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay/
 * Selector: span.woocommerce-Price-amount.amount bdi
 */
async function scrapeNYGoldCo(): Promise<ScraperResult> {
  const url =
    'https://nygoldco.com/gold/gold-bars/1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay/';

  try {
    console.log('🔍 Scraping New York Gold Co...');
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

    console.log(`✅ NY Gold Co: $${price.toFixed(2)}`);
    return { price, url };
  } catch (error) {
    console.error('❌ Failed to scrape NY Gold Co:', error);
    throw error;
  }
}

/**
 * Update dealer listing in Supabase
 */
async function updateListingPrice(
  dealerSlug: string,
  productId: string,
  price: number,
  productUrl: string
): Promise<void> {
  try {
    // Get dealer ID
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', dealerSlug)
      .single();

    if (dealerError || !dealer) {
      throw new Error(`Dealer not found: ${dealerSlug}`);
    }

    // Update dealer listing
    const { error: updateError } = await supabase
      .from('dealer_listings')
      .update({
        price,
        product_url: productUrl,
        last_updated: new Date().toISOString(),
      })
      .eq('dealer_id', dealer.id)
      .eq('product_id', productId);

    if (updateError) {
      throw new Error(`Failed to update listing: ${updateError.message}`);
    }

    console.log(`💾 Updated ${dealerSlug}: $${price.toFixed(2)}`);
  } catch (error) {
    console.error(`❌ Failed to update ${dealerSlug}:`, error);
    throw error;
  }
}

/**
 * Main execution
 */
async function run(): Promise<void> {
  console.log('🚀 Starting PAMP Lady Fortuna price scraper...\n');

  // Validate environment variables
  if (!process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  try {
    // Get product ID
    console.log(`📦 Fetching product: "${PRODUCT_NAME}"...`);
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('name', PRODUCT_NAME)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${PRODUCT_NAME}`);
    }

    console.log(`✅ Product ID: ${product.id}\n`);

    // Scrape and update each dealer
    const results: Record<string, number> = {};

    // New York Gold Co
    try {
      const { price: nyPrice, url: nyUrl } = await scrapeNYGoldCo();
      await updateListingPrice('new-york-gold-co', product.id, nyPrice, nyUrl);
      results.ny_gold_co = nyPrice;
    } catch (error) {
      console.error('⚠️  Skipping NY Gold Co due to error:', error);
    }

    // Bullion Exchanges
    try {
      const { price: exPrice, url: exUrl } = await scrapeBullionExchanges();
      await updateListingPrice('bullion-exchanges', product.id, exPrice, exUrl);
      results.bullion_exchanges = exPrice;
    } catch (error) {
      console.error('⚠️  Skipping Bullion Exchanges due to error:', error);
    }

    // Summary
    console.log('\n✅ Scraping completed!');
    console.log('📊 Updated prices:', JSON.stringify(results, null, 2));

    if (Object.keys(results).length === 0) {
      throw new Error('All scrapers failed');
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the scraper (top-level await)
await run();
