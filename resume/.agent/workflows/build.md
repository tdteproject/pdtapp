---
command: /build
description: Implements one or more PLAN.md tasks. Wireframe-gated. Spawn matrix per Rule 11. Supports parallel dispatch.
phase: build
agents: [coder, debugger, context-manager]
skills: [write-code]
flags: [--all, --batch, --skip-wireframe, --ai-wireframe, --continue-on-fail, --task <id>]
---

# /build

Wireframe-gated implementation of PLAN.md tasks. Honours `Rule 11` (spawn matrix, output contract, parallel dispatch) and `Rule 09` (error recovery, WIP rollback).

## Preconditions

- `STATE.phase` is `build` or `polish-N`.
- `wireframe_status` is one of: `done | skipped | ai-generated`.
  - If `pending` → tell user: "Run `/wireframe`, or pass `--skip-wireframe` / `--ai-wireframe`. Then `/build`."
- Active PLAN file is present and parseable.

## Path resolution

Standalone: `{path} = projects/{name}/`
Workspace app: `{path} = projects/{workspace-name}/apps/{app}/`

Active PLAN file:
- `phase: build` → `{path}/PLAN.md`
- `phase: polish-N` → `{path}/polish/iteration-{N}/PLAN.md`

## Modes

`/build`                     → next single pending task (default)
`/build --task T-014`        → specific task
`/build --all` / `--batch`   → every remaining pending task, parallel dispatch per Rule 11
`/build --continue-on-fail`  → applies only with `--all`; failed tasks marked, others continue

## Steps

### 1. Wireframe gate

Read `STATE.wireframe_status`. If `pending` → exit with guidance. Else continue.

### 2. Pick task(s)

Parse active PLAN file. Filter to `status: pending` tasks.
- Single mode: pick the next task respecting `dependencies`. If named via `--task`, validate its deps are satisfied.
- Batch mode: build DAG from `dependencies`. Identify wave-1 leaves.

If no pending tasks → set `STATE.phase: test`, run `/test`, exit.

### 3. Spawn decision (per task, per Rule 11)

For each picked task:

```
spawn = (task.size in {M, L})
     or (task.size == S and len(task.files_touched) > 1)
     or (task.size == S and lines_likely > 20)
     or (domain expertise needed: design, deploy, debug)
```

If spawn = false → orchestrator does the task inline (read REQUIREMENTS, design tokens, edit files, run L1+L2). No `Task()` call.

### 4. Lazy context collection (only for spawned tasks)

Before each `Task()` call, collect minimal context:
- Read that task's PLAN entry only.
- Read REQUIREMENTS.md (small, always relevant).
- Read DESIGN.md (small, theme decisions).
- Read `design-system/MASTER.md` then overlay `design-system/pages/{page}.md` if it exists.
- Read WIREFRAMES.md page section relevant to this task (if WIREFRAMES.md present).
- `context-manager.recall.code` with task description → Graphify nodes/files (or grep fallback).
- `context-manager.recall.decision` with module name → prior decisions (especially from polish iterations).
- Check `.context7-cache/` for libraries the task touches.

### 5. Parallel dispatch (only in batch mode)

Per Rule 11:
- Default concurrency: `STATE.parallel_concurrency` (default 3).
- Wave assembly: pick up to `concurrency` leaves whose `files_touched` sets are pairwise disjoint.
- Update `STATE.current_wave++`, `STATE.running_agents` with `[{name, task_id}]` entries.
- Spawn the wave in a single message containing N `Task()` tool uses.

### 6. Coder Task() prompt (caveman task body)

Each spawned `coder` receives:

```
implement task. inputs below. follow REQUIREMENTS + DESIGN + WIREFRAMES strictly. run L1 + L2. return per OUTPUT-SCHEMA.

task_id: {T-XXX}
size: {S | M | L}
description: {one line}
acceptance_criteria:
  - {criterion}
dependencies_done: [{T-YYY}, ...]
files_touched: [<paths>]
{path}: {project path}

context refs:
  REQUIREMENTS: {path}/REQUIREMENTS.md
  DESIGN: {path}/DESIGN.md
  MASTER: {path}/design-system/MASTER.md
  PAGE OVERRIDE (if any): {path}/design-system/pages/{page}.md
  WIREFRAMES (this page section): {path}/WIREFRAMES.md#{page}
  graphify hits: {path list from recall.code}
  prior decisions: {summary from recall.decision, ≤3 items}
  context7 cache: .context7-cache/{libs}@{ver}/

constraints:
- one task. no scope expansion.
- no placeholder code. no hardcoded values.
- TS strict, no any.
- error handling on every async.
- comments only for non-obvious logic.
```

### 7. Parse return per spawned task

Extract YAML envelope:
- `status: ok` and `metrics.L1: pass` and `metrics.L2: pass` → mark task `done` in PLAN.md.
- `status: ok` with L2 fail → spawn `debugger` with the defect from `next_blocker`.
- `status: partial` with `next_blocker: "uncertain: ..."` → surface to user, mark `notes` field, do not advance.
- `status: failed` → mark task `failed`, preserve `.wip/{task-id}/`, surface to user.

### 8. Post-task per success

For each successfully completed task:
- Update PLAN.md task: `status: done`, `notes: <coder caveman summary>`.
- `context-manager.write.session-summary`:
  ```
  build T-XXX done. {1-line caveman of change}.
  ```
- `context-manager.write.diary` (agent: coder, project: name, entry: caveman summary).
- `context-manager.graphify.refresh` with `files_changed` list.
- Append SESSION-LOG.md (caveman): `2026-04-29T14:32 build T-XXX done. {summary}`.

### 9. Wave completion (batch mode)

After all spawned coders return:
- Clear `STATE.running_agents`.
- If any failed and `--continue-on-fail` not set → stop. Surface failed task ids and next steps.
- Else identify next wave (leaves with deps now satisfied). Repeat from step 5.
- When DAG empty → set `STATE.phase: test`, run `/test`, exit.

### 10. Single-task wrap-up

If single mode and task done:
- Print caveman summary.
- Suggest `/next` for auto-pilot or another `/build`.

## Failure modes

- Wireframe gate fails → exit with guidance.
- All deps unsatisfied → exit with: "no buildable tasks. waiting on: {list}."
- Coder returns `failed` twice in a row on same task → mark `failed`, do not retry, escalate.
- File conflict mid-wave (an agent touches a file outside `files_touched`) → flag in `decisions`, succeed but log warning.
- Interrupt (Ctrl+C, session crash) → `STATE.interrupted: true`, WIP preserved in `.wip/{task-id}/`. `/resume` handles recovery.

## Notes

- The orchestrator is the only spawner. Coders cannot spawn debugger directly.
- `decisions` from coder/debugger are appended to `DECISIONS.md` in normal English (via `context-manager.write.decision`).
- Caveman summary inside `Task()` prompt and in coder return is per `Rule 12`.

## Next

`/test` (when PLAN done), or another `/build`, or `/next`.
