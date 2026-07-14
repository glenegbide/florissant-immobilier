#!/bin/sh
set -e

# Database tables are created/updated by the one-shot "migrate" service
# (see docker-compose.yml) before this container starts.
echo "→ Starting Florissant Immobilier…"
exec node server.js
