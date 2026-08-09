---
name: impostor-cover
description: Orchestrated task skill—input task, auto-run plan → implement → review with checkpoints. Never guesses, always asks via tool. Project-local only.
---

# impostor-cover: Full Task Orchestration

Single skill: input task description → auto-run complete pipeline (plan → implement → review → complete).

**Core principle**: Never guess. Always ask user via AskUserQuestion tool at every decision point.

## Usage

```
/impostor-cover [task-description]
```

Example:
```
/impostor-cover "Add JWT refresh token rotation to auth middleware"
/impostor-cover "Refactor game event handler to use domain ports instead of direct DB calls"
```

---

## Workflow

### PHASE 1: PLAN

1. **Parse input**: Extract task from user description
2. **Ask clarifying questions**:
   - "What type of work? (feature/refactor/architecture/other?)"
   - "Why? (context, constraint, deadline?)"
   - "Scope IN: What are we building?"
   - "Scope OUT: What's NOT in scope?"
   - "Success criteria? How do we know it's done?"
   - "Known risks or blockers?"
   - Use AskUserQuestion tool (never assume)

3. **Search existing code**:
   - Spawn Explore agent: "Find patterns/components related to [task domain]"
   - Ask user: "Should we reuse [found component/pattern]?"
   - Ask: "Anything else we should know about existing code?"

4. **Format plan**:
   ```
   # [Task Name]
   ## Goal
   [one sentence from clarifications]
   
   ## Scope
   - In: [what user said]
   - Out: [what user said]
   
   ## Approach
   [steps/phases based on task]
   
   ## Risks
   [from user, from codebase analysis]
   
   ## Success Criteria
   [from user]
   
   ## Related Existing Code
   [from Explore agent results]
   ```

5. **Checkpoint**: Show plan to user
   - Ask: "Any changes needed?"
   - If YES: Loop back (Step 2), refine
   - If NO: Proceed to Phase 2

---

### PHASE 2: IMPLEMENT

1. **Load plan** from Phase 1

2. **Ask checkpoint**:
   - "Ready to start implementing? Any last concerns?"
   - If NO: Offer "abort" or "back to plan"
   - If YES: Proceed

3. **For each major step in plan**:
   - Before coding: Spawn Explore agent
     - "Find existing [component/pattern/code] that does [step]"
   - Ask user: "Use [found code/pattern] or build new?"
     - If reusable: "Should we follow this pattern?"
     - If new: "Sure we're not duplicating?"
   - Execute implementation
   - Show what changed, ask: "OK?"
     - If NO: Loop back, refine
     - If YES: Continue to next step

4. **Architecture check** (embedded):
   - Enforce domain/infra/app layer separation
   - Ask: "Does this fit the [layer] responsibility?"
   - Ask: "Any breaking changes to API/schema?"

5. **When complete**:
   - Show full implementation summary
   - Ask: "Changes needed before review?"
   - If YES: Loop, refine
   - If NO: Proceed to Phase 3

---

### PHASE 3: REVIEW (Subagent)

1. **Spawn async review subagent** with:
   - Plan (from Phase 1)
   - Implementation (from Phase 2)

2. **Subagent checklist**:
   - [ ] Reuses existing code? (or justified why not?)
   - [ ] Respects domain/infra/app layers?
   - [ ] All architecture questions asked + answered?
   - [ ] Any gaps between plan and implementation?
   - [ ] Naming/structure consistent with project?
   - [ ] Any obvious oversights?

3. **Show review findings** to user:
   - "Review found: [issues/passes/notes]"
   - If PASS: "Ready to complete"
   - If ISSUES: Ask "Fix these? (yes/no)"
     - If YES: Loop back to Phase 2 (implement fix)
     - If NO: Offer "Accept as-is?" or "Abort"

---

### PHASE 4: COMPLETE

1. **Save to specs/completed/**:
   ```markdown
   # [Task Name]
   
   ## Plan
   [Full plan from Phase 1]
   
   ## Implementation
   [Summary of changes, files affected, approach]
   
   ## Review
   [Review findings + sign-off]
   
   ## Status
   ✓ Complete [date]
   ```

2. **Report**:
   - "Task complete. Saved to specs/completed/[task-name].md"
   - "Summary: [1-line of what was built]"

---

## Key Rules (NEVER BREAK)

1. **Always ask, never assume**
   - Before any decision: use AskUserQuestion tool
   - If unclear: ask clarifying follow-up
   - Don't guess project constraints, existing code, or user intent

2. **Code discovery via Explore agent**
   - Before writing new code: search for existing patterns
   - Ask user if reusable code exists
   - Only build new if justified

3. **Checkpoints with editing loops**
   - Each phase shows result + asks "Changes needed?"
   - User can edit/refine at any gate
   - No skipping checkpoints

4. **Architecture-enforced**
   - Respect domain/infra/app separation
   - Ask about layer boundaries
   - Reference project package structure

5. **Review gate**
   - Review always runs before completion
   - Issues loop back to implement
   - No shipping without 2nd opinion

---

## Embedded Workflows (Internal)

### plan-phase
- Questions via AskUserQuestion (6-8 questions)
- Explore agent search (patterns, related code)
- Format plan template
- Checkpoint: show + ask "Changes needed?"

### implement-phase
- Ask "Ready to start?"
- For each step: Explore search → ask reuse? → code → ask "OK?"
- Architecture checks embedded
- Checkpoint: show summary + ask "Changes needed?"

### review-phase (subagent)
- Audit plan vs implementation
- Check: reuse, layers, completeness, gaps
- Report findings
- Loop back if issues
- Final sign-off

---

## Success Indicators

✓ Never guessed—asked user at every decision  
✓ Always searched for existing patterns before coding  
✓ Showed results at each checkpoint, allowed edits  
✓ Review caught architecture issues  
✓ Final output saved to specs/completed/  
✓ Plan, implementation, review all documented  

---

## What This Skill Does NOT Do

- Debug existing bugs (use /code-review for that)
- Handle tests/test strategy
- Git operations (commits, PRs, pushes)
- Performance optimization
- Standalone, isolated fixes

---

## Project Context (Enforced)

- References: GAME_PLAN_FINAL.md
- Layers: domain (entities, ports) → app (services, orchestrators) → infra (adapters, persistence)
- Packages: backend (NestJS/TypeScript), frontend (Vue/TypeScript)
- Database: SQLite (local dev), AWS RDS (prod)
- Auth: Cognito (AWS)

Always asks: "Does this fit the [architecture/layer/package]?"
