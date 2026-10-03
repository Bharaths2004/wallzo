# ── Frontend Dockerfile ─────────────────────────────────────────
# Multi-stage:
#   Stage 1 (builder) — installs deps and builds React with Vite
#   Stage 2 (runner)  — serves built files via Nginx (tiny ~20MB image)

# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build-time API URL (passed from docker-compose build args)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ───────────────────────────────────
FROM nginx:alpine AS runner

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing (must handle /products, etc.)
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
