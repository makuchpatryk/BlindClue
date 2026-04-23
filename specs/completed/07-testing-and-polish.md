---
title: Testing & Polish - Phase 6
phase: 6
---

# Task: Testing & Polish

Write integration tests, fix bugs, and prepare for deployment.

## Checklist

### Backend Integration Tests
- [ ] Set up test runner (vitest or jest) in `packages/backend`
- [ ] `tests/integration/game-lifecycle.test.ts` — full game flow (create → join → start → describe → vote → end)
- [ ] `tests/integration/scoring.test.ts` — impostor caught vs not caught scoring
- [ ] `tests/integration/word-repository.test.ts` — SQLite word/category CRUD
- [ ] Mock external deps (SQLite) with real in-memory Game instances as per plan

### Frontend E2E Tests (optional)
- [ ] Set up Playwright or Cypress
- [ ] Lobby flow: create + join game
- [ ] Game flow: submit description, vote, reveal

### Polish
- [ ] Error states: connection lost, game full, invalid actions
- [ ] Loading states on async actions
- [ ] Responsive design for mobile
- [ ] Input validation feedback

### Deployment
- [ ] `packages/backend` Dockerfile or Node start script
- [ ] `packages/frontend` static build (`vite build`)
- [ ] Environment variable documentation (`.env.example`)
- [ ] Root `npm run build` produces deployable artifacts