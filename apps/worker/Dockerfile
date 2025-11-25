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
FROM oven/bun:1.1.34-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install system dependencies for Chromium
# Install packages that we know exist in Alpine
# For libatk-1.0.so.0, we'll check what provides it or install manually
RUN apk add --no-cache \
    ca-certificates \
    freetype \
    freetype-dev \
    harfbuzz \
    nss \
    ttf-freefont \
    ttf-opensans \
    udev \
    glib \
    libx11 \
    libxcomposite \
    libxdamage \
    libxext \
    libxfixes \
    libxrandr \
    libxtst \
    dbus \
    libdrm \
    libxkbcommon \
    alsa-lib \
    mesa \
    cairo \
    pango \
    atk-dev

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

# Copy Playwright browsers from builder stage
RUN mkdir -p /root/.cache/ms-playwright
COPY --from=builder /root/.cache/ms-playwright /root/.cache/ms-playwright

# Start worker
CMD ["bun", "apps/worker/src/index.ts"]
