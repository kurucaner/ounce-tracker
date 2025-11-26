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

# Copy built application and full .next directory (needed for 'next start')
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/next.config.mjs ./next.config.mjs

# Install production dependencies (including next CLI)
RUN bun install --production --frozen-lockfile

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js server (standalone mode)
CMD ["bun", "run", "start"]

