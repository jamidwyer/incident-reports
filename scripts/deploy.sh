#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod"

# Pull latest code (if you deploy via git)
git pull --rebase

# Rebuild/restart services
$COMPOSE up -d --build

# Install PHP deps (inside container)
$COMPOSE exec -T php composer install --no-dev --optimize-autoloader

# Apply DB/config changes that track code
$COMPOSE exec -T php vendor/bin/drush cim -y
$COMPOSE exec -T php vendor/bin/drush cr
