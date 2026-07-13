# Deploying Florissant Immobilier on a Hostinger VPS

This runs the whole site — app, PostgreSQL database, and automatic HTTPS — with Docker.
You only run a few commands once.

## What you need
- A **Hostinger VPS** (any plan). In hPanel, choose the **Ubuntu 24.04 with Docker** template
  (or install Docker on a plain Ubuntu — see step 1).
- Your **domain** (e.g. `florissantimmobilier.ch`) with its DNS **A record pointing to the VPS IP**
  (set this in your domain's DNS; give it a few minutes to propagate).

## 1. Connect and install Docker (skip if you picked the Docker template)
```bash
ssh root@YOUR_VPS_IP
apt update && apt install -y docker.io docker-compose-plugin git
```

## 2. Get the code onto the VPS
Either push this project to GitHub and clone it, or copy it up. With GitHub:
```bash
git clone https://github.com/YOUR_USERNAME/florissant.git
cd florissant
```

## 3. Create the production settings file
```bash
cp .env.production.example .env
nano .env          # fill in every value, then Ctrl+O, Enter, Ctrl+X
```
Set:
- `DOMAIN` and `NEXT_PUBLIC_SITE_URL` to your domain
- `DB_PASSWORD` — a long random password
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your admin login
- `AUTH_SECRET` — run `openssl rand -hex 32` and paste the result

## 4. Launch
```bash
docker compose up -d --build
```
First build takes a few minutes. When it finishes:
- The database starts and the app creates its tables automatically.
- Caddy fetches a free HTTPS certificate for your domain.

Open **https://your-domain** — the site is live. Admin: **https://your-domain/admin**.

## Everyday commands
```bash
docker compose logs -f web      # watch app logs
docker compose restart web      # restart the app
docker compose down             # stop everything (data is kept)
git pull && docker compose up -d --build   # deploy an update
```

## Notes
- **Data is safe**: listings and messages live in a Docker volume (`db_data`); uploaded photos in
  `uploads`. They survive restarts and rebuilds.
- **Backups**: periodically dump the database —
  `docker compose exec db pg_dump -U florissant florissant > backup.sql`
- **Change admin password later**: edit `ADMIN_PASSWORD` in `.env`, then
  `docker compose up -d` (recreates the app with the new value).
