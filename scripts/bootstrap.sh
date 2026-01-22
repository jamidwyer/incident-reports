#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.local}"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE (copy .env.example -> .env.local)"
  exit 1
fi

# Start containers
docker compose --env-file "$ENV_FILE" up -d --build

# If Drupal isn't installed yet, install it.
if ! docker compose exec -T php test -f web/sites/default/settings.php; then
  docker compose exec -T php composer install
  docker compose exec -T php vendor/bin/drush site:install standard -y \
    --db-url='pgsql://drupal:drupal@db:5432/drupal' \
    --site-name='Drupal Docker Starter' \
    --account-name=admin --account-pass=admin
fi

# -----------------------------------------------------------------------------
# Optional enabled modules
#
# You can enable optional modules via an env var:
#
#   STARTER_KITS=organization_schema,food_schema
#
# The bootstrap script will enable each listed module after Drupal is installed.
# -----------------------------------------------------------------------------

# Load env vars from the selected env file (export all variables while sourcing).
set -a
source "$ENV_FILE"
set +a

if [ -n "${ENABLED_MODULES:-}" ]; then
  # Split comma-separated module list into an array
  IFS="," read -ra enabled_modules <<< "$ENABLED_MODULES"

  for raw_module_name in "${enabled_modules[@]}"; do
    # Trim whitespace
    module_name="$(echo "$raw_module_name" | xargs)"

    [ -z "$module_name" ] && continue

    # Enable the module if it exists
    if docker compose exec -T php vendor/bin/drush pm:list \
        --type=module --field=name | grep -qx "$module_name"; then
      docker compose exec -T php vendor/bin/drush en "$module_name" -y
    else
      echo "Warning: ENABLED_MODULES module '$module_name' not found (skipping)."
    fi
  done
fi

echo "Ready: http://localhost:${HTTP_PORT:-8080} (admin/admin)"


