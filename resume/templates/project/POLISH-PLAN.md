---
project: {project-name}
iteration: {N}
size: S | M | L
generated_on: {YYYY-MM-DD}
total_tasks: {N}
parent_phase: deploy-ready
---

# Polish Plan — Iteration {N}

Delta tasks for this polish iteration. Same task schema as main `PLAN.md`. Only the changes from the previous deploy-ready state.

## Iteration Scope

`size`: `S` (≤ 3 tasks, no locked-file unlocks) | `M` (≤ 8 tasks, ≤ 2 unlocks) | `L` (no task cap, each unlock approved).

## Tasks

```yaml
- id: P{N}-T-001
  size: S | M | L
  description: <one-line summary of the polish change>
  acceptance_criteria:
    - <criterion>
  dependencies: []
  files_touched:
    - <relative path>
  unlocks_required:                   # optional; locked files this task needs to modify
    - file: WIREFRAMES.md
      reason: <caveman: why unlock>
  status: pending | in-progress | done | failed | skipped
  notes: null
```

`id` prefix uses `P{N}-` to distinguish polish tasks from main-build tasks. Example: `P1-T-001` is the first task of polish iteration 1.

## Notes

- Polish tasks may reference main-build task ids (`T-014`) in `notes` to link a refinement to its origin.
- `unlocks_required` triggers the unlock protocol per `Rule 10`. Orchestrator asks user before any unlock proceeds.
- Task `done` updates this file via `coder` return; rationale is appended to `CHANGES.md`.
