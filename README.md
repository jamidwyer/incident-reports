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
ENABLED_MODULES=incident_schema,person_schema,place_schema,postal_address_schema
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

### 4. Access the Application

Open your browser and navigate to: http://localhost:8080

**Default Admin Credentials:**

- Username: `admin`
- Password: `admin`

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
- **Outfit**: Description of clothing worn
- **Hair Color**: Color of hair
- **Eye Color**: Color of eyes
- **Skin Color**: Skin tone
- **Photos** (optional): Images of the person

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

## Development

### Additional Modules

The project includes several optional modules that can be enabled via `ENABLED_MODULES` in your `.env.local`:

- `organization_schema`: For organizational entities
- `outfit_schema`: Additional outfit management

### Enabling Modules Manually

You can enable additional modules after setup using Drush:

```bash
docker compose exec php vendor/bin/drush en <module_name> -y
```

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

## License

See `drupal/LICENSE.txt` for licensing information.

- add ingredient content type
- add nutrition content type
- add business content type with address, name, tag, fields
- provide graphql option
