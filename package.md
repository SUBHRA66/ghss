# How to Create & Build Custom Packages in the GHSS Monorepo

This guide explains how **npm workspaces** work in the GHSS platform and provides a step-by-step walkthrough for creating, building, and linking custom packages inside the `packages/` directory.

---

## 1. Overview: Monorepo Workspaces

In this project, npm is configured to manage multiple packages in a single repository. The root [`package.json`](file:///home/rocket/ghss/package.json) contains:

```json
"workspaces": [
  "services/*",
  "apps/*",
  "packages/*"
]
```

This tells npm that any folder inside `packages/` containing a `package.json` file is an internal workspace package.

When you run `npm install` at the project root, npm automatically creates local **symlinks** inside `node_modules/@ghss/<package-name>` pointing directly to `packages/<package-name>`.

---

## 2. Anatomy of a Package

Every package inside `packages/` follows a standard structure:

```
packages/<package-name>/
├── package.json       # Defines package name (@ghss/name), entrypoints, and dependencies
├── tsconfig.json      # TypeScript compiler configuration (compiles src/ to dist/)
├── src/               # Raw TypeScript source files (.ts)
└── dist/              # Generated JavaScript (.js) and Type Definitions (.d.ts)
```

---

## 3. Step-by-Step Walkthrough: Creating `@ghss/api-client`

### Step 1: Create Directory Structure
```bash
mkdir -p packages/api-client/src
```

### Step 2: Create `package.json`
Create `packages/api-client/package.json`:

```json
{
  "name": "@ghss/api-client",
  "version": "1.0.0",
  "description": "Shared Axios API Client for GHSS apps",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "typescript": "^6.0.0"
  }
}
```

#### Key Fields Explained:
* **`"name": "@ghss/api-client"`**: The package identifier used in `import ... from '@ghss/api-client'`.
* **`"main": "dist/index.js"`**: Entry point for Node.js runtime execution.
* **`"types": "dist/index.d.ts"`**: Entry point for TypeScript IntelliSense and type checking.
* **`"type": "module"`**: Enables ES Module syntax (`import` / `export`).

---

### Step 3: Create `tsconfig.json`
Create `packages/api-client/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

#### Key Options Explained:
* **`"declaration": true`**: **Crucial!** Auto-generates `.d.ts` declaration files inside `dist/` so other apps get full type safety and IDE autocomplete.
* **`"outDir": "dist"`**: Destination for compiled output.
* **`"rootDir": "src"`**: Points TypeScript compiler to raw source files.

---

### Step 4: Write Source Code (`src/index.ts`)
Create `packages/api-client/src/index.ts`:

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Auto-attaches HttpOnly cookies
});

export function helloApiClient(): string {
  return 'Hello from @ghss/api-client!';
}
```

---

### Step 5: Build and Link

1. **Compile TypeScript**:
   ```bash
   npm run build --workspace=@ghss/api-client
   ```

2. **Link across Monorepo**:
   Run from the project root:
   ```bash
   npm install
   ```
   *npm inspects `packages/api-client` and creates the `node_modules/@ghss/api-client` symlink.*

---

### Step 6: Consume the Package

Add the package dependency in your target app or service (e.g. `apps/auth/package.json`):

```json
"dependencies": {
  "@ghss/api-client": "*"
}
```

Import and use it in your app code (`apps/auth/src/App.jsx`):

```javascript
import { apiClient, helloApiClient } from '@ghss/api-client';

console.log(helloApiClient());
```

---

## 4. Existing Reference Packages in GHSS

You can inspect these working examples in the codebase:

1. **[`@ghss/database`](file:///home/rocket/ghss/packages/database)**:
   - [package.json](file:///home/rocket/ghss/packages/database/package.json)
   - [src/index.ts](file:///home/rocket/ghss/packages/database/src/index.ts) — Exports Prisma Client models and database connection service.
2. **[`@ghss/common-auth`](file:///home/rocket/ghss/packages/common-auth)**:
   - [package.json](file:///home/rocket/ghss/packages/common-auth/package.json)
   - [src/index.ts](file:///home/rocket/ghss/packages/common-auth/src/index.ts) — Shared authentication library (`JwtAuthGuard`, `@Public()`, `@CurrentAdmin()`, RS256 strategies).

---

## 5. Golden Rules & Best Practices

1. **Always set `"declaration": true`** in `tsconfig.json` so `.d.ts` files are emitted to `dist/`.
2. **Re-run `npm install` at root** whenever you add a new package folder so npm registers the workspace symlink.
3. **Build shared packages first** (`npm run build --workspace=@ghss/<package>`) before building apps or services that depend on them.
4. **Use `.js` extensions in internal imports**: When importing sibling files inside `src/` under `"moduleResolution": "NodeNext"`, append `.js` (e.g., `import { helper } from './utils.js'`).
