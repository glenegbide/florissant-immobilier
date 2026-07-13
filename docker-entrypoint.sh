#!/bin/sh
set -e

# Create/update the database tables (additive & safe to run on every start).
echo "→ Applying database schema…"
node_modules/.bin/prisma db push --skip-generate

echo "→ Starting Florissant Immobilier…"
exec node server.js
