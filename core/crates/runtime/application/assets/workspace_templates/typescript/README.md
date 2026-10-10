# Operit TypeScript Project

This is a TypeScript + pnpm project created with Operit.

## Quick Start

### 1. Install dependencies
```bash
Click the "pnpm install" button
```

### 2. Development mode (live compilation)
```bash
Click the "tsc watch" button
# TypeScript watches for file changes and compiles automatically
```

### 3. Build the project
```bash
Click the "pnpm build" button
```

### 4. Run the project
```bash
Click the "pnpm start" button
Then click "Browser Preview" to see the result
```

## Project Structure

```
.
├── src/
│   └── index.ts          # TypeScript source code
├── dist/                 # compiled output directory
├── package.json          # project configuration
├── tsconfig.json         # TypeScript configuration
└── .operit/config.json   # Operit workspace configuration
```

## Tech Stack

- 🔷 **TypeScript** - a type-safe superset of JavaScript
- 📦 **pnpm** - a fast, disk-space-efficient package manager
- 🟢 **Node.js** - the JavaScript runtime

## Why pnpm?

- ⚡ Faster installs
- 💾 Saves disk space (dependencies are shared through hard links)
- 🔒 Strict dependency management
- 🎯 Compatible with npm/yarn commands

## Common Commands

- `pnpm install` - install dependencies
- `pnpm build` - compile TypeScript
- `tsc watch` - compile in watch mode
- `pnpm start` - run the compiled code

## Development Tips

- TypeScript source code lives in the `src/` directory
- Compiled JavaScript goes to the `dist/` directory
- Recompile after changing the code
- Watch mode compiles automatically

Happy Coding with TypeScript! 🎉
