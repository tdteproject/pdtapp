---
project: {project-name}
generated_by: architect
generated_on: {YYYY-MM-DD}
total_tasks: {N}
size_distribution:
  S: 0
  M: 0
  L: 0
---

# Build Plan — {project-name}

Tasks generated from `STRUCTURE.md`. Each task is a unit of work assigned to `coder` (or handled inline by orchestrator per `Rule 11` spawn matrix).

## Task Schema

Every task has these fields. Missing fields fail the validator and break parallel dispatch.

```yaml
- id: T-XXX                       # globally unique, monotonic
  size: S | M | L                 # S ≤30min, M ≤2h, L ≤4h. split if larger.
  description: <one-line summary>
  acceptance_criteria:            # 1-3 bullets, each verifiable
    - <criterion>
  dependencies: [T-YYY, T-ZZZ]    # task ids that must complete first; [] if none
  files_touched:                  # best-effort path list; orchestrator uses for parallel safety
    - <relative path>
  status: pending | in-progress | done | failed | skipped
  notes: <optional, caveman>      # populated as work progresses
```

## Phases

### Setup
```yaml
- id: T-001
  size: S
  description: initialise project with {framework}
  acceptance_criteria:
    - dev server starts without errors
    - tsconfig strict enabled
  dependencies: []
  files_touched:
    - package.json
    - tsconfig.json
  status: pending
  notes: null

- id: T-002
  size: S
  description: install and configure dependencies from REQUIREMENTS.md
  acceptance_criteria:
    - all listed packages installed at locked versions
    - npm run build passes
  dependencies: [T-001]
  files_touched:
    - package.json
    - package-lock.json
  status: pending
  notes: null

- id: T-003
  size: S
  description: configure environment variables
  acceptance_criteria:
    - .env.example committed
    - .env in gitignore
  dependencies: [T-001]
  files_touched:
    - .env.example
    - .gitignore
  status: pending
  notes: null
```

### Pages

(One block per page from STRUCTURE.md. Example for a `dashboard` page:)

```yaml
- id: T-010
  size: M
  description: build dashboard layout shell
  acceptance_criteria:
    - matches WIREFRAMES.md dashboard layout
    - responsive at 375 / 768 / 1280
  dependencies: [T-002]
  files_touched:
    - src/app/dashboard/page.tsx
    - src/app/dashboard/layout.tsx
  status: pending
  notes: null

- id: T-011
  size: M
  description: implement dashboard data fetching
  acceptance_criteria:
    - reads from supabase per STRUCTURE.md
    - loading and error states per WIREFRAMES.md
  dependencies: [T-010]
  files_touched:
    - src/app/dashboard/page.tsx
    - src/lib/queries/dashboard.ts
  status: pending
  notes: null
```

### Integration
```yaml
- id: T-080
  size: M
  description: end-to-end auth flow
  acceptance_criteria:
    - signup → email verify → first action works
    - protected routes redirect to /login when unauthed
  dependencies: [T-002, T-010]
  files_touched:
    - src/middleware.ts
    - src/lib/auth/*
  status: pending
  notes: null

- id: T-090
  size: S
  description: api integration smoke tests
  acceptance_criteria:
    - tester L3 passes
  dependencies: [T-080]
  files_touched: []
  status: pending
  notes: null
```

## Notes for Architect

- Task ids are monotonic across phases. Use `T-001..009` for setup, `T-010..` for pages (10 ids per page block reserved), `T-080..` for integration.
- Sizes: estimate honestly. Underestimating breaks the spawn matrix.
- `files_touched` is best-effort. Coder may touch additional files but must justify in `decisions`.
- `dependencies` form a DAG. The orchestrator computes parallel waves from this.
- Locked once user approves at end of `/design`. Edits during `/build` allowed only via `notes` and `status` fields.
