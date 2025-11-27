# OunceTracker

A comprehensive Bun-based monorepo for tracking and comparing precious metal (bullion) prices across multiple dealers.

## 🏗️ Architecture

This project is built as a **monorepo** using Bun workspaces with the following structure:

```
OunceTracker/
├── apps/
│   ├── web/          # Next.js 15 frontend with shadcn/ui
│   ├── api/          # Fastify backend API
│   └── worker/       # Background worker for scrapers/jobs
├── packages/
│   └── shared/       # Shared TypeScript utilities, types, and configs
├── docker-compose.yml
└── package.json      # Root workspace configuration
```

### Tech Stack

- **Package Manager**: Bun
- **Language**: TypeScript (strict mode)
- **Frontend**: Next.js 15 (App Router), React 18, Tailwind CSS, shadcn/ui
- **Backend API**: Fastify with Bun runtime
- **Worker**: Custom job scheduler with Bun
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Containerization**: Docker & docker-compose
- **Code Quality**: ESLint, Prettier

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.1.34 or higher)
- [Docker](https://www.docker.com) (for containerized deployment)
- [Docker Compose](https://docs.docker.com/compose/) (usually included with Docker)

### Local Development Setup

1. **Clone the repository** (or initialize if starting fresh):

```bash
cd /Users/canerkuru/Desktop/Projects/OunceTracker
```

2. **Install dependencies**:

```bash
bun install
```

This will install all dependencies for all workspaces (root, apps, and packages).

3. **Build the shared package**:

```bash
cd packages/shared
bun run build
cd ../..
```

4. **Run all applications in development mode**:

```bash
# Run all apps simultaneously
bun run dev
```

Or run them individually:

```bash
# Frontend (Next.js) - http://localhost:3000
bun run dev:web

# API (Fastify) - http://localhost:4000
bun run dev:api

# Worker (Background Jobs)
bun run dev:worker
```

### Docker Deployment

To run the entire stack using Docker:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

The following services will be available:

- **Web Frontend**: http://localhost:3000
- **API Backend**: http://localhost:4000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📦 Project Structure

### Apps

#### `apps/web` - Frontend Application

Next.js 15 application with:

- App Router architecture
- shadcn/ui component library
- Tailwind CSS for styling
- TypeScript with strict mode
- Imports shared types from `@shared` package

**Key Files**:

- `src/app/page.tsx` - Homepage
- `src/components/ui/` - shadcn/ui components
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind configuration

**Development**:

```bash
cd apps/web
bun dev          # Start dev server
bun run build    # Build for production
bun start        # Start production server
bun run lint     # Lint code
```

#### `apps/api` - Backend API

Fastify-based REST API with:

- Health check endpoints
- Product management routes
- CORS, Helmet, Rate Limiting
- Structured logging with Pino
- Uses shared types from `@shared` package

**Key Endpoints**:

- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID

**Development**:

```bash
cd apps/api
bun dev          # Start dev server with hot reload
bun run build    # Build for production
bun start        # Start production server
bun run lint     # Lint code
```

#### `apps/worker` - Background Worker

Custom job scheduler for:

- Scraping dealer websites
- Updating spot prices
- Running background jobs

**Features**:

- Job scheduler with configurable intervals
- Price update worker (every 5 minutes)
- Dealer scraper worker (every 15 minutes)
- Graceful shutdown handling
- Structured logging

**Development**:

```bash
cd apps/worker
bun dev          # Start worker with hot reload
bun run build    # Build for production
bun start        # Start production worker
bun run lint     # Lint code
```

### Packages

#### `packages/shared` - Shared Code

Contains shared TypeScript code used across all apps:

**Types** (`src/types/index.ts`):

- `Metal` enum (GOLD, SILVER, PLATINUM, PALLADIUM)
- `Product` interface
- `Dealer` interface
- `SpotPrice` interface
- `ApiResponse<T>` interface
- `Pagination` and `PaginatedResponse<T>` interfaces

**Utils** (`src/utils/index.ts`):

- `calculatePremium()` - Calculate premium over spot price
- `calculatePricePerOunce()` - Calculate per-ounce pricing
- `formatPrice()` - Format currency
- `formatPercentage()` - Format percentages
- `getMetalDisplayName()` - Get human-readable metal names
- `delay()` - Promise-based delay
- `isWithinMinutes()` - Date comparison utility

**Development**:

```bash
cd packages/shared
bun run build    # Build package
bun run dev      # Build in watch mode
bun run lint     # Lint code
bun test         # Run tests
```

## 🛠️ Available Scripts

### Root Level

```bash
# Development
bun run dev              # Run all apps in parallel
bun run dev:web          # Run only web app
bun run dev:api          # Run only api app
bun run dev:worker       # Run only worker app

# Building
bun run build            # Build all apps
bun run build:web        # Build web app
bun run build:api        # Build api app
bun run build:worker     # Build worker app

# Code Quality
bun run lint             # Lint all code
bun run format           # Format all code with Prettier
bun run format:check     # Check formatting

# Testing
bun test                 # Run all tests

# Cleanup
bun run clean            # Remove all node_modules and build artifacts
```

## 🔧 Configuration Files

### TypeScript

- **`tsconfig.base.json`** - Base TypeScript configuration extended by all apps
- Path mapping for `@shared/*` to access shared package
- Strict mode enabled for type safety

### ESLint & Prettier

- **`.eslintrc.cjs`** - ESLint configuration with TypeScript support
- **`.prettierrc`** - Prettier formatting rules
- Integrated with Next.js rules for the web app

### Bun

- **`bunfig.toml`** - Bun-specific configuration
- Enables workspaces and configures test runner

## 🐳 Docker Configuration

### Services

1. **postgres** - PostgreSQL 16 database
   - Port: 5432
   - User: `ouncetracker`
   - Database: `ouncetracker`
   - Volume: `postgres_data`

2. **redis** - Redis 7 cache
   - Port: 6379
   - Volume: `redis_data`

3. **api** - Backend API server
   - Port: 4000
   - Depends on: postgres, redis

4. **worker** - Background job worker
   - Depends on: postgres, redis

5. **web** - Frontend application
   - Port: 3000
   - Depends on: api

### Environment Variables

Configure the following in `docker-compose.yml` or create a `.env` file:

**Database**:

- `DATABASE_URL` - PostgreSQL connection string

**Redis**:

- `REDIS_URL` - Redis connection string

**API**:

- `PORT` - API server port (default: 4000)
- `CORS_ORIGIN` - Allowed CORS origin

**Web**:

- `NEXT_PUBLIC_API_URL` - Backend API URL

## 📝 Development Guidelines

### Adding a New Shared Type

1. Add the type to `packages/shared/src/types/index.ts`
2. Export it from `packages/shared/src/index.ts`
3. Rebuild the shared package: `cd packages/shared && bun run build`
4. Import in your app: `import { YourType } from '@shared'`

### Adding a New API Route

1. Create a new route file in `apps/api/src/routes/`
2. Register the route in `apps/api/src/main.ts`
3. Use shared types from `@shared` for type safety

### Adding a New Worker Job

1. Create a new worker in `apps/worker/src/workers/`
2. Register it in `apps/worker/src/index.ts`
3. Schedule it with `scheduler.scheduleJob()`

### Adding shadcn/ui Components

The web app uses shadcn/ui. To add new components:

```bash
cd apps/web
# Components are manually added in src/components/ui/
# Follow the shadcn/ui documentation for component code
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Run tests for a specific package
cd packages/shared && bun test
cd apps/api && bun test
```

## 📚 Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Fastify Documentation](https://fastify.dev/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `bun run lint`
4. Run formatting: `bun run format`
5. Run tests: `bun test`
6. Build all apps: `bun run build`
7. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using Bun, Next.js, TypeScript, and Docker**
