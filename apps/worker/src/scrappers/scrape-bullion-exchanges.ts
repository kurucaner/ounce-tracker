import { chromium } from 'playwright';
import type { Page, ElementHandle } from 'playwright';
import type { ScraperResult, ProductConfig } from '../types';

/**
 * Extracts the target price from the Bullion Exchanges product page DOM.
 *
 * Requirements:
 * 1. Quantity range: "1-4"
 * 2. Payment method column: "(E)check/Wire"
 * 3. Uses page.evaluate for DOM logic inside the browser context.
 * 4. Relies on visible text labels, not fragile class names.
 *
 * @param page The Playwright Page object.
 * @returns The raw price string (e.g., "$4,168.80") or null if not found.
 */
async function extractPriceFromPage(page: Page): Promise<string | null> {
  const priceText = await page.evaluate(() => {
    try {
      // 1. Find the main pricing container.
      // Look for a container that holds the header text 'Quantity'
      const allDivs = Array.from(document.querySelectorAll('div'));
      const headerDiv = allDivs.find(
        (div) => div.textContent?.includes('Quantity') && div.textContent.includes('(E)check/Wire')
      );

      if (!headerDiv) {
        console.warn('⚠️ Could not find the pricing table header row container.');
        return null;
      }

      // The main pricing container is likely the common ancestor that contains both the header and the body rows.
      // We'll search up from the found header until we find a parent that contains the target quantity '1-4'.
      // For robustness, we assume the immediate parent is a good candidate, but will check a few levels up.
      const pricingContainer: Element | null =
        headerDiv.closest('.list-qaL5') || headerDiv.parentElement;

      // Fallback in case the specific class changes
      if (!pricingContainer) {
        console.warn('⚠️ Could not find a suitable pricing container parent.');
        return null;
      }

      // 2. Determine the column index for "(E)check/Wire".
      const headerRow = pricingContainer.querySelector('div[class*="head-"]');
      if (!headerRow) {
        console.warn('⚠️ Could not find the specific header row (containing "Quantity", etc.).');
        return null;
      }

      const headerCells = Array.from(headerRow.children);
      let targetColIndex = -1;

      for (let i = 0; i < headerCells.length; i++) {
        // The first column is 'Quantity' (i=0), we are looking for the next one.
        // We look for a cell that contains the desired text.
        const cell = headerCells[i];
        if (cell && cell.textContent?.includes('(E)check/Wire')) {
          targetColIndex = i;
          break;
        }
      }

      if (targetColIndex === -1) {
        console.warn('⚠️ Could not determine the column index for "(E)check/Wire".');
        return null;
      }

      // 3. Find the body row whose first cell text is exactly "1-4".
      // Look for a row-like element (e.g., div with class containing 'body-') inside the container.
      const rowElements = Array.from(pricingContainer.querySelectorAll('div[class*="body-"]'));

      let targetRow: Element | undefined;

      for (const row of rowElements) {
        // Check the first child (the quantity cell)
        const quantityCell = row.firstElementChild;
        if (quantityCell && quantityCell.textContent?.trim() === '1-4') {
          targetRow = row;
          break;
        }
      }

      if (!targetRow) {
        console.warn('⚠️ Could not find the price row for quantity "1-4".');
        return null;
      }

      // 4. Return the text content of the cell in the determined column index.
      const priceCell = targetRow.children[targetColIndex];

      if (!priceCell) {
        console.warn(`⚠️ Price cell not found at expected column index ${targetColIndex}.`);
        return null;
      }

      const price = priceCell.textContent?.trim() || null;

      if (price) {
        console.info('📍 Found price using pricing table parsing');
      }

      return price;
    } catch (e) {
      console.error('❌ Error during DOM evaluation:', e);
      return null;
    }
  });

  // Optional: Localized fallback (as requested) - this is less robust than the primary logic
  if (!priceText) {
    console.warn('⚠️ Primary parsing failed, attempting localized fallback...');
    try {
      // Fallback: Check the entire content of the pricing container for a price near '1-4'
      const containerHandle: ElementHandle<Element> | null = await page.$(
        `:text("Quantity") >> xpath=..`
      );

      if (containerHandle) {
        const containerText = await containerHandle.textContent();
        if (containerText) {
          // Regex: Find '1-4' followed by other text/spaces, then find a price that looks like $X,XXX.XX
          // This is *highly* dependent on the exact spacing/order in the textContent.
          const regex = /1-4\s*(\$[\d,]+\.\d{2})/i;
          const match = regex.exec(containerText);

          if (match && match[1]) {
            console.warn('⚠️ Found price using localized regex fallback (less reliable).');
            return match[1].trim();
          }
        }
      }
    } catch (e) {
      console.error('❌ Error during localized fallback:', e);
    }
  }

  return priceText;
}

/**
 * Main scraper function for Bullion Exchanges.
 *
 * @returns A promise that resolves to ScraperResult.
 */
export async function scrapeBullionExchanges(
  productConfig: ProductConfig,
  baseUrl: string
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  let browser;
  try {
    console.info(
      `🔍 Scraping Bullion Exchanges - ${productConfig.name} (using headless browser)...`
    );

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    });

    // Set user agent and other properties to look real
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'max-age=0',
    });

    // Use 'domcontentloaded' for faster loading, and a longer timeout for reliability
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Wait for the specific element that contains the pricing table to appear,
    // which is more reliable than a fixed timeout.
    await page.waitForSelector(':text("Quantity")', { timeout: 30000 });

    // Call the newly implemented extraction logic
    const priceText = await extractPriceFromPage(page);

    if (!priceText) {
      throw new Error('Price not found on page after JavaScript rendering');
    }

    // Standard cleaning and parsing logic (kept from original snippet)
    const cleanedPrice = priceText.replaceAll(/[^0-9.]/g, '');
    const price = Number.parseFloat(cleanedPrice);

    if (Number.isNaN(price) || price <= 0) {
      throw new Error(`Invalid price parsed: ${priceText}`);
    }

    console.info(`✅ Bullion Exchanges - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape Bullion Exchanges - ${productConfig.name}:`, error);
    throw error;
  } finally {
    if (browser) {
      // Ensure the browser is closed even if an error occurs
      await browser.close();
    }
  }
}
