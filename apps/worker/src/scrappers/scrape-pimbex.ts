import type { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';
import { launchBrowser, createPageWithHeaders } from './browser-config';

/**
 * Extracts the price for the 1-9 quantity, ACH/Wire payment method,
 * from the structured <ul> list table.
 *
 * @param page The Playwright Page object.
 * @returns The extracted price as a number (e.g., 4181.20) or null if not found.
 */
async function extractPriceFromPage(page: Page): Promise<number | null> {
  const priceValue = await page.evaluate(() => {
    try {
      // Helper function to clean and parse the price string
      const cleanAndParsePrice = (priceString: string): number | null => {
        const cleanedPrice = priceString.replaceAll(/[^0-9.]/g, '');
        const price = Number.parseFloat(cleanedPrice);
        return !Number.isNaN(price) && price > 0 ? price : null;
      };

      // 1. Find the specific tier list item for "1 - 9" quantity.
      // We look inside the main container with the ID 'pricingTable' for a tier list.
      const pricingTable = document.getElementById('pricingTable');

      if (!pricingTable) {
        console.warn('⚠️ Could not find the main pricingTable container.');
        return null;
      }

      // Look for the tier list item where the first <li> contains "1 - 9"
      const tierSelector = '.pricing-tier';
      const targetTier = Array.from(pricingTable.querySelectorAll(tierSelector)).find(
        (ul) => ul.querySelector('li')?.textContent?.trim() === '1 - 9'
      );

      if (targetTier) {
        // 2. The price for "ACH/Wire" is the second <li> in the tier row.
        // (1st li is Quantity, 2nd li is ACH/Wire, 3rd li is Card/PayPal)
        const achWirePriceElement = targetTier.querySelector('li:nth-child(2)');

        if (achWirePriceElement && achWirePriceElement.textContent) {
          const rawPriceText = achWirePriceElement.textContent.trim();
          console.info(`📍 Found price via structured UL tier (1-9 ACH/Wire): ${rawPriceText}`);

          // Return the cleaned and parsed NUMBER
          return cleanAndParsePrice(rawPriceText);
        }
      }

      console.warn('⚠️ Could not find the price for the 1-9 ACH/Wire tier.');

      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation:', e);
      return null;
    }
  });

  return priceValue;
}

export async function scrapePimbex(
  productConfig: ProductConfig,
  baseUrl: string
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  let browser;
  try {
    console.info(`🔍 Scraping Pimbex - ${productConfig.name} (using stealth browser)...`);

    browser = await launchBrowser();
    const page = await createPageWithHeaders(browser);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Wait for the pricing table to appear (loaded dynamically via JavaScript)
    await page.waitForSelector('#pricingTable', { timeout: 10000 });

    const priceNumber = await extractPriceFromPage(page);

    if (priceNumber === null) {
      throw new Error('Price not found using JavaScript data extraction.');
    }

    const price = priceNumber;

    console.info(`✅ Pimbex - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape Pimbex - ${productConfig.name}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
