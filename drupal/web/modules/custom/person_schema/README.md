# Person Schema

Provides an optional **Person** content type for the starterpack.

## Installs

- Content type: `person`
- Fields (optional):
  - `field_given_name` (text)
  - `field_family_name` (text)
  - `field_employed_by` (text)
  - `field_hair_color` (text)
  - `field_eye_color` (text)
  - `field_skin_color` (text)
  - `field_outfit` (entity reference to outfit)
  - `field_photos` (image, unlimited)

## Enable

```bash
drush en person_schema -y
```
