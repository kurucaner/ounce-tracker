# Build stage
FROM oven/bun:1.1.34-alpine AS builder

WORKDIR /app

# Copy workspace configuration
COPY package.json bun.lockb bunfig.toml ./
COPY tsconfig.base.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy api app
COPY apps/api ./apps/api

# Install dependencies for the entire workspace
RUN bun install

# Build shared package first
WORKDIR /app/packages/shared
RUN bun run build

# Build api app
WORKDIR /app/apps/api
RUN bun run build

# Production stage
FROM oven/bun:1.1.34-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy built application
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/package.json ./package.json

# Install production dependencies only
RUN bun install --production --frozen-lockfile

USER apiuser

EXPOSE 4000

ENV PORT=4000
ENV HOST="0.0.0.0"

# Start API server
CMD ["bun", "dist/main.js"]

