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

Then add the convert function to `tagBlockMap` in "extract-content.ts". Also you need to export those types in "index.ts".

## Templates

```markdown
# Quest: Quest Name
id: test-id
desc: This is a test quest.

## Section: Introduction

### para: Welcome
id: para-welcome

This is the welcome paragraph.

## Section: Main Content

### Para: Explanation
id: para-explanation

This explains the concept.

### PARA: Conclusion
id: para-conclusion

This is the conclusion.
```

## Publishing to npm

1.  **Build the project:** Make sure your code is compiled to JavaScript (usually in the `dist/` folder). Check your `package.json` for the build script (e.g., `pnpm build`).
2.  **Update version:** Increment the `version` field in `package.json` according to semantic versioning rules.
3.  **Login to npm:** Run `npm login` in your terminal and enter your npm credentials.
4.  **Publish:** Run `npm publish`. If you use two-factor authentication, you might need to append `--otp=YOUR_OTP_CODE`.