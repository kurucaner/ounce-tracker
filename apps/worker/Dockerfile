# Build stage
FROM oven/bun:1.1.34 AS builder

WORKDIR /app

# Install system dependencies for Chromium and Node.js/npm
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace configuration
COPY package.json bun.lock bunfig.toml ./
COPY tsconfig.base.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy worker app
COPY apps/worker ./apps/worker

# Install dependencies for the entire workspace
RUN bun install

# Build shared package
WORKDIR /app/packages/shared
RUN bun run build

# Install Playwright browsers
WORKDIR /app/apps/worker
RUN npx playwright install chromium

# Production stage
FROM oven/bun:1.1.34 AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install system dependencies for Chromium
# Use Playwright's install-deps which knows the right packages for Debian
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace configuration
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/bunfig.toml ./bunfig.toml
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json

# Copy shared package (source + built)
COPY --from=builder /app/packages/shared ./packages/shared

# Copy worker app source files
COPY --from=builder /app/apps/worker ./apps/worker

# Install production dependencies
RUN bun install --production --frozen-lockfile

# Install Playwright system dependencies (Debian/Ubuntu)
# This installs all required libraries including libatk-1.0.so.0
RUN cd /app/apps/worker && npx playwright install-deps chromium

# Copy Playwright browsers from builder stage
RUN mkdir -p /root/.cache/ms-playwright
COPY --from=builder /root/.cache/ms-playwright /root/.cache/ms-playwright

# Start worker
CMD ["bun", "apps/worker/src/index.ts"]
