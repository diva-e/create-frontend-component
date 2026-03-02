# AGENTS.md

## Project Overview

`create-frontend-component` is a framework-agnostic CLI tool to scaffold frontend components using custom templates. It supports Vue, React, Angular, and other frameworks through customizable presets.

## Commands

| Command | Description |
|---------|-------------|
| `npx create-frontend-component init` | Initialize project with preset and config |
| `npx create-frontend-component init:<preset>` | Initialize with specific preset (e.g., `init:vue3`) |
| `npx create-frontend-component prompt` | Interactive component creation |
| `npx create-frontend-component <name> --type <type> --flavour <flavour>` | Direct component creation |
| `npx create-frontend-component upgrade` | Add missing files from a different flavour |

## Quality checks

- Make sure to run `npm test` and `npm run lint:fix` after changes have been finished
- Keep the project lightweight and avoid adding more dependencies
- Make sure to update `src/serve-mocks.spec.js` with tests for new features, it is basically a kind of e2e test which covers most of logic

## Scripts

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
npm run release       # Create release with standard-version
npm run release:patch # Release patch version
npm run release:minor # Release minor version
npm run release:major # Release major version
```

## Configuration

Edit `.create-frontend-component/config.json`:

```json
{
    "types": ["atoms", "molecules", "organisms"],
    "templatePath": ".create-frontend-component/templates",
    "componentPath": "src/components",
    "nameStyle": "pascalCase"
}
```

- **types**: Component categories (set to `null` to disable)
- **templatePath**: Template directory location
- **componentPath**: Generated component output directory
- **nameStyle**: `kebabCase` or `pascalCase`

## Project Structure

```
src/
├── commands.js         # Command handlers (init, prompt, create, upgrade)
├── gulpfile.js         # File generation using Gulp
├── prompt-utilities.js # Interactive prompts
└── utilities.js        # Helper functions
presets/                # Built-in templates (vue2, vue3, react, etc.)
playground/             # Test environment
```

## Technology

- ES Modules (Node.js 18+)
- Gulp for file operations
- Commander for CLI
- Prompts for interactive input

## Development Notes

- No tests currently implemented (`npm test` is a placeholder)
- Uses Husky for pre-commit hooks
- Follows conventional commits (commitlint)
- ESLint configuration in `.eslintrc.json`
