# postal_address_schema

Optional schema module that adds a `Postal Address` content type and basic address fields consistent with schema.org's PostalAddress.

Fields installed (machine names):

- `field_address_country` (Country)
- `field_address_locality` (Locality / City)
- `field_address_region` (Region / State)
- `field_postal_code` (Postal code)
- `field_street_address` (Street address)

This module provides configuration in `config/install/` so the content type and fields are available on module install.
