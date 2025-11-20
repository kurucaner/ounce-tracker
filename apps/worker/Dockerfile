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

# Build shared package first
WORKDIR /app/packages/shared
RUN bun run build

# Build worker app
WORKDIR /app/apps/worker
RUN bun run build

# Production stage
FROM oven/bun:1.1.34-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 workeruser

# Copy built application
COPY --from=builder --chown=workeruser:nodejs /app/apps/worker/dist ./dist
COPY --from=builder --chown=workeruser:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/worker/package.json ./package.json

# Install production dependencies only
RUN bun install --production --frozen-lockfile

USER workeruser

# Start worker
CMD ["bun", "dist/index.js"]

