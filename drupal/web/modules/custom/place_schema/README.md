# place_schema

Optional schema module that adds a `Place` content type with address reference and geographic coordinates, consistent with schema.org's Place.

Fields installed (machine names):

- `field_address` (Entity reference to Postal Address)
- `field_latitude` (Decimal for latitude)
- `field_longitude` (Decimal for longitude)

This module provides configuration in `config/install/` so the content type and fields are available on module install.

Depends on `postal_address_schema` for the address reference.
