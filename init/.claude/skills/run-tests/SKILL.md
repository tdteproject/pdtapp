---
name: run-tests
description: Runs L1-L4 verification across the full application
---

# Skill: Run Tests

## The Four Levels

### L1 — Syntax (Static)

```bash
npm run build      # or: expo build / go build / etc.
npm run typecheck  # tsc --noEmit
npm run lint       # eslint check
```

Pass = exit code 0 on all three.

### L2 — Functionality (Per Feature)

For each feature in STRUCTURE.md:

```
Feature: {name}
Happy path: {steps} → Expected: {result}
Error path: {bad input} → Expected: {error state shown}
Empty state: {no data} → Expected: {empty state shown}
```

### L3 — Integration (System)

Standard flow:
1. New user: register → verify → first action → result
2. Auth gates: access protected page without auth → redirect to login
3. CRUD: create → appears in list → update → delete → gone
4. Errors: network timeout, server error → user sees friendly message

### L4 — Quality (Pre-Deploy)

```
Web:
- [ ] 375px (mobile) layout OK
- [ ] 768px (tablet) layout OK
- [ ] 1280px (desktop) layout OK

All:
- [ ] No console.log in production files
- [ ] Loading states visible during async ops
- [ ] Error messages are user-friendly
- [ ] No credentials in code
- [ ] .env.example present
```

## Defect Format

```
[L{N}] {Description}
File: {path}:{line}
Reproduce: {steps}
Expected: {result}
Actual: {result}
Severity: Critical / High / Medium / Low
```

## Pass Criteria

All L1 + L2 + L3 = no Critical or High severity issues remaining.
L4 = no Critical issues remaining.
