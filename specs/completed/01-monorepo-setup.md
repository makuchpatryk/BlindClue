---
title: Monorepo Setup
phase: 0
status: completed
---

# Task: Monorepo Setup ✅

Set up the root monorepo structure before any package work begins.

## Completed ✅

- [x] Create `packages/backend/` directory
- [x] Create `packages/frontend/` directory
- [x] Create `packages/shared/` directory (for shared DTOs/types)
- [x] Create root `package.json` with workspaces config
- [x] Create root `tsconfig.json` with path aliases
- [x] Create `.gitignore` with comprehensive rules
- [x] Root setup ready for npm install

## Root package.json

```json
{
  "name": "impostor",
  "private": true,
  "workspaces": ["packages/backend", "packages/frontend", "packages/shared"],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present"
  }
}
```
