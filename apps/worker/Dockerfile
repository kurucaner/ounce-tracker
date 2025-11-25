# Build stage
FROM oven/bun:1.1.34-alpine AS builder

WORKDIR /app

# Install system dependencies for Chromium and Node.js/npm
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

# Install Playwright browsers in builder stage (where all deps are available)
# Try bunx first (Bun's npx), fallback to npx if needed
WORKDIR /app/apps/worker
RUN echo "Installing Playwright browsers..." && \
    (bunx playwright install chromium 2>&1 || npx playwright install chromium 2>&1) && \
    echo "Verifying Playwright installation..." && \
    (ls -la /root/.cache/ms-playwright/ 2>/dev/null && echo "✓ Playwright browsers found in /root/.cache/ms-playwright/" || \
     (echo "Checking alternative locations..." && find /root -name "*playwright*" -type d 2>/dev/null | head -5 || \
      (echo "ERROR: Playwright browsers not found!" && exit 1)))

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

# Install system dependencies for Chromium (must match builder stage)
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

# Copy Playwright browsers from builder stage (installed in builder)
# Playwright browsers are stored in ~/.cache/ms-playwright
# Create directory first in case it doesn't exist, then copy
RUN mkdir -p /root/.cache/ms-playwright
COPY --from=builder /root/.cache/ms-playwright /root/.cache/ms-playwright

# Verify Playwright browsers are available, install if copy failed
RUN if [ ! -d "/root/.cache/ms-playwright/chromium_headless_shell"* ] 2>/dev/null; then \
      echo "Playwright browsers not found, installing now..." && \
      cd /app/apps/worker && \
      (bunx playwright install chromium 2>&1 || npx playwright install chromium 2>&1) && \
      echo "✓ Playwright browsers installed successfully"; \
    else \
      echo "✓ Playwright browsers copied from builder stage"; \
    fi

# Start worker - Bun runs TypeScript directly
CMD ["bun", "apps/worker/src/index.ts"]
