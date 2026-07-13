# Florissant Immobilier · International

Luxury real-estate website for a Geneva agency. Bilingual (FR / EN), with a private
admin dashboard for managing listings and reading enquiries.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 · PostgreSQL.

---

## Run locally

```bash
npm install
cp .env.example .env        # then fill in the values
npx prisma db push          # create the database tables
npm run dev -- --port 3200  # http://localhost:3200
```

- Public site: `http://localhost:3200/fr` (English at `/en`)
- Admin: `http://localhost:3200/admin` (log in with ADMIN_EMAIL / ADMIN_PASSWORD)

Show or change the admin password:

```bash
npm run password                 # show current
npm run password -- NewPassword  # change it
```

---

## Deploy (recommended: Vercel + a managed Postgres)

1. **Database** — create a managed PostgreSQL (Neon, Supabase or Railway) and copy its
   connection string.
2. **Push code to GitHub**, then import the repo in [vercel.com](https://vercel.com).
3. **Environment variables** (Vercel → Project → Settings → Environment Variables) — set all of
   the keys from `.env.example`:
   - `DATABASE_URL` — the managed Postgres URL
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` (`openssl rand -hex 32`)
   - `NEXT_PUBLIC_SITE_URL` — your final domain, e.g. `https://florissantimmobilier.ch`
4. **Create the tables once** against the production DB:
   ```bash
   DATABASE_URL="<prod-url>" npx prisma db push
   ```
5. **Custom domain** — add it in Vercel → Domains and point your DNS as instructed.

> Uploaded property photos are written to `public/uploads`. On Vercel's ephemeral filesystem this
> is not persistent — for production image uploads, connect an object store (Vercel Blob or
> Cloudflare R2). Text data (listings, messages) lives safely in Postgres.

---

## Social links

Edit `src/lib/site.ts` and paste your Instagram / Facebook / LinkedIn URLs — icons then appear
in the footer automatically.
