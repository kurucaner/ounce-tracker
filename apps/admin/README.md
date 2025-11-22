# OunceTracker Admin Dashboard

Internal admin panel for managing dealers and products in the OunceTracker system.

## Features

✅ **Dealer Management**
- Add new bullion dealers
- Automatic slug generation for URLs
- Website URL tracking

✅ **Product Management**
- Add precious metal products
- Metal type selection (Gold, Silver, Platinum, Palladium)
- Form type selection (Bar, Coin, Round)
- Mint tracking
- Weight in troy ounces

✅ **Modern UI**
- Built with shadcn/ui components
- Clean, intuitive forms
- Real-time validation
- Success/error feedback

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Runtime**: Bun
- **Language**: TypeScript

## Setup

### 1. Environment Variables

Create `.env.local` in `apps/admin/`:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Important**: Use the **service role key**, not the anon key, for admin operations.

### 2. Install Dependencies

From the monorepo root:

```bash
bun install
```

### 3. Run Development Server

```bash
# From monorepo root
bun run dev:admin

# Or from apps/admin
cd apps/admin
bun dev
```

The admin panel will be available at: **http://localhost:3001**

## Usage

### Adding a Dealer

1. Navigate to **Dealers** page
2. Fill in:
   - **Name**: Official business name (e.g., "APMEX")
   - **Slug**: URL-safe identifier (e.g., "apmex")
   - **Website URL**: Optional homepage URL
3. Click "Add Dealer"

### Adding a Product

1. Navigate to **Products** page
2. Fill in:
   - **Name**: Full product name (e.g., "1 oz Gold Bar PAMP Suisse Lady Fortuna")
   - **Mint**: Manufacturer (e.g., "PAMP")
   - **Metal**: Select from dropdown (Gold/Silver/Platinum/Palladium)
   - **Form**: Select from dropdown (Bar/Coin/Round)
   - **Weight**: Weight in troy ounces (e.g., 1)
3. Click "Add Product"

## API Endpoints

### POST `/api/dealers`

Create a new dealer.

**Body:**
```json
{
  "name": "APMEX",
  "slug": "apmex",
  "website_url": "https://www.apmex.com"
}
```

### POST `/api/products`

Create a new product.

**Body:**
```json
{
  "name": "1 oz Gold Bar PAMP Suisse Lady Fortuna",
  "mint": "PAMP",
  "metal": "gold",
  "form": "bar",
  "weight_oz": 1
}
```

## Database Schema

### Dealers Table

```sql
CREATE TABLE public.dealers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  website_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dealers_pkey PRIMARY KEY (id)
);
```

### Products Table

```sql
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mint text NOT NULL,
  metal text NOT NULL,
  form text NOT NULL,
  weight_oz numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
```

## Pages

- **`/`** - Dashboard with quick links
- **`/dealers`** - Add new dealers
- **`/products`** - Add new products

## Components

All UI components are from shadcn/ui:
- `Button` - Action buttons
- `Card` - Content containers
- `Input` - Text inputs
- `Label` - Form labels
- `Select` - Dropdown selectors

## Security

⚠️ **No Authentication**: This admin panel has no authentication. It should:
- Only be accessible on internal networks
- Never be exposed publicly
- Use VPN or firewall rules for access control

## Future Enhancements

- [ ] List existing dealers and products
- [ ] Edit functionality
- [ ] Delete functionality
- [ ] Bulk import from CSV
- [ ] Dealer logo upload
- [ ] Product image management
- [ ] Authentication system

## Development

```bash
# Run linter
bun run lint

# Build for production
bun run build

# Start production server
bun start
```

## Notes

- The admin runs on **port 3001** (web app runs on 3000)
- Uses server-side API routes for database operations
- All forms include validation and error handling
- Styled with Tailwind CSS for consistency

---

**Built with Next.js 15, Bun & Supabase**

