#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.local}"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE (copy .env.example -> .env.local)"
  exit 1
fi

docker compose --env-file "$ENV_FILE" up -d --build

# Load env vars
set -a
source "$ENV_FILE"
set +a

# Wait for Postgres to accept connections
docker compose exec -T db bash -lc 'until pg_isready -U drupal -d drupal >/dev/null 2>&1; do sleep 1; done'

# Ensure deps exist (drush lives in vendor/)
docker compose exec -T php bash -lc 'cd /var/www/html && composer install'

# Install Drupal if DB is empty (key_value table missing)
if ! docker compose exec -T db bash -lc \
  "psql -U drupal -d drupal -tAc \"select 1 from information_schema.tables where table_schema='public' and table_name='key_value';\" | grep -q 1"
then
  docker compose exec -T php bash -lc \
    "cd /var/www/html && vendor/bin/drush site:install standard -y \
      --db-url='pgsql://drupal:drupal@db:5432/drupal' \
      --site-name='Incident Reports' \
      --account-name=admin --account-pass=admin"
fi

# Enable optional modules (ENABLED_MODULES=a,b,c)
if [ -n "${ENABLED_MODULES:-}" ]; then
  IFS="," read -ra enabled_modules <<< "$ENABLED_MODULES"

  for raw_module_name in "${enabled_modules[@]}"; do
    module_name="$(echo "$raw_module_name" | xargs)"
    [ -z "$module_name" ] && continue

    # Does the module exist at all? (enabled or disabled)
    if ! docker compose exec -T php bash -lc \
      "cd /var/www/html && vendor/bin/drush pm:list --no-ansi --type=module --status=enabled,disabled --field=name | grep -qx '$module_name'"
    then
      echo "Warning: ENABLED_MODULES module '$module_name' not found (skipping)."
      continue
    fi

    # Is it already enabled?
    if docker compose exec -T php bash -lc \
      "cd /var/www/html && vendor/bin/drush pm:list --no-ansi --type=module --status=enabled --field=name 2>/dev/null | grep -qx '$module_name'"
    then
      echo "Module '$module_name' already enabled (skipping)."
      continue
    fi

    # Enable once
    docker compose exec -T php bash -lc "cd /var/www/html && vendor/bin/drush en '$module_name' -y"
  done

  # Import default config for enabled custom modules (prevents missing content types)
  for raw_module_name in "${enabled_modules[@]}"; do
    module_name="$(echo "$raw_module_name" | xargs)"
    [ -z "$module_name" ] && continue

    module_path="$(docker compose exec -T php bash -lc \
      "cd /var/www/html && vendor/bin/drush ev \"echo \\Drupal::service('extension.list.module')->getPath('$module_name');\"")"

    [ -z "$module_path" ] && continue

    docker compose exec -T php bash -lc \
      "cd /var/www/html && [ -d '/var/www/html/$module_path/config/install' ] && \
       vendor/bin/drush config:import --partial --source='/var/www/html/$module_path/config/install' -y || true"
  done
fi

echo "Ready: http://localhost:${HTTP_PORT:-8080} (admin/admin)"
