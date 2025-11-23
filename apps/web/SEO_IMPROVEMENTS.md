# SEO Improvements for OunceTracker

## Overview
Comprehensive SEO enhancements implemented to improve search engine visibility and rankings for the precious metal price comparison platform.

## Implemented Features

### 1. **Dynamic Metadata Generation** (`app/page.tsx`)
- ✅ Dynamic title and description based on actual product/dealer counts
- ✅ Comprehensive keyword optimization
- ✅ Open Graph tags for social media sharing
- ✅ Twitter Card metadata
- ✅ Canonical URLs
- ✅ Robots meta tags with Google-specific directives

**Example Output:**
```
Title: "OunceTracker - Compare Precious Metal Prices | Gold & Silver Bullion"
Description: "Compare prices for 3+ precious metal products from 4 trusted bullion dealers..."
```

### 2. **Structured Data (JSON-LD)** (`components/structured-data.tsx`)
Implements Schema.org markup for:
- ✅ **Organization Schema** - Company information
- ✅ **Website Schema** - Site-wide information with search action
- ✅ **Service Schema** - Price comparison service details
- ✅ **Product Schema** - Individual product information with offers
- ✅ **Breadcrumb Schema** - Navigation structure

**Benefits:**
- Rich snippets in search results
- Enhanced Google Knowledge Graph
- Better understanding of your business
- Product price information in search

### 3. **Sitemap Generation** (`app/sitemap.ts`)
- ✅ Dynamic sitemap with all product pages
- ✅ Automatic updates when products are added
- ✅ Proper priority and change frequency
- ✅ Last modified dates

**Routes Included:**
- Homepage (priority: 1.0, hourly updates)
- Insights page (priority: 0.8, weekly updates)
- Product pages (priority: 0.9, hourly updates)

### 4. **Robots.txt** (`app/robots.ts`)
- ✅ Allows all search engines
- ✅ Blocks API routes and admin pages
- ✅ Points to sitemap location
- ✅ Googlebot-specific rules

### 5. **Semantic HTML Improvements**
- ✅ `<section>` elements with aria-labels
- ✅ Proper table headers with `scope` attributes
- ✅ Improved accessibility and SEO

## SEO Keywords Targeted

### Primary Keywords:
- precious metals
- gold prices
- silver prices
- bullion prices
- gold bars
- silver coins

### Long-tail Keywords:
- precious metal comparison
- bullion dealers
- gold price tracker
- silver price tracker
- best gold prices
- best silver prices
- compare bullion prices

### Brand Keywords:
- PAMP Suisse
- Royal Canadian Mint
- gold bar prices
- silver coin prices

## Next Steps (Recommended)

### 1. **Create OG Image**
Create `/public/og-image.png` (1200x630px) with:
- OunceTracker logo
- Tagline: "Compare Precious Metal Prices"
- Visual of gold/silver bars

### 2. **Set Environment Variables**
Add to `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. **Google Search Console**
1. Verify your domain
2. Submit sitemap: `https://yourdomain.com/sitemap.xml`
3. Monitor performance

### 4. **Google Analytics**
Add tracking code to `app/layout.tsx` for:
- User behavior tracking
- Conversion tracking
- Search query analysis

### 5. **Additional Optimizations**
- [ ] Add alt text to all images
- [ ] Implement hreflang tags (if multi-language)
- [ ] Add FAQ schema (if adding FAQ section)
- [ ] Create blog/content section for more keywords
- [ ] Add review/rating schema (if collecting reviews)

## Testing Your SEO

### 1. **Google Rich Results Test**
Visit: https://search.google.com/test/rich-results
- Test your homepage URL
- Verify structured data is valid

### 2. **PageSpeed Insights**
Visit: https://pagespeed.web.dev/
- Check Core Web Vitals
- Optimize images if needed

### 3. **Mobile-Friendly Test**
Visit: https://search.google.com/test/mobile-friendly
- Ensure responsive design works

### 4. **Check Sitemap**
Visit: `https://yourdomain.com/sitemap.xml`
- Verify all routes are included
- Check last modified dates

## Expected Results

### Short-term (1-3 months):
- ✅ Better indexing by search engines
- ✅ Rich snippets in search results
- ✅ Improved social media sharing previews

### Long-term (3-6 months):
- 📈 Higher rankings for target keywords
- 📈 Increased organic traffic
- 📈 Better click-through rates from search results
- 📈 More brand visibility

## Monitoring

Track these metrics:
1. **Google Search Console** - Impressions, clicks, CTR
2. **Google Analytics** - Organic traffic, bounce rate
3. **Rankings** - Track keyword positions
4. **Backlinks** - Monitor domain authority

## Notes

- All metadata is dynamically generated based on actual data
- Sitemap automatically includes new products
- Structured data updates with product changes
- No manual updates needed when adding products/dealers

