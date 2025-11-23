import type { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';
import { launchBrowser, createPageWithHeaders } from './browser-config';

/**
 * Extracts the primary product price by prioritizing the structured GTM data attribute,
 * and falls back to the main WooCommerce price element.
 *
 * @param page The Playwright Page object.
 * @returns The extracted price as a number (e.g., 4326.70) or null if not found.
 */
async function extractPriceFromPage(page: Page): Promise<number | null> {
  const priceValue = await page.evaluate(() => {
    try {
      // Helper function to clean and parse the price string
      const cleanAndParsePrice = (priceString: string): number | null => {
        // Removes non-digit characters except the decimal point (e.g., removes '$', ',', spaces)
        const cleanedPrice = priceString.replaceAll(/[^0-9.]/g, '');
        const price = Number.parseFloat(cleanedPrice);
        return !Number.isNaN(price) && price > 0 ? price : null;
      };

      // 1. **PRIORITY: GTM Hidden Data**
      // Find the hidden input containing the GTM JSON data and extract the price property.
      const gtmInput = document.querySelector('input[name="gtm4wp_product_data"][type="hidden"]');

      if (gtmInput) {
        const jsonString = gtmInput.getAttribute('value');
        if (jsonString) {
          try {
            // Unescape and parse the JSON string to get the price number
            const unescapedString = jsonString.replace(/&quot;/g, '"');
            const gtmData = JSON.parse(unescapedString);

            if (gtmData && gtmData.price) {
              const price = Number.parseFloat(gtmData.price);
              if (!Number.isNaN(price) && price > 0) {
                console.info(`📍 Found price via robust GTM data attribute: ${price}`);
                return price;
              }
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse GTM JSON data.');
          }
        }
      }

      // 2. **FALLBACK: Specific WooCommerce Price Structure**
      // Target the main price using the specific WooCommerce structure,
      // which is usually the immediate sibling of the product title or inside <p class="price">.
      const priceSelector = 'p.price span.woocommerce-Price-amount.amount';
      const priceElement = document.querySelector(priceSelector);

      if (priceElement && priceElement.textContent) {
        const rawPriceText = priceElement.textContent.trim();
        console.warn(`⚠️ Found price via WooCommerce structure fallback: ${rawPriceText}`);

        // Return the cleaned and parsed NUMBER
        return cleanAndParsePrice(rawPriceText);
      }

      console.warn('⚠️ Could not extract price using GTM data or WooCommerce fallback.');
      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation:', e);
      return null;
    }
  });

  return priceValue;
}

export async function scrapeHollywoodGoldExchange(
  productConfig: ProductConfig,
  baseUrl: string
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  let browser;
  try {
    console.info(
      `🔍 Scraping Hollywood Gold Exchange - ${productConfig.name} (using stealth browser)...`
    );

    browser = await launchBrowser();
    const page = await createPageWithHeaders(browser);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const priceNumber = await extractPriceFromPage(page);

    if (priceNumber === null) {
      throw new Error('Price not found using JavaScript data extraction.');
    }

    const price = priceNumber;

    console.info(`✅ Hollywood Gold Exchange - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape Hollywood Gold Exchange - ${productConfig.name}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
