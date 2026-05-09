---
command: /status
description: Reports current project / workspace progress. Lazy-loads STATE only — no spawn, no full file dumps.
phase: any
agents: []
skills: []
outputs: [Progress report to user]
---

# /status

Read-only orchestrator command. No agent spawn, no caveman writes.

## Path resolution

Read `.state/ACTIVE-PROJECT.md`:
- No active project → "No active project. Run `/new-project`, `/workspace`, or `/resume <name>`."
- Standalone → `{path} = projects/{name}/`. Single-app report.
- Workspace → also read `projects/{workspace-name}/WORKSPACE.md` for app list. Multi-app report.

## Steps

### 1. Load minimal context

- `{path}/STATE.md` (frontmatter + body).
- `{path}/PLAN.md` task summary (count by status).
- `{path}/BACKLOG.md` line count if file exists.
- For workspace: per-app STATE.md frontmatter only (one read per app, frontmatter parses cheap).

### 2. Workspace report (only if Type: workspace)

```
Workspace: {workspace-name}
Active app: {app-name}

| App         | Phase          | Tasks done | Wireframe | Last active |
|-------------|----------------|------------|-----------|-------------|
| {app-1} *   | build          | 6/12       | done      | {date}      |
| {app-2}     | requirements   | 0/0        | pending   | {date}      |

(* = active. Switch with /app <name>.)
```

### 3. Project report

```
Project: {name}
Phase: {phase}
kit_version: {version}
Wireframe: {wireframe_status}
Iteration: {iteration_count}{N if polish-N}
Interrupted: {true / false}

Tasks: {done}/{total} ({percent}%)
  done: {n}    in-progress: {n}    pending: {n}    failed: {n}    skipped: {n}

Next task: {next pending task id + description, or "—"}

Backlog: {n} items

Last verification:
  L1: {pass | fail | n/a}
  L2: {pass | fail | n/a}
  L3: {pass | fail | n/a}
  L4: {pass | fail | n/a}

Last session: {last_session_id or "none"}
Last updated: {last_updated}
```

If `STATE.interrupted == true`, add:
```
⚠️ Last session interrupted. WIP at .wip/. /resume to inspect.
```

If `STATE.kit_version` < current kit version, add:
```
ℹ️ Project on kit {version}. Current: 2.0.0. Run /migrate to upgrade.
```

### 4. Suggested next

Map by phase (echo `/next` routing logic):
- `brainstorm` → "Run /requirements when ready."
- `requirements` → "Run /design."
- `design` → "Run /wireframe (recommended) or /build --skip-wireframe."
- `wireframe` → "Run /build."
- `build` → "Run /build (or /build --all for batch)."
- `test` → "Run /test."
- `deploy-ready` → "Run /deploy or /polish."
- `polish-N` → "Run /build (polish) or /polish --cancel."
- `deployed` → "Run /finish to archive."

## Anti-Patterns (Forbidden)

- Read full PLAN.md or DESIGN.md or STRUCTURE.md.
- Spawn agents.
- Write to STATE.md or any artefact.
- Suggest a command without checking phase.

## Next

User decides. `/next` for auto-pilot.
