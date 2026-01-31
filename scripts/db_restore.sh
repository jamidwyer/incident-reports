#!/usr/bin/env bash
set -euo pipefail

FILE="${1:?usage: scripts/db_restore.sh path/to/dump.sql.gz}"

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod"

echo "ABOUT TO OVERWRITE DATABASE with: $FILE"
echo "Ctrl+C to abort."
sleep 3

# Put site in maintenance mode (optional but nice)
$COMPOSE exec -T php vendor/bin/drush sset system.maintenance_mode 1 || true
$COMPOSE exec -T php vendor/bin/drush cr || true

# Restore
gunzip -c "$FILE" | $COMPOSE exec -T db psql -U drupal drupal

# Re-import config to match code (often needed after pulling prod DB down)
$COMPOSE exec -T php vendor/bin/drush cim -y || true
$COMPOSE exec -T php vendor/bin/drush cr || true
$COMPOSE exec -T php vendor/bin/drush sset system.maintenance_mode 0 || true
$COMPOSE exec -T php vendor/bin/drush cr || true

echo "Restore complete."
