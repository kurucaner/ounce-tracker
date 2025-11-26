# Build stage
FROM oven/bun:1.1.34-alpine AS builder

WORKDIR /app

# Copy workspace configuration
COPY package.json bun.lock bunfig.toml ./
COPY tsconfig.base.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy web app
COPY apps/web ./apps/web

# Install dependencies for the entire workspace
RUN bun install

# Build shared package first
WORKDIR /app/packages/shared
RUN bun run build

# Build web app
WORKDIR /app/apps/web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN bun run build

# Production stage
FROM oven/bun:1.1.34-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy workspace root files
COPY --from=builder /app/package.json /app/bun.lock /app/bunfig.toml ./

# Copy shared package (built dist + package.json for workspace resolution)
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared ./packages/shared

# Copy entire web app (includes .next, public, package.json, next.config.mjs, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web ./apps/web

# Install production dependencies (including next CLI and workspace deps)
RUN bun install --production --frozen-lockfile

# Change to web app directory for running
WORKDIR /app/apps/web

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js server (standalone mode)
CMD ["bun", "run", "start"]

