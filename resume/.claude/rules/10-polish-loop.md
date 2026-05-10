# Polish Loop

The polish loop is an opt-in iteration phase between `/test` (passing) and `/deploy`. Use it when scope changes, visual refinements, or copy adjustments are needed before launch.

Triggered by `/polish` from `STATE.phase: deploy-ready`. Sets `STATE.phase: polish-N` (N = `iteration_count + 1`).

## 1. When to use

- Visual refinement (typography, spacing, hierarchy).
- Copy / UX writing changes.
- Scope adjustment (add a feature missed in initial pass; remove an over-built one).
- Performance optimisation post-tester.
- Pre-launch quality pass beyond `qa-reviewer` defaults.

Not for:
- Bug fixes — these belong in `/test` → `debugger` flow.
- Total scope rewrite — start a new project.
- Routine `/build` work — that's the main pipeline.

## 2. Iteration structure

Each polish iteration is a self-contained sub-cycle:

```
{path}/polish/iteration-{N}/
  PLAN.md            # delta tasks, same schema as main PLAN.md
  CHANGES.md         # rationale: what changes, why, links to DECISIONS.md
  .wip/{task-id}/    # WIP per Rule 09
```

Iterations are append-only — never overwrite a previous iteration directory.

## 3. Locked file unlock protocol

`REQUIREMENTS.md`, `DESIGN.md`, `WIREFRAMES.md`, `STRUCTURE.md` are normally locked. During a polish iteration they may be **temporarily unlocked**, one at a time, with explicit user approval.

Protocol:

1. Polish task identifies the file that needs change.
2. Orchestrator asks: "Polish requires unlocking {file}. Approve?"
3. User approves → `Status: UNLOCKED (polish-N)` written into the file's frontmatter.
4. Edit happens.
5. Change logged to `DECISIONS.md` via `context-manager.write.decision` (normal English) with rationale + iteration reference.
6. File is **re-locked** at iteration end with `Status: LOCKED (re-locked after polish-N)`.

A single iteration may unlock multiple files, but each requires separate approval.

`DECISIONS.md` is never unlocked — it is append-only.

## 4. Iteration size cap

Each polish iteration declares a size at start: `S | M | L`.
- `S`: ≤ 3 tasks, no locked-file unlocks.
- `M`: ≤ 8 tasks, ≤ 2 unlocks.
- `L`: > 8 tasks, no unlock cap (but each still requires approval).

Cap exists to prevent perfectionist drift. If a polish iteration exceeds its declared size, orchestrator pauses and asks the user to either escalate the size or split into a new iteration.

## 5. Soft guard against over-iteration

After `iteration_count` ≥ 5, orchestrator surfaces:

```
Polish iteration {N+1} requested. Current count: 5.
Consider:
- shipping current state (run /deploy)
- splitting remaining work into a v2 / new project
- continuing if there's a concrete reason (specify)
```

User must respond with a reason to continue. The reason is logged to `DECISIONS.md`.

## 6. Phase transitions

```
deploy-ready  --/polish-->  polish-N  --build/test loop-->  deploy-ready  -->  /deploy or /polish-N+1
```

`STATE.phase: polish-N` activates polish-aware behaviour in `/build`, `/test`, `/next`:
- `/build` reads `polish/iteration-{N}/PLAN.md` instead of root `PLAN.md`.
- `/test` runs against polish iteration scope (default `--scope all`; can be `last-task` for fast feedback).
- `/next` routes within the iteration until tasks done, then back to `deploy-ready`.

## 7. Cancelling a polish iteration

User can `/polish --cancel` mid-iteration:
- Iteration directory preserved (audit trail).
- Locked files re-locked at their pre-polish content (orchestrator restores from git or `.wip` snapshot).
- `STATE.phase` returns to `deploy-ready`.
- `iteration_count` is NOT decremented (cancelled iterations still count for the soft guard).

## 8. Anti-Patterns (Forbidden)

- Polish iteration that touches code without an iteration `PLAN.md`.
- Modifying a locked file without the unlock protocol.
- Reusing an old iteration directory for new work.
- Skipping `CHANGES.md` (rationale must be captured).
- Hiding scope creep by inflating iteration size mid-flight.
- More than 5 iterations without explicit user reason.

## 9. Validation

`scripts/validate.ps1` (extended in Phase 6) checks:
- Every iteration directory has both `PLAN.md` and `CHANGES.md`.
- Locked files in frontmatter say `LOCKED` outside polish phases.
- `STATE.iteration_count` matches highest iteration directory number.
