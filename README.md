# Drupal Docker Starter

Docker Compose + Postgres + Nginx + PHP-FPM.

## Create your env file

```bash
cp .env.example .env.local
```

## Bootstrap

```bash
./scripts/bootstrap.sh .env.local
```

Then open: http://localhost:8080

Admin creds (dev default): `admin` / `admin`

## Optional modules

You can enable these content types by adding their name to env.local:

### Organization

- Service
- Name

### Food

- Product
- Ingredient
- Inventory
- Quantity
- Quantitative Unit

### Incident

- Incident time (required)
- Place (required)
- Description (optional)
- Reporter (optional person)
- Persons (array of persons)
- Photos (`field_photos`, array, optional)

### Person

- Given name
- Family name
- Outfit
- Hair color (`field_hair_color`)
- Eye color (`field_eye_color`)
- Skin color (`field_skin_color`)
- Photos (`field_photos`, array)

### Postal Address

- Country (`field_address_country`)
- Locality (`field_address_locality`)
- Region (`field_address_region`)
- Postal Code (`field_postal_code`)
- Street Address (`field_street_address`)

### Place

- Address (reference to Postal Address)
- Latitude (`field_latitude`)
- Longitude (`field_longitude`)

### Outfit

Enable a module like:

```bash
drush en person_schema -y
```

Or set this in your env file:

```
ENABLED_MODULES=organization_schema,food_schema,incident_schema,person_schema,postal_address_schema,place_schema
```

## TODO

- make sure person, incident, address, and location enable and show expected fields
- use the starter to make an incident report project
- login header
- present incident content type as REST
- use the starter to make a service list project
- use the starter to make a food inventory project
- make a react frontend that lists a content type
- search a content type
- move drupal to its own repo
- move react to its own repo
- add videos to incident
- add election content type
- add candidate content type
- add recipe content type
- add ingredient content type
- add nutrition content type
- add business content type with address, name, tag, fields
- provide graphql option
