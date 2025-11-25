# Build stage
FROM oven/bun:1.1.34-alpine AS builder

WORKDIR /app

# Copy workspace configuration
COPY package.json bun.lockb bunfig.toml ./
COPY tsconfig.base.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy worker app
COPY apps/worker ./apps/worker

# Install dependencies for the entire workspace
RUN bun install

# Build shared package first (still needed as it's a workspace package)
WORKDIR /app/packages/shared
RUN bun run build

# Production stage
FROM oven/bun:1.1.34-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy workspace configuration
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lockb ./bun.lockb
COPY --from=builder /app/bunfig.toml ./bunfig.toml
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json

# Copy shared package (source + built)
COPY --from=builder /app/packages/shared ./packages/shared

# Copy worker app source files
COPY --from=builder /app/apps/worker ./apps/worker

# Install system dependencies for Chromium (must be before Playwright)
# Also install nodejs/npm for npx (required by Playwright install command)
RUN apk add --no-cache \
    ca-certificates \
    freetype \
    freetype-dev \
    harfbuzz \
    nodejs \
    npm \
    nss \
    ttf-freefont \
    ttf-opensans \
    udev

# Install production dependencies
RUN bun install --production --frozen-lockfile

# Install Playwright browsers (as root)
# Only "chromium" is needed; headless binary is included.
# Change to worker directory to ensure playwright can find package.json
WORKDIR /app/apps/worker
RUN npx playwright install chromium
WORKDIR /app

# Start worker - Bun runs TypeScript directly
CMD ["bun", "apps/worker/src/index.ts"]
