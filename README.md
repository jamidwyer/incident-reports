# Incident Reports

A Drupal-based web application for reporting and managing incidents of state violence.

This project provides a structured way to document incidents with details about the location, time, involved persons, and supporting media.

This tool is intended to document state violence and may not be used to oppress the working class.

## Features

- **Incident Reporting**: Create detailed reports of incidents with required fields for time and place, and optional descriptions, reporters, involved persons, and photos.
- **Person Management**: Maintain profiles for individuals involved in incidents, including physical descriptions and associated media.
- **Location Tracking**: Associate incidents with specific places, including postal addresses and geographic coordinates.
- **Modular Architecture**: Built with custom Drupal modules for extensibility.
- **Docker Setup**: Easy local development environment with Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd incident-reports
```

### 2. Configure Environment

Copy the example environment file and customize it:

```bash
cp .env.example .env.local
```

Edit `.env.local` to configure the application. At minimum, set the `HTTP_PORT` (default: 8080). To enable the incident reporting modules, set `ENABLED_MODULES`:

```
HTTP_PORT=8080
ENABLED_MODULES=incident_schema,person_schema,place_schema,postal_address_schema,incident_translate
```

### 3. Bootstrap the Application

Run the bootstrap script to set up the Docker environment and install Drupal:

```bash
./scripts/bootstrap.sh .env.local
```

This script will:

- Start the Docker containers (PostgreSQL, Nginx, PHP-FPM)
- Install Drupal with the standard profile
- Enable the specified modules
- Use config from `drupal/config/sync` when present (existing-config install)

### Config Sync (Required for Code-First Installs)

For new environments to get content types and settings automatically, export config to the repo:

```bash
docker compose exec php vendor/bin/drush cex -y
```

This writes to `drupal/config/sync` (configured by `scripts/bootstrap.sh`). Commit that directory so fresh installs can use `--existing-config`.

### 4. Access the Application

Open your browser and navigate to: http://localhost:8080

**Default Admin Credentials:**

- Username: `admin`
- Password: `admin`

## Development

```
docker compose up -d --build
docker compose exec php composer install
docker compose exec php vendor/bin/drush cex -y
```

### Enabling Modules Manually

You can enable additional modules after setup using Drush:

```bash
docker compose exec php vendor/bin/drush en <module_name> -y
```

### Updating After Module Changes

When making changes to custom modules (e.g., adding new fields, altering forms, or updating configurations), follow these steps to apply the changes:

1. **Rebuild and Restart Containers** (if code changes were made):

   ```bash
   docker compose down
   docker compose up --build -d
   ```

2. **Install Drush** (if not already installed):

   ```bash
   docker compose exec php composer require drush/drush
   ```

3. **Reinstall the Module** to apply new configurations:

   ```bash
   docker compose exec php vendor/bin/drush pm-uninstall <module_name> -y
   docker compose exec php vendor/bin/drush pm-install <module_name> -y
   ```

4. **Clear Cache**:
   ```bash
   docker compose exec php vendor/bin/drush cr
   ```

**Note:** If the module has dependencies or shared configurations, you may need to handle conflicts by deleting existing configs or using the admin UI for module management.

### Database

The application uses PostgreSQL as the database backend. Database configuration is handled automatically during bootstrap.

### Customization

You can extend functionality by modifying the modules in `drupal/web/modules/custom/` or adding new ones.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## Deploy

```
./scripts/bootstrap.sh .env.prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## Content Types

### Incident

Incidents can be reported with the following fields:

- **Incident Time** (required): Date and time when the incident occurred
- **Place** (required): Location where the incident took place
- **Description** (optional): Detailed description of the incident
- **Reporter** (optional): Person who reported the incident
- **Persons** (optional): Array of persons involved in the incident
- **Photos** (optional): Supporting images related to the incident

### Person

Persons involved in incidents can have the following attributes:

- **Given Name**: First name
- **Family Name**: Last name
- **Employed By**: Reference to an Organization
- **Outfit**: Description of clothing worn
- **Hair Color**: Color of hair
- **Eye Color**: Color of eyes
- **Skin Color**: Skin tone
- **Photos** (optional): Images of the person

### Organization

Organizations that employ persons:

- **Name**: Name of the organization
- **Abbreviation** (optional): Short form of the name
- **Patches** (optional): Images of organization patches
- **Badges** (optional): Images of organization badges
- **Uniforms** (optional): Images of organization uniforms

### Place

Locations associated with incidents:

- **Address**: Reference to a postal address
- **Latitude**: Geographic latitude coordinate
- **Longitude**: Geographic longitude coordinate

### Postal Address

Structured address information:

- **Country**
- **Locality** (city)
- **Region** (state/province)
- **Postal Code**
- **Street Address**

## Multilingual Support

The application supports multiple languages for better accessibility. The following languages are configured:

- English (en) - Default
- Spanish (es)
- Chinese Simplified (zh-hans)
- Filipino (fil)
- Vietnamese (vi)
- French (fr)
- Korean (ko)
- German (de)
- Arabic (ar)
- Russian (ru)

### Language Features

- **URL Path Prefixes**: Access content in different languages using URL prefixes (e.g., `/es/node/1` for Spanish)
- **Content Translation**: All content types support translation to multiple languages
- **Google Translate Integration**: Admin interface includes Google Translate buttons for quick translation of incident fields

### Google Translate for Incidents

The `incident_translate` module provides Google Translate functionality in the admin interface:

1. **Setup**: Configure a Google Translate API key at `/admin/config/incident-translate`
2. **Usage**: When editing incidents, use the translate buttons below title and description fields
3. **Features**:
   - Translate to all languages at once
   - Translate to individual languages
   - AJAX-powered interface for seamless translation

**Note**: Requires a Google Translate API key (paid service). See the module's README for setup instructions.

## License

See `drupal/LICENSE.txt` for licensing information.

- add ingredient content type
- add nutrition content type
- add business content type with address, name, tag, fields
- provide graphql option

## TODO

- merge
- react fe that show incidents list and individual incident details
- translate all to spanish
- somalian
- hmong (vietnamese?)
- haitian?
- add vehicle content type
- add videos to incident
- outfit needs to be better
- add sources to incident
- make it so folks can add all needed fields on the incident page
- figure out crowdsourcing...
- add view of Incidents to each content view, eg ICE has all its incidents in a list
- add incident type enum (murder, homicide, assault, kidnapping, arrest, neglect, medical malpractice), default sort by this
- add victims as Person when you're _sure_ the website won't mix perps and victims
- add optional Operator field to Place. can be Person or Organization?
- add chain of command for both person and organization
- remove powered by drupal not tryna get buytaert on a watchlist
- add Investigation field
- exportable as CSV
- add salary to Person
- google translate key to .env
- Theme
- login bar
- make all possible fields optional
- security
- decentralization
- disappeared data
- json_schema_validation,api_documentation
- drupal not in php container
- jQuery in admin to plain JS
