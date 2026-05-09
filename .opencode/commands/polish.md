---
command: /polish
description: Opens a polish iteration between /test (passing) and /deploy. Plans deltas, optionally unlocks files, then routes through /build → /test → deploy-ready.
phase: polish
agents: [architect, wireframer, coder, context-manager]
skills: [architecture-design, write-code]
flags: [--cancel, --size <S|M|L>]
outputs: [polish/iteration-{N}/PLAN.md, polish/iteration-{N}/CHANGES.md, STATE.md updated]
---

# /polish

Iteration-based refinement loop. Designed for the perfectionist user who wants structure around scope changes after the main build is feature-complete.

Honours `Rule 10` (locked-file unlock protocol, size caps, soft guard).

## Preconditions

- `STATE.phase` is `deploy-ready` (latest test passed) **or** already `polish-N` (resuming an iteration).
- `iteration_count` available in STATE.md.

If preconditions fail (e.g. mid-build):
- "Polish runs after `/test` passes. Current phase: {phase}. Finish current phase first, or `/polish` from `deploy-ready`."

## Path resolution

Standalone: `{path} = projects/{name}/`
Workspace app: `{path} = projects/{workspace-name}/apps/{app}/`

## Modes

`/polish`              → start a new iteration (interactive planning).
`/polish --cancel`     → cancel current iteration (must be in `polish-N` phase).
`/polish --size L`     → start a new iteration with declared size override.

## Steps

### 1. Soft guard (entry)

Check `STATE.iteration_count`. If ≥ 5, surface:

```
This is iteration {N+1}. Five polish iterations already done.
Continue only with a concrete reason. Otherwise consider:
- /deploy (ship current state)
- start a new project for v2
- describe what specifically needs polish
```

Wait. If user provides a reason → log to `CHANGES.md` and continue. If user picks deploy / new-project → exit and route accordingly.

### 2. Initialise iteration

- `N = STATE.iteration_count + 1`.
- Create `{path}/polish/iteration-{N}/`.
- Copy `templates/project/POLISH-PLAN.md` → `{path}/polish/iteration-{N}/PLAN.md`.
- Copy `templates/project/POLISH-CHANGES.md` → `{path}/polish/iteration-{N}/CHANGES.md`.
- Update `STATE.md`:
  - `phase: polish-{N}`
  - `iteration_count: {N}` (incremented now, regardless of later cancel — soft guard counts cancelled iterations too)
  - `notes: polish-{N} started`

### 3. Interactive scope capture

Ask the user (one message):

```
Polish iteration {N}. Scope:
1. What is changing? (visual / copy / functional / performance / a11y / mixed)
2. Which pages or modules?
3. Should wireframes be re-done for affected pages? (yes / no / let me decide per-page)
4. Iteration size? (S = ≤3 tasks no unlocks; M = ≤8 tasks ≤2 unlocks; L = no caps but each unlock approved)
5. Brief reason for this iteration (1-3 sentences for the audit trail)
```

If `--size` flag was passed, skip question 4.

### 4. Generate iteration plan

Spawn `architect` (with polish-aware brief):

```
Task() prompt body (caveman):

generate polish iteration plan. iteration {N}. size {size}. user scope below. write to {path}/polish/iteration-{N}/PLAN.md.

scope:
{user answers from step 3}

constraints:
- task id prefix P{N}-
- max tasks per size cap: S=3, M=8, L=unlimited
- include unlocks_required entries where polish needs to modify locked files
- each task must have files_touched + acceptance_criteria
- dependencies field references existing main-build tasks (T-XXX) where relevant

output: caveman summary + YAML envelope per OUTPUT-SCHEMA.
```

`architect` returns. Orchestrator surfaces the plan to user for approval.

### 5. Wireframe re-do (if user said yes in step 3)

For each affected page that needs new wireframe:
- Spawn `wireframer` in `interactive` mode, scoped to that page only.
- Result: WIREFRAMES.md is **unlocked, modified for that page, then re-locked** at iteration end (per Rule 10 unlock protocol).
- The unlock is logged to CHANGES.md and DECISIONS.md.

If user said "let me decide per-page", orchestrator asks per page when each polish task surfaces.

### 6. Approval gate

Show summary to user:
```
Iteration {N} ready.
size: {size}
tasks: {count}
unlocks needed: {list of files} (each will ask for approval before edit)
wireframe re-do: {yes/no/per-page}

Proceed to /build?
```

User confirms → run `/build` (which is polish-aware via `STATE.phase: polish-{N}`).

### 7. Build → Test loop

`/build` reads `polish/iteration-{N}/PLAN.md`. Per task:
- If `unlocks_required` is non-empty:
  - Ask user per unlock (Rule 10 protocol).
  - On approval, set the file frontmatter `Status: UNLOCKED (polish-{N})`.
  - Edit happens.
  - Append to DECISIONS.md.
- Coder runs L1+L2 as usual.

When all polish tasks done → `/test` (scope: regression on touched modules + L4).

When test passes → close iteration (step 8).

### 8. Close iteration

- Re-lock any unlocked files: `Status: LOCKED (re-locked after polish-{N})`. Append timestamp to CHANGES.md.
- Update CHANGES.md `Outcome: shipped`, `Closed: {date}`.
- `STATE.phase: deploy-ready`.
- `context-manager.write.session-summary`:
  ```
  polish-{N} done. {tasks count} tasks. {unlocks count} unlocks. ready deploy.
  ```
- Append SESSION-LOG.md (caveman).

### 9. Cancel mode

If `/polish --cancel` invoked while in `polish-{N}`:
- Confirm: "Cancel iteration {N}? Tasks {done}/{total} will be discarded; locked files will revert."
- On user yes:
  - Restore unlocked files from git HEAD (or `.wip` snapshot if uncommitted).
  - Re-lock them with `Status: LOCKED (re-locked after polish-{N} cancelled)`.
  - CHANGES.md `Outcome: cancelled`, `Closed: {date}`.
  - `STATE.phase: deploy-ready`.
  - Iteration directory **preserved** (audit trail; never deleted).
  - `iteration_count` NOT decremented (cancelled still counts for soft guard).
- On user no: continue iteration as-is.

## Failure modes

- User declines unlock for a critical task → mark task `skipped`, surface impact, ask whether to continue iteration without it or cancel.
- `architect` returns `failed` during planning → preserve `.wip/architect/`, ask user to refine scope and retry.
- Wireframe re-do produces conflicts with existing wireframes → orchestrator surfaces diff, user decides.
- Test (step 7) fails after polish build → spawn `debugger` per defect; if unfixable, allow cancel-iteration.

## Anti-Patterns (Forbidden)
- Skip planning step (`PLAN.md` for the iteration is mandatory).
- Modify locked file without unlock approval.
- Reuse an iteration directory.
- Mark `iteration_count` lower after cancel.
- Bypass the soft guard at iteration ≥ 5 without explicit reason.

## Next

`/build` (immediately after planning), then automatic `/test`, then back to `deploy-ready` → `/deploy` or another `/polish`.
