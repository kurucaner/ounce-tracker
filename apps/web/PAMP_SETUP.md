# PAMP Lady Fortuna Price Comparison Setup

## Overview
This feature allows users to compare prices for the PAMP Suisse Lady Fortuna 1 oz Gold Bar across multiple dealers.

## Files Created

### 1. **Types** (`src/types/database.ts`)
- Database types for `Product`, `Dealer`, and `DealerListing`
- API response types: `ProductListingItem` and `ProductListingsResponse`

### 2. **Supabase Client** (`src/lib/supabase.ts`)
- Utility to create Supabase client with environment variables
- Error handling for missing environment variables

### 3. **API Route** (`src/app/api/pamp/lady-fortuna/route.ts`)
- Fetches dealer listings from Supabase
- Joins `dealer_listings`, `products`, and `dealers` tables
- Filters for the specific PAMP product
- Sorts results by price (lowest first)
- Returns typed JSON response

### 4. **UI Components**
- `src/components/ui/table.tsx` - shadcn/ui Table component
- `src/components/ui/badge.tsx` - Badge component for stock status

### 5. **Page Component** (`src/app/pamp/lady-fortuna/page.tsx`)
- Server component that fetches from the API route
- Displays results in a responsive table
- Features:
  - Price formatting with currency
  - Stock status badges (green for in stock, red for out of stock)
  - Links to dealer pages and product URLs
  - Formatted date/time for last update
  - Mobile-responsive design

## Setup Instructions

### 1. Environment Variables

Create `.env.local` in `apps/web/`:

```bash
# Supabase Configuration (server-side only, no NEXT_PUBLIC prefix)
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Base URL for API calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Note**: We use server-side environment variables (without `NEXT_PUBLIC_` prefix) for Supabase to keep credentials secure.

### 2. Database Schema

Ensure your Supabase tables match:

**products**
- `id` (uuid, primary key)
- `name` (text)
- `mint` (text)
- `metal` (text)

**dealers**
- `id` (uuid, primary key)
- `name` (text)
- `slug` (text)

**dealer_listings**
- `id` (uuid, primary key)
- `dealer_id` (uuid, foreign key to dealers)
- `product_id` (uuid, foreign key to products)
- `price` (numeric)
- `currency` (text)
- `in_stock` (boolean)
- `product_url` (text)
- `last_updated` (timestamp)

### 3. Run the Application

```bash
# From the root of the monorepo
bun run dev:web

# Or from apps/web
cd apps/web
bun dev
```

### 4. Access the Page

Visit: http://localhost:3000/pamp/lady-fortuna

## API Endpoints

### GET `/api/pamp/lady-fortuna`

Returns price comparison data for the PAMP Lady Fortuna product.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "dealerName": "APMEX",
      "dealerSlug": "apmex",
      "price": 2358.50,
      "currency": "USD",
      "inStock": true,
      "productUrl": "https://dealer.com/product",
      "lastUpdated": "2025-11-20T10:30:00Z"
    }
  ]
}
```

## Features

✅ **Server-Side Rendering**: Fast initial page load with SSR  
✅ **Type Safety**: Full TypeScript coverage with no `any` types  
✅ **Responsive Design**: Mobile-friendly table with horizontal scroll  
✅ **Real-time Data**: Fetches fresh data on each page load  
✅ **Sorting**: Products sorted by price (lowest first)  
✅ **Visual Indicators**: Color-coded badges for stock status  
✅ **External Links**: Direct links to dealer product pages  
✅ **Date Formatting**: Human-readable timestamps  

## Mobile Responsiveness

The table is wrapped in a responsive container that:
- Scrolls horizontally on small screens
- Maintains readability on all devices
- Uses appropriate column widths

## Future Enhancements

- [ ] Add filtering by dealer
- [ ] Add sorting options (price, dealer name, stock status)
- [ ] Add price history charts
- [ ] Add email alerts for price drops
- [ ] Add comparison with spot price
- [ ] Add premium calculations

