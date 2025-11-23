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

# Install Playwright browsers as root (installs to /root/.cache/ms-playwright)
# Install both chromium and chromium-headless-shell variants
RUN bunx playwright install chromium chromium-headless-shell

# Copy browsers to workeruser's home directory where Playwright expects them
RUN mkdir -p /home/workeruser/.cache/ms-playwright && \
    cp -r /root/.cache/ms-playwright/* /home/workeruser/.cache/ms-playwright/ && \
    chown -R workeruser:nodejs /home/workeruser/.cache

# Set HOME for workeruser (Playwright uses this to find browsers)
ENV HOME=/home/workeruser

# Switch to workeruser
USER workeruser

# Start worker - Bun runs TypeScript directly, no build needed
CMD ["bun", "apps/worker/src/index.ts"]
