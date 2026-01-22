# Food Schema

Optional schema for food and inventory.

## Includes
- Content types: Product, Ingredient, Inventory, Quantity, Quantitative Unit
- Relationships:
  - Product → Ingredients (`field_ingredients`)
  - Inventory → Product (`field_product`)
  - Inventory → Quantity (`field_quantity`)
  - Quantity → Amount (`field_amount`)
  - Quantity → Unit (`field_unit`)
  - Quantitative Unit → Abbreviation (`field_abbreviation`)
