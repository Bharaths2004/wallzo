# 🐳 Wallzo — Docker Deployment Guide

This guide explains how to run the entire Wallzo stack using Docker. This setup is perfect for deploying to a cloud VPS (like DigitalOcean, AWS EC2, or Hetzner).

---

## 🛠️ Option 1: Local Development (Database Only)

If you just want to run PostgreSQL locally without installing it on your machine, but still run your Node/React code natively:

1. **Start the database:**
   ```bash
   cd wallzo.poster
   docker compose -f docker-compose.dev.yml up -d
   ```
2. **Access Database UI (pgAdmin):**
   - Open: `http://localhost:5050`
   - Email: `admin@wallzo.in`
   - Password: `wallzo123`
3. **Run your code natively:**
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

---

## 🚀 Option 2: Full Production Deployment

This runs the entire stack (Postgres + Backend API + React Frontend + Nginx Proxy) in isolated containers. 

### Step 1: Server Setup (VPS)
1. Buy a VPS (e.g., DigitalOcean Droplet, 2GB RAM minimum recommended).
2. Install Docker and Docker Compose on the server.
3. Clone your repository to the server:
   ```bash
   git clone https://github.com/YOUR_USERNAME/wallzo.poster.git
   cd wallzo.poster
   ```

### Step 2: Configure Environment
Copy the Docker environment template:
```bash
cp .env.docker .env
```
Edit `.env` and change the passwords:
```env
POSTGRES_USER=wallzo_user
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD
POSTGRES_DB=wallzodb

JWT_SECRET=YOUR_LONG_RANDOM_SECRET_KEY
JWT_EXPIRES_IN=7d

CLIENT_URL=https://wallzo.in
VITE_API_URL=/api
```

### Step 3: Build and Start
Run this command in the root folder (where `docker-compose.yml` is):
```bash
docker compose up -d --build
```

### Step 4: Initial Database Setup (Seeding)
Once the containers are running, you need to seed the database for the first time:
```bash
# Run the seed script inside the backend container
docker exec -it wallzo_backend node seed.js
```

### Step 5: Check Status
To view logs and ensure everything is running:
```bash
docker compose ps
docker compose logs -f
```

---

## 🌐 How the Network Works

1. **Nginx Reverse Proxy (Port 80/443)**
   - Acts as the main gatekeeper.
   - Requests to `domain.com/api/*` go to the **Backend**.
   - Requests to `domain.com/uploads/*` serve static images from the backend volume.
   - All other requests `domain.com/*` go to the **Frontend (React)**.
2. **React Frontend**
   - Served by a lightweight Nginx container.
   - Configured for SPA (Single Page Application) routing.
3. **Express Backend**
   - Runs on port 5000 internally.
   - Connects to Postgres via internal Docker network (`postgres:5432`).
4. **PostgreSQL Database**
   - Data is stored in a persistent Docker Volume (`postgres_data`). If you restart the container, data is not lost.

---

## 🔒 Adding SSL (HTTPS) with Let's Encrypt
In production, you'll want HTTPS. The easiest way is to run [Certbot](https://certbot.eff.org/) on your VPS, or put your domain behind **Cloudflare** (which provides free SSL automatically).

If using Cloudflare:
1. Point your domain DNS (A Record) to your VPS IP address.
2. Ensure the Cloudflare proxy (orange cloud) is turned ON.
3. Cloudflare will handle HTTPS, and pass HTTP traffic to your port 80.
