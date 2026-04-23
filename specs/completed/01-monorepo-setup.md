---
title: Monorepo Setup
phase: 0
---

# Task: Monorepo Setup

Set up the root monorepo structure before any package work begins.

## Checklist

- [ ] Create `packages/backend/` directory
- [ ] Create `packages/frontend/` directory
- [ ] Create `packages/shared/` directory (for shared DTOs/types)
- [ ] Create root `package.json` with workspaces config
- [ ] Create root `tsconfig.json` with path aliases
- [ ] Create `.gitignore`
- [ ] Verify `npm install` works from root

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
