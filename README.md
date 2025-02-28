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

## Adding a New Block Type

First you need to create the block file in blocks, which should offer:
- The block type string;
- The block data interface;
- The convert function.

Then add the convert function to `tagBlockMap` in "extract-content.ts".