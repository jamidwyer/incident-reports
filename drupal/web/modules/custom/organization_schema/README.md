# Organization Schema

Optional schema for an organization directory.

## Includes

- Content types: Organization
- Fields:
  - Name (`field_name`) - required text field
  - Abbreviation (`field_abbreviation`) - optional text field
  - Services (`field_services`) - array of service references
- Relationships
  - Organization → Service (`field_services`)
