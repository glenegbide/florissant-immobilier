# ─────────────────────────────────────────────────────────────
#  Florissant Immobilier — production image for Hostinger VPS
# ─────────────────────────────────────────────────────────────

# 1. Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: postinstall runs "prisma generate", but the schema is
# only copied in the builder stage (where "npm run build" regenerates it).
RUN npm ci --ignore-scripts

# 2. Build the app
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# A real DATABASE_URL is NOT needed to build (prisma only generates the client).
RUN npm run build

# 3. Minimal runtime
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Standalone server + static assets + public files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Database schema updates run in the "migrate" compose service (builder
# image), so the runtime image stays lean — no Prisma CLI needed here.
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# Persist uploaded property photos here (mounted as a volume in compose)
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

USER nextjs
EXPOSE 3000
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
