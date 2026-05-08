---
name: impostor-commit
description: Auto-commit staged changes with a generated Conventional Commits message. Analyzes git diff, creates a short message, and commits. Use whenever you have staged changes and want to commit them immediately.
---

# Impostor Commit

Automatically commit staged changes with a generated message.

Workflow:

1. Read changes (`git status`)
2. Generate Conventional Commits message based on what changed
3. Run `git commit`

Message format: `type(scope): short description`

**Types:** feat, fix, refactor, test, docs, chore  
**Scope:** frontend, backend, game-logic, auth, etc.  
**Description:** Imperative present tense, ≤50 chars total

Examples:

- `fix(game-logic): restore word on rejoin`
- `feat(frontend): add vitest config`
- `test: add password validation`
- `chore: remove stale lock file`

Just invoke when staged changes exist.
