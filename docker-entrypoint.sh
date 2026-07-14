#!/bin/sh
set -e

# Create/update the database tables (additive & safe to run on every start).
# Call the CLI by its real path: the .bin shim resolves its wasm files
# relative to itself and breaks when COPY dereferences the symlink.
echo "→ Applying database schema…"
node node_modules/prisma/build/index.js db push --skip-generate

echo "→ Starting Florissant Immobilier…"
exec node server.js
