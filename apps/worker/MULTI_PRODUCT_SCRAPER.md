# Multi-Product Scraper Architecture

## Overview

The scraper system has been refactored to support multiple products per dealer. This allows you to scrape and track prices for any number of products across all configured dealers.

## Architecture

### Key Components

1. **Types** (`src/types.ts`)
   - `ScraperResult`: Contains price, URL, and product name
   - `ProductConfig`: Defines product name and URL path
   - `DealerConfig`: Contains dealer info and array of products
   - `ScraperFunction`: Type signature for scraper functions

2. **Endpoints** (`src/scrappers/endpoints.ts`)
   - `DEALERS`: Array of dealer configurations
   - Each dealer has multiple products with their URLs

3. **Individual Scrapers** (`src/scrappers/scrape-*.ts`)
   - Refactored to accept `productConfig` and `baseUrl` parameters
   - Generic functions that work for any product from the same dealer
   - Return `ScraperResult` with product information

4. **Orchestrators**
   - `scrape-all-dealers.ts`: Scrapes ALL products for ALL dealers
   - `scrape-lady-fortuna.ts`: Legacy scraper for single product (PAMP Lady Fortuna)

## Usage

### Running the Scraper

```bash
# Scrape all products for all dealers
bun run scrape:all

# Legacy: Scrape only PAMP Lady Fortuna
bun run scrape:lady-fortuna
```

### Adding New Products

To add a new product to track, update `src/scrappers/endpoints.ts`:

```typescript
export const DEALERS: DealerConfig[] = [
  {
    name: 'New York Gold Co',
    slug: 'new-york-gold-co',
    url: 'https://nygoldco.com',
    products: [
      {
        name: '1 oz Gold Bar PAMP Suisse Lady Fortuna',
        productUrl: '/gold/gold-bars/1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay',
      },
      {
        name: '1 oz Gold Bar Royal Canadian Mint',
        productUrl: '/gold/gold-bars/1-oz-gold-bar-royal-canadian-mint-new-style-in-assay',
      },
      // Add your new product here
      {
        name: 'Your New Product Name',
        productUrl: '/path/to/product',
      },
    ],
  },
  // ... other dealers
];
```

**Important**: The product name must EXACTLY match the name in your database `products` table.

### Adding New Dealers

1. Add dealer configuration to `DEALERS` array in `endpoints.ts`
2. Create a new scraper file: `src/scrappers/scrape-your-dealer.ts`
3. Implement the scraper function with signature:
   ```typescript
   export async function scrapeYourDealer(
     productConfig: ProductConfig,
     baseUrl: string
   ): Promise<ScraperResult>
   ```
4. Add to scraper map in `scrape-all-dealers.ts`:
   ```typescript
   const SCRAPER_MAP: Record<string, ScraperFunction> = {
     'your-dealer-slug': scrapeYourDealer,
     // ... other dealers
   };
   ```

## Database Integration

### Required Database Tables

1. **dealers**
   - `id`: UUID
   - `slug`: Text (must match dealer slug in code)
   - `name`: Text
   - `website_url`: Text

2. **products**
   - `id`: UUID
   - `name`: Text (must match product name in code)
   - `mint`: Text
   - `metal`: Text
   - `form`: Text
   - `weight_oz`: Numeric

3. **dealer_listings**
   - `id`: UUID
   - `dealer_id`: UUID (foreign key to dealers)
   - `product_id`: UUID (foreign key to products)
   - `price`: Numeric
   - `currency`: Text
   - `in_stock`: Boolean
   - `product_url`: Text
   - `updated_at`: Timestamp

### How Updates Work

The scraper uses `upsert` to update or create listings:
- If a listing exists for the dealer+product combination, it updates the price
- If no listing exists, it creates a new one
- Uses dealer slug and product name to find the correct IDs

## Example Output

```
🚀 Starting multi-product scraper for all dealers...

🏢 Scraping New York Gold Co...
🔍 Scraping New York Gold Co - 1 oz Gold Bar PAMP Suisse Lady Fortuna...
✅ NY Gold Co - 1 oz Gold Bar PAMP Suisse Lady Fortuna: $4,170.49
💾 Updated new-york-gold-co - 1 oz Gold Bar PAMP Suisse Lady Fortuna: $4170.49
🔍 Scraping New York Gold Co - 1 oz Gold Bar Royal Canadian Mint...
✅ NY Gold Co - 1 oz Gold Bar Royal Canadian Mint: $3,850.00
💾 Updated new-york-gold-co - 1 oz Gold Bar Royal Canadian Mint: $3850.00

🏢 Scraping Bullion Exchanges...
...

✅ Scraping completed!
📊 Updated prices:

  new-york-gold-co:
    - 1 oz Gold Bar PAMP Suisse Lady Fortuna: $4170.49
    - 1 oz Gold Bar Royal Canadian Mint: $3850.00

  bullion-exchanges:
    - 1 oz Gold Bar PAMP Suisse Lady Fortuna: $4168.80
    - 1 oz Gold Bar Royal Canadian Mint: $3845.00

📈 Total listings updated: 8
```

## Error Handling

- Each product scrape is wrapped in try-catch
- Failed products are logged but don't stop other scrapes
- Failed dealers are logged but don't stop other dealers
- Summary shows which products were successfully updated

## Benefits

1. **Scalability**: Easy to add new products without code changes
2. **Maintainability**: Single scraper function per dealer
3. **Flexibility**: Can scrape all products or filter by product
4. **Robustness**: Individual failures don't stop entire process
5. **Visibility**: Detailed logging for each product/dealer combination

## Migration Notes

If you were using the old single-product scrapers:
- Old scraper functions still work but require new parameters
- Legacy `scrape-lady-fortuna.ts` has been updated to use new architecture
- Recommended to switch to `scrape-all-dealers.ts` for production use

