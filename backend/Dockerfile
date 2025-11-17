# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (production + dev for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# ===================================
# Stage 2: Builder
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code
COPY . .

# Build application
RUN npm run build

# Remove dev dependencies
RUN npm ci --only=production && npm cache clean --force

# ===================================
# Stage 3: Runner (Production)
# ===================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy necessary files from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Create uploads directory
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
