import type { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';
// Browser is now managed by scrape-all-dealers.ts

/**
 * Extracts the primary price from the HTML snippet, prioritizing the structured
 * data meta tag, then falling back to the lowest tier price in the table.
 *
 * @param page The Playwright Page object.
 * @returns The extracted price as a number (e.g., 4278.69) or null if not found.
 */
async function extractPriceFromPage(page: Page): Promise<number | null> {
  const priceValue = await page.evaluate(() => {
    try {
      // 1. Prioritize Structured Data: Extract from the <meta itemprop="price"> tag
      const metaPriceElement = document.querySelector('meta[itemprop="price"]');

      if (metaPriceElement) {
        // The content attribute is what we need (e.g., "4278.69")
        const priceContent = metaPriceElement.getAttribute('content');
        if (priceContent) {
          const metaPrice = Number.parseFloat(priceContent);
          if (!Number.isNaN(metaPrice) && metaPrice > 0) {
            console.info(`📍 Found price via structured data (meta tag): ${metaPrice}`);
            return metaPrice;
          }
        }
      }

      // 2. Fallback: Extract the lowest tier price (Check/Wire for 25+ quantity)
      const table = document.querySelector('table.product-volume-pricing');
      if (table) {
        // Select the last row in the body (which corresponds to the highest quantity tier: 25+)
        const lastRow = table.querySelector('tbody tr:last-child');
        if (lastRow) {
          // Select the second cell (td) in that row:
          // 1st column is Quantity, 2nd column is Check/Wire (the lowest price option)
          const lowestPriceCell = lastRow.querySelector('td:nth-child(2)');

          if (lowestPriceCell && lowestPriceCell.textContent) {
            const rawPriceText = lowestPriceCell.textContent.trim();
            // Clean the text by removing '$' and ','
            const cleanedPrice = rawPriceText.replaceAll(/[^0-9.]/g, '');
            const price = Number.parseFloat(cleanedPrice);

            if (!Number.isNaN(price) && price > 0) {
              console.info(`📍 Found fallback price via volume table (25+ Check/Wire): ${price}`);
              return price;
            }
          }
        }
      }

      console.warn('⚠️ Could not extract price from meta tag or volume pricing table.');
      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation:', e);
      return null;
    }
  });

  return priceValue;
}

export async function scrapeAMPEX(
  productConfig: ProductConfig,
  baseUrl: string,
  page: Page
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  console.info(`🔍 Scraping AMPEX - ${productConfig.name}...`);

  // Navigate to the product URL (browser is already launched and page is ready)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });

  const priceNumber = await extractPriceFromPage(page);

  if (priceNumber === null) {
    throw new Error('Price not found using JavaScript data extraction.');
  }

  const price = priceNumber;
  const inStock = true; // AMPEX doesn't show out-of-stock, assume in stock

  console.info(`✅ AMPEX - ${productConfig.name}: $${price.toFixed(2)}`);
  return { price, url, productName: productConfig.name, inStock };
}
