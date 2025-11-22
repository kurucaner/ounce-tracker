import { chromium, Page } from 'playwright';
import { ENDPOINTS } from './endpoints';

// Existing Project Context & Types
export interface ScraperResult {
  price: number;
  url: string;
}

/**
 * Extracts the initial price from the embedded JavaScript data.
 * It targets the 'initialFinalPrice' variable inside the initPrice475 function.
 *
 * @param page The Playwright Page object.
 * @returns The raw price number or null if not found.
 */
async function extractPriceFromPage(page: Page): Promise<number | null> {
  const priceValue = await page.evaluate(() => {
    try {
      // 1. Find the script block containing the price initialization function (initPrice475)
      // Note: We use querySelector('script:contains("...")') which is an extension sometimes used
      // in jQuery/some tools. For Playwright's page.evaluate, standard DOM is safer.
      const allScripts = Array.from(document.querySelectorAll('script'));
      const scriptElement = allScripts.find((s) => s.textContent?.includes('initPrice475'));

      if (!scriptElement || !scriptElement.textContent) {
        console.warn('⚠️ Could not find the price initialization script block.');
        return null;
      }

      const scriptContent = scriptElement.textContent;

      // 2. Use a regex to extract the initialFinalPrice value (which is the 1-4 price)
      // This is the most direct target.
      const initialPriceMatch = scriptContent.match(/initialFinalPrice:\s*(\d+\.?\d*),/);

      if (initialPriceMatch && initialPriceMatch[1]) {
        const price = Number.parseFloat(initialPriceMatch[1]);
        if (!Number.isNaN(price) && price > 0) {
          console.log(`📍 Found initial price via JavaScript variable: ${price}`);
          return price;
        }
      }

      // 3. Fallback: Extract the first tier price (for quantity 5)
      const tierPricesMatch = scriptContent.match(/initialTierPrices:\s*(\[.*?\]),/s);

      if (tierPricesMatch && tierPricesMatch[1]) {
        // Parse the extracted JSON string
        const tierPricesJsonString = tierPricesMatch[1];
        const tierPrices = JSON.parse(tierPricesJsonString);

        if (Array.isArray(tierPrices) && tierPrices.length > 0) {
          // Extract the price for the lowest tier quantity (e.g., qty 5)
          const firstTierPrice = tierPrices[0].website_price;
          const price = Number.parseFloat(firstTierPrice);

          if (!Number.isNaN(price) && price > 0) {
            console.log(`📍 Found first tier price (qty 5+) via JavaScript variable: ${price}`);
            return price;
          }
        }
      }

      console.warn('⚠️ Could not extract price using either initial price or tier price regex.');
      return null;
    } catch (e) {
      console.error('❌ Error during DOM evaluation / JSON parsing:', e);
      return null;
    }
  });

  return priceValue;
}

export async function scrapeNYCBullion(): Promise<ScraperResult> {
  const url =
    ENDPOINTS.NYC_BULLION['1-oz-gold-bar-pamp-suisse-lady-fortuna'].url +
    ENDPOINTS.NYC_BULLION['1-oz-gold-bar-pamp-suisse-lady-fortuna'].productUrl;

  let browser;
  try {
    console.log('🔍 Scraping NYC Bullion...');

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

    console.log(`✅ NYC Bullion: $${price.toFixed(2)}`);
    return { price, url };
  } catch (error) {
    console.error('❌ Failed to scrape NYC Bullion:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
