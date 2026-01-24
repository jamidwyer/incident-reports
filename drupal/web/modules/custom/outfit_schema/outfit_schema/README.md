# outfit_schema

Drupal schema module defining the Outfit content model.

This module is intended to be the long-term source of truth for the Outfit schema.
All fields and entity configuration should live in module config, not be edited manually in the UI.

## Content Type: Outfit

- **Pants** (optional text field)
- **Shirt** (optional text field)
- **Coat** (optional text field)
- **Uniform** (optional text field)
- **Hat** (optional text field)
- **Face Covering** (optional text field)
- **Footwear** (optional text field)
- **Badges** (optional text field, multiple values)
- **Patches** (optional text field, multiple values)
- **Weapons** (optional text field, multiple values)

Config goes in:
- config/install

After enabling the module, Drupal will install the schema.
