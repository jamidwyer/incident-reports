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

# Always point Drush at the Drupal docroot.
DRUSH="vendor/bin/drush --root=/var/www/html/web"

# Ensure settings.php exists and points to the repo config sync directory.
docker compose exec -T php bash -lc '\
  cd /var/www/html && \
  if [ ! -f web/sites/default/settings.php ]; then \
    cp web/sites/default/default.settings.php web/sites/default/settings.php; \
  fi && \
  chmod 664 web/sites/default/settings.php && \
  if ! grep -q "config_sync_directory" web/sites/default/settings.php; then \
    printf "\n\\$settings[\"config_sync_directory\"] = \"/var/www/html/config/sync\";\n" >> web/sites/default/settings.php; \
  fi'

# Install Drupal if DB is empty (key_value table missing)
if ! docker compose exec -T db bash -lc \
  "psql -U drupal -d drupal -tAc \"select 1 from information_schema.tables where table_schema='public' and table_name='key_value';\" | grep -q 1"
then
  if docker compose exec -T php bash -lc \
    "cd /var/www/html && ls -1 config/sync/*.yml >/dev/null 2>&1"
  then
    docker compose exec -T php bash -lc \
      "cd /var/www/html && $DRUSH site:install minimal -y \
        --existing-config \
        --db-url='pgsql://drupal:drupal@db:5432/drupal' \
        --site-name='Incident Reports' \
        --account-name=admin --account-pass=admin"
  else
    docker compose exec -T php bash -lc \
      "cd /var/www/html && $DRUSH site:install standard -y \
        --db-url='pgsql://drupal:drupal@db:5432/drupal' \
        --site-name='Incident Reports' \
        --account-name=admin --account-pass=admin"
  fi
fi

# Ensure themes and config are applied after install (even with existing-config).
# Only run after Drupal tables exist to avoid DB errors on fresh installs.
if docker compose exec -T db bash -lc \
  "psql -U drupal -d drupal -tAc \"select 1 from information_schema.tables where table_schema='public' and table_name='key_value';\" | grep -q 1"
then
  docker compose exec -T php bash -lc \
    "cd /var/www/html && \
     if [ -f config/sync/system.site.yml ]; then \
       SITE_UUID=\$(grep -n '^uuid:' config/sync/system.site.yml | awk '{print \$2}'); \
       [ -n \"\$SITE_UUID\" ] && $DRUSH cset system.site uuid \"\$SITE_UUID\" -y; \
     fi && \
     $DRUSH theme:enable olivero claro -y && \
     $DRUSH cset system.theme default olivero -y && \
     $DRUSH cset system.theme admin claro -y && \
     $DRUSH cim -y && \
     $DRUSH cr"
fi

# Enable optional modules (ENABLED_MODULES=a,b,c)
if [ -n "${ENABLED_MODULES:-}" ]; then
  IFS="," read -ra enabled_modules <<< "$ENABLED_MODULES"

  for raw_module_name in "${enabled_modules[@]}"; do
    module_name="$(echo "$raw_module_name" | xargs)"
    [ -z "$module_name" ] && continue

    # Does the module exist at all? (enabled or disabled)
    if ! docker compose exec -T php bash -lc \
      "cd /var/www/html && $DRUSH pm:list --no-ansi --type=module --status=enabled,disabled --field=name | grep -qx '$module_name'"
    then
      echo "Warning: ENABLED_MODULES module '$module_name' not found (skipping)."
      continue
    fi

    # Is it already enabled?
    if docker compose exec -T php bash -lc \
      "cd /var/www/html && $DRUSH pm:list --no-ansi --type=module --status=enabled --field=name 2>/dev/null | grep -qx '$module_name'"
    then
      echo "Module '$module_name' already enabled (skipping)."
      continue
    fi

    # Enable once
    docker compose exec -T php bash -lc "cd /var/www/html && $DRUSH en '$module_name' -y"
  done

  # Import default config for enabled custom modules (prevents missing content types)
  for raw_module_name in "${enabled_modules[@]}"; do
    module_name="$(echo "$raw_module_name" | xargs)"
    [ -z "$module_name" ] && continue

    module_path="$(docker compose exec -T php bash -lc \
      "cd /var/www/html && $DRUSH ev \"echo \\Drupal::service('extension.list.module')->getPath('$module_name');\"")"

    [ -z "$module_path" ] && continue

    docker compose exec -T php bash -lc \
      "cd /var/www/html && [ -d '/var/www/html/$module_path/config/install' ] && \
       $DRUSH config:import --partial --source='/var/www/html/$module_path/config/install' -y || true"
  done
fi

echo "Ready: http://localhost:${HTTP_PORT:-8080} (admin/admin)"
