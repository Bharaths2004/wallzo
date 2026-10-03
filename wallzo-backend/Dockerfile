# ── Backend Dockerfile ─────────────────────────────────────────
# Multi-stage: installs deps, generates Prisma client, runs in production

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Generate Prisma client (must happen after deps + schema copy)
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

# Expose API port
EXPOSE 5000

# Health check — hits the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start server (migrations are run by docker-compose command)
CMD ["node", "src/server.js"]
