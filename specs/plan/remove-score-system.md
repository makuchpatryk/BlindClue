# Remove Score System

## Goal
Remove score tracking and display from entire game (frontend + backend). Product feature removal.

## Scope
- In: All score-related code, storage, APIs, frontend components
- Out: Game logic/rules, voting/impostor mechanics, other features

## Approach

### Phase 1: Audit (15 min)
Find all score references:
- Backend: models, game logic, endpoints
- Frontend: components, stores, templates
- Tests touching score

### Phase 2: Backend Removal (30 min)
- Remove score field from game model/schema
- Remove score calculation/update in game logic
- Remove score-related API endpoints or response fields
- Update/delete backend tests

### Phase 3: Frontend Removal (20 min)
- Remove score display components (UI, vote phase, results)
- Remove score state from store
- Update templates/views that reference score
- Update/delete frontend tests

### Phase 4: Test & Verify (15 min)
- Game flow works without score
- No console errors or missing fields
- End-to-end game test (no scoring visible)

## Risks
- Score baked into game logic → need to verify game still works
- Score in API responses → clients may break if not handled

## Success Criteria
- No score fields in DB/API
- No score UI visible
- All tests pass
- Full game round works without errors
