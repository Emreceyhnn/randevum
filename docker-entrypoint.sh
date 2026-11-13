#!/bin/sh
set -eu

DATABASE_URL="${DATABASE_URL:-file:/data/randevum.db}"
export DATABASE_URL

DB_FILE="$(printf '%s' "$DATABASE_URL" | sed 's/^file://')"
FRESH=0
[ -f "$DB_FILE" ] || FRESH=1

echo "→ applying database migrations ($DATABASE_URL)"
npx --no-install prisma migrate deploy

if [ "$FRESH" = "1" ] && [ "${SEED_DEMO:-true}" = "true" ]; then
  echo "→ seeding demo business (first run)"
  npx --no-install tsx prisma/seed.ts
fi

echo "→ starting Randevum on :${PORT:-3000}"
exec npm run start
