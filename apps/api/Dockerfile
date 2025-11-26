# Build stage
FROM oven/bun:1.1.34-alpine AS builder

WORKDIR /app

# Copy workspace configuration
COPY package.json bun.lock bunfig.toml ./
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

# Copy workspace root files
COPY --from=builder /app/package.json /app/bun.lock /app/bunfig.toml ./

# Copy shared package (built dist + package.json for workspace resolution)
COPY --from=builder --chown=apiuser:nodejs /app/packages/shared ./packages/shared

# Copy entire api app (includes dist, package.json, etc.)
COPY --from=builder --chown=apiuser:nodejs /app/apps/api ./apps/api

# Install production dependencies only
RUN bun install --production --frozen-lockfile

# Change to api directory for running
WORKDIR /app/apps/api

USER apiuser

EXPOSE 4000

ENV PORT=4000
ENV HOST="0.0.0.0"

# Start API server
CMD ["bun", "dist/main.js"]

