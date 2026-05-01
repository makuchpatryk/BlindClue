---
name: impostor-planning
description: Plan features, bugs, refactors, architecture. Use this whenever user says plan X, design X, let's plan, spec this out, how should we implement — any design/planning task. Ask clarifying questions first. Never guess. Provide precise recommendations.
compatibility: AskUserQuestion, Bash, Read, Edit, Write
---

# Planning Skill

**Core**: Ask questions when unclear. Build plan iteratively. Minimal text. Be precise.

## Workflow

### Phase 1: Clarify Intent

Ask user:

- What exactly are we planning? (feature/bug fix/refactor/architecture?)
- Why? (context, constraints, deadline?)
- Scope? (what's in/out?)
- Success criteria?

Use AskUserQuestion to gather these concisely. DON'T guess.

### Phase 2: Plan Building

Ask targeted questions as you discover gaps:

- Who's involved?
- Dependencies?
- Risks/blockers?
- Existing related code/patterns?

Build plan incrementally. Stop asking if user says "enough questions" or answers become clear.

### Phase 3: Output

Save plan to location user specifies.

**Plan structure:**

```
# [Feature/Fix/Refactor Name]

## Goal
[one sentence]

## Scope
- In: ...
- Out: ...

## Approach
[steps/phases]

## Risks
[key blockers]

## Success Criteria
[how you know it's done]
```

Keep it short. No fluff. Every line earns its place.

## Key Rules

- Ask before assuming
- Minimal text (1-2 lines per section)
- Precise language (no vague words)
- Consistent terminology throughout
- If user says "good enough", move to output
- Save to user-specified path only
