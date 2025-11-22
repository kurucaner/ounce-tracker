# PAMP Lady Fortuna Price Scraper

## Overview
Automated scraper that fetches live prices for the PAMP Suisse Lady Fortuna 1 oz Gold Bar from multiple dealers and updates the Supabase database.

## Features
✅ **Two Dealer Scrapers**:
- New York Gold Co
- Bullion Exchanges

✅ **Robust Error Handling**: Continues scraping even if one dealer fails  
✅ **TypeScript Type Safety**: Fully typed with no `any`  
✅ **Service Role Authentication**: Uses Supabase service role key for secure DB writes  
✅ **Detailed Logging**: Console output for monitoring scraper progress  
✅ **Automatic Updates**: Updates `price`, `product_url`, and `last_updated` fields  

## Setup

### 1. Environment Variables

Create `.env` file in `apps/worker/`:

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
NODE_ENV=development
```

⚠️ **Important**: Use the **service role key**, NOT the anon key. The anon key cannot write to the database with RLS enabled.

### 2. Database Prerequisites

Ensure these records exist in your Supabase database:

**Product** (`products` table):
```sql
INSERT INTO products (name, mint, metal)
VALUES ('1 oz Gold Bar PAMP Suisse Lady Fortuna', 'PAMP', 'gold');
```

**Dealers** (`dealers` table):
```sql
INSERT INTO dealers (name, slug) VALUES
  ('New York Gold Co', 'new-york-gold-co'),
  ('Bullion Exchanges', 'bullion-exchanges');
```

**Dealer Listings** (`dealer_listings` table):
```sql
-- Create empty listings that the scraper will populate
INSERT INTO dealer_listings (dealer_id, product_id, price, currency, in_stock, product_url)
SELECT 
  d.id,
  p.id,
  0.00,
  'USD',
  true,
  ''
FROM dealers d
CROSS JOIN products p
WHERE d.slug IN ('new-york-gold-co', 'bullion-exchanges')
  AND p.name = '1 oz Gold Bar PAMP Suisse Lady Fortuna';
```

## Usage

### Run Manually

From the worker directory:
```bash
cd apps/worker
bun run scrape:lady-fortuna
```

From the monorepo root:
```bash
cd apps/worker && bun run scrape:lady-fortuna
```

### Expected Output

```
🚀 Starting PAMP Lady Fortuna price scraper...

📦 Fetching product: "1 oz Gold Bar PAMP Suisse Lady Fortuna"...
✅ Product ID: abc123...

🔍 Scraping New York Gold Co...
✅ NY Gold Co: $4170.49
💾 Updated new-york-gold-co: $4170.49

🔍 Scraping Bullion Exchanges...
✅ Bullion Exchanges: $4153.20
💾 Updated bullion-exchanges: $4153.20

✅ Scraping completed!
📊 Updated prices: {
  "ny_gold_co": 4170.49,
  "bullion_exchanges": 4153.20
}
```

## Scraper Details

### New York Gold Co

**URL**: `https://nygoldco.com/gold/gold-bars/1-oz-gold-bar-pamp-suisse-lady-fortuna-in-assay/`

**Selector**: `span.woocommerce-Price-amount.amount bdi`

**Price Format**: `"$4,170.49"`

**Implementation**:
- Fetches HTML from product page
- Parses price using Cheerio CSS selector
- Strips non-numeric characters (except decimal point)
- Converts to float

### Bullion Exchanges

**URL**: `https://bullionexchanges.com/1-oz-gold-bar-pamp-suisse-lady-fortuna-veriscan-carbon-neutral-in-assay`

**Selector**: `div.grid-JMDT.body-Pez9.even-hEsE` (second cell)

**Price Grid Format**:
```html
<div class="grid-JMDT body-Pez9 even-hEsE">
  <div>1-4</div>
  <div>$4,153.20</div>   ← Target price
  <div>$4,195.15</div>
  <div>$4,326.25</div>
</div>
```

**Implementation**:
- Fetches HTML from product page
- Finds pricing grid container
- Extracts all cell values
- Uses second cell (index 1) as the target price
- Strips non-numeric characters and converts to float

## Error Handling

The scraper includes multiple layers of error handling:

1. **HTTP Errors**: Catches and logs failed requests
2. **Parsing Errors**: Validates that selectors return expected data
3. **Price Validation**: Ensures parsed prices are valid numbers > 0
4. **Database Errors**: Catches and logs Supabase update failures
5. **Partial Success**: Continues with remaining scrapers if one fails

If all scrapers fail, the script exits with code 1.

## Code Structure

```typescript
// Main components
run()                        // Orchestrates the entire scraping process
scrapeNYGoldCo()            // Scrapes New York Gold Co
scrapeBullionExchanges()    // Scrapes Bullion Exchanges
updateListingPrice()        // Updates Supabase dealer_listings table
```

## Scheduling (Future)

To run this scraper on a schedule, integrate with the existing worker scheduler:

```typescript
// In apps/worker/src/index.ts
import { run as scrapeLadyFortuna } from './scrape-lady-fortuna';

scheduler.scheduleJob(
  'scrape-lady-fortuna',
  30 * 60 * 1000, // Every 30 minutes
  async () => {
    await scrapeLadyFortuna();
  }
);
```

## Extending to More Dealers

To add a new dealer:

1. **Create scraper function**:
```typescript
async function scrapeNewDealer(): Promise<ScraperResult> {
  const url = 'https://newdealer.com/product';
  const html = await fetch(url).then(res => res.text());
  const $ = cheerio.load(html);
  
  const priceText = $('.price-selector').text().trim();
  const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
  
  return { price, url };
}
```

2. **Add to database**:
```sql
INSERT INTO dealers (name, slug) 
VALUES ('New Dealer', 'new-dealer');

INSERT INTO dealer_listings (dealer_id, product_id, price, currency, in_stock, product_url)
SELECT d.id, p.id, 0.00, 'USD', true, ''
FROM dealers d, products p
WHERE d.slug = 'new-dealer' 
  AND p.name = '1 oz Gold Bar PAMP Suisse Lady Fortuna';
```

3. **Add to run() function**:
```typescript
try {
  const { price, url } = await scrapeNewDealer();
  await updateListingPrice('new-dealer', product.id, price, url);
  results.new_dealer = price;
} catch (error) {
  console.error('⚠️  Skipping New Dealer due to error\n');
}
```

## Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY"
- Ensure `.env` file exists in `apps/worker/`
- Use service role key, not anon key
- Check key is correctly formatted (starts with `eyJ...`)

### "Product not found"
- Verify product exists in database with exact name: `"1 oz Gold Bar PAMP Suisse Lady Fortuna"`
- Check for extra spaces or different capitalization

### "Dealer not found"
- Ensure dealer slugs match exactly:
  - `new-york-gold-co`
  - `bullion-exchanges`
- Check dealers table for correct slug values

### Price parsing returns NaN
- Website HTML structure may have changed
- Check selector still returns price element
- Verify price format hasn't changed

## Testing Selectors

To test selectors without running the full script:

```typescript
const html = await fetch('url').then(r => r.text());
const $ = cheerio.load(html);
console.log($('your-selector').text());
```

## Dependencies

- **cheerio**: HTML parsing and CSS selector queries
- **@supabase/supabase-js**: Supabase client for database operations

Both are installed in the worker app's package.json.

## License

Proprietary - Part of OunceTracker monorepo

