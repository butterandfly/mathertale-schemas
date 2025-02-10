# mathertale-schemas

Schema definitions and utilities for Mathertale canvas files.


## CLI Usage

### Build Database
Recursively finds all `.journey.canvas` files and builds the database:

```bash
mathertale-build db ./
# or
mathertale-build db ./ --output ./data
```

**Warning**: You should not run this command in the root directory of your Mathertale project.


## Important Schemas

- `JourneySchema`
- `QuestSchema`
- `QuestShortSchema`
- `BlockSchema`

More information can be found in [src/schemas.ts](./src/schemas.ts).