#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/db-${STAMP}.sql.gz"
mkdir -p backups

docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod \
  exec -T db pg_dump -U drupal drupal | gzip > "$OUT"

echo "Database dump completed: $OUT"