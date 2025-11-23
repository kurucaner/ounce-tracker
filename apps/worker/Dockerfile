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
RUN bun install --frozen-lockfile

# Build shared package first (still needed as it's a workspace package)
WORKDIR /app/packages/shared
RUN bun run build

# Production stage
FROM oven/bun:1.1.34-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 workeruser

# Copy workspace configuration
COPY --from=builder --chown=workeruser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=workeruser:nodejs /app/bun.lockb ./bun.lockb
COPY --from=builder --chown=workeruser:nodejs /app/bunfig.toml ./bunfig.toml
COPY --from=builder --chown=workeruser:nodejs /app/tsconfig.base.json ./tsconfig.base.json

# Copy shared package (source + built)
COPY --from=builder --chown=workeruser:nodejs /app/packages/shared ./packages/shared

# Copy worker app source files (Bun runs TypeScript directly)
COPY --from=builder --chown=workeruser:nodejs /app/apps/worker ./apps/worker

# Install production dependencies
RUN bun install --production --frozen-lockfile

# Install Playwright browsers (needed for scraping)
# Install system dependencies for Chromium
RUN apk add --no-cache \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    || true

# Set HOME for workeruser
ENV HOME=/home/workeruser

# Switch to workeruser and install browsers in their home directory
USER workeruser

# Install Playwright Chromium browser (will install to ~/.cache/ms-playwright)
RUN bunx playwright install chromium

# Start worker - Bun runs TypeScript directly, no build needed
CMD ["bun", "apps/worker/src/index.ts"]

