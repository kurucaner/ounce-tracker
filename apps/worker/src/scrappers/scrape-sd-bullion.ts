import { chromium } from 'playwright-extra';
import type { Page } from 'playwright';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { ScraperResult, ProductConfig } from '../types';
import { safeCloseBrowser } from './browser-utils';

// Add stealth plugin to avoid detection
chromium.use(StealthPlugin());

/**
 * Extracts the price for the 1+ quantity, Check/Wire payment method.
 * It prioritizes extracting the price from the robust 'data-price-amount' attribute.
 *
 * @param page The Playwright Page object.
 * @returns The extracted price as a number (e.g., 4208.40) or null if not found.
 */
async function extractPriceFromPage(page: Page): Promise<number | null> {
  const priceValue = await page.evaluate(() => {
    try {
      // 1. Prioritize the Check/Wire (cash_price) price via its data attribute.
      // This selector is highly specific and relies on semantic data keys.
      const cashPriceSelector = 'span[data-nfusions-payment-type="cash_price"][data-price-amount]';
      const priceElement = document.querySelector(cashPriceSelector);

      if (priceElement) {
        const priceContent = priceElement.getAttribute('data-price-amount');

        if (priceContent) {
          const price = Number.parseFloat(priceContent);
          if (!Number.isNaN(price) && price > 0) {
            console.info(`📍 Found price via data attribute ('cash_price'): ${price}`);
            return price;
          }
        }
      }

      // 2. Fallback: Extract the same price from the visible <strong> tag.
      // This is less reliable but uses the structure: Table -> first row -> 2nd column -> strong tag
      const table = document.querySelector('table.prices-tier.items');
      if (table) {
        // Find the second cell (td) of the first data row (1+)
        const firstRowPriceCell = table.querySelector('tbody tr:first-child td:nth-child(2)');

        if (firstRowPriceCell) {
          const strongPriceElement = firstRowPriceCell.querySelector('strong.price-formatted');

          if (strongPriceElement && strongPriceElement.textContent) {
            const rawPriceText = strongPriceElement.textContent.trim();

            // Clean the text by removing '$' and ','
            const cleanedPrice = rawPriceText.replaceAll(/[^0-9.]/g, '');
            const price = Number.parseFloat(cleanedPrice);

            if (!Number.isNaN(price) && price > 0) {
              console.info(`📍 Found fallback price via table structure: ${price}`);
              return price;
            }
          }
        }
      }

      console.warn('⚠️ Could not extract price using data attribute or table structure fallback.');
      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation:', e);
      return null;
    }
  });

  return priceValue;
}

export async function scrapeSDBullion(
  productConfig: ProductConfig,
  baseUrl: string
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  let browser;
  try {
    console.info(`🔍 Scraping SD Bullion - ${productConfig.name} (using stealth browser)...`);

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'max-age=0',
    });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const priceNumber = await extractPriceFromPage(page);

    if (priceNumber === null) {
      throw new Error('Price not found using JavaScript data extraction.');
    }

    const price = priceNumber;

    console.info(`✅ SD Bullion - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name };
  } catch (error) {
    console.error(`❌ Failed to scrape SD Bullion - ${productConfig.name}:`, error);
    throw error;
  } finally {
    await safeCloseBrowser(browser);
  }
}
