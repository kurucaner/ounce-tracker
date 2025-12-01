import { Page } from 'playwright';
import type { ScraperResult, ProductConfig } from '../../types';
import * as cheerio from 'cheerio';

/**
 * Scraper: AMPEX
 * Uses cheerio to parse static HTML
 * Prioritizes structured data meta tag, falls back to volume pricing table
 */
export async function scrapeAMPEX(
  productConfig: ProductConfig,
  baseUrl: string,
  _page: Page // Not used - this scraper uses fetch instead of browser
): Promise<ScraperResult> {
  const url = baseUrl + productConfig.productUrl;

  try {
    console.info(`🔍 Scraping AMPEX - ${productConfig.name}...`);

    // First, visit the homepage to establish a session and get cookies
    // This helps bypass Cloudflare challenge on subsequent requests
    const homeResponse = await fetch(baseUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      },
    });

    // Extract and parse cookies from the homepage response
    const setCookieHeaders = homeResponse.headers.getSetCookie?.() || [];
    const cookies = setCookieHeaders
      .map((cookie) => {
        // Extract cookie name=value from Set-Cookie header
        const regex = /^([^=]+)=([^;]+)/;
        const match = regex.exec(cookie);
        return match ? `${match[1]}=${match[2]}` : '';
      })
      .filter(Boolean)
      .join('; ');

    // Small delay to let Cloudflare process the initial request
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Now fetch the product page with cookies and proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Referer: baseUrl,
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        Cookie: cookies,
        'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
      },
    });
    if (!response.ok) {
      // Log detailed error information for debugging
      const responseText = await response.text().catch(() => 'Could not read response body');
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.error(`❌ AMPEX fetch failed - Status: ${response.status} ${response.statusText}`);
      console.error(`❌ URL: ${url}`);
      console.error(`❌ Response headers:`, JSON.stringify(responseHeaders, null, 2));
      console.error(`❌ Response body (first 500 chars):`, responseText.substring(0, 500));
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let price: number | null = null;

    // 1. Prioritize Structured Data: Extract from the <meta itemprop="price"> tag
    const metaPriceElement = $('meta[itemprop="price"]').first();
    if (metaPriceElement.length > 0) {
      const priceContent = metaPriceElement.attr('content');
      if (priceContent) {
        const metaPrice = Number.parseFloat(priceContent);
        if (!Number.isNaN(metaPrice) && metaPrice > 0) {
          console.info(`📍 Found price via structured data (meta tag): ${metaPrice}`);
          price = metaPrice;
        }
      }
    }

    // 2. Fallback: Extract the lowest tier price (Check/Wire for 25+ quantity)
    if (price === null) {
      const table = $('table.product-volume-pricing');
      if (table.length > 0) {
        // Select the last row in the body (which corresponds to the highest quantity tier: 25+)
        const lastRow = table.find('tbody tr').last();
        if (lastRow.length > 0) {
          // Select the second cell (td) in that row:
          // 1st column is Quantity, 2nd column is Check/Wire (the lowest price option)
          const lowestPriceCell = lastRow.find('td:nth-child(2)');

          if (lowestPriceCell.length > 0) {
            const rawPriceText = lowestPriceCell.text().trim();
            if (rawPriceText) {
              // Clean the text by removing '$' and ','
              const cleanedPrice = rawPriceText.replaceAll(/[^0-9.]/g, '');
              const parsedPrice = Number.parseFloat(cleanedPrice);

              if (!Number.isNaN(parsedPrice) && parsedPrice > 0) {
                console.info(
                  `📍 Found fallback price via volume table (25+ Check/Wire): ${parsedPrice}`
                );
                price = parsedPrice;
              }
            }
          }
        }
      }
    }

    if (price === null) {
      throw new Error('Price not found in structured data meta tag or volume pricing table.');
    }

    const inStock = true; // AMPEX doesn't show out-of-stock, assume in stock

    console.info(`✅ AMPEX - ${productConfig.name}: $${price.toFixed(2)}`);
    return { price, url, productName: productConfig.name, inStock };
  } catch (error) {
    console.error(`❌ Failed to scrape AMPEX - ${productConfig.name}:`, error);
    throw error;
  }
}
