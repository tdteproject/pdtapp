---
command: /resume
description: Lean restore. Loads only STATE + last-session caveman summary. Lazy-loads phase-specific artefacts after user confirms. Target ≤8% context.
phase: any
agents: [context-manager]
skills: [context-management]
outputs: [3-line brief, lazy-loaded artefacts on demand]
---

# /resume

Restore context with minimum tokens. Pairs with `/save`.

## Path resolution

Read `.state/ACTIVE-PROJECT.md`:
- No active project → "No active project. Run `/new-project` or `/resume <project-name>` if a project exists in `projects/`."
- Standalone → `{name}` = project, `{path}` = `projects/{name}/`. Display = `{name}`.
- Workspace → `{name}` = active app, `{path}` = `App Path` from WORKSPACE.md. Display = `{workspace} / {app}`.

## Steps

### 1. Initial load (≤ 5k tokens budget)

Read **only**:
- `.state/ACTIVE-PROJECT.md` (already in step above).
- `{path}/STATE.md` (frontmatter + body — small).
- `{path}/MEMORY.md` (pointer file post-/save; ≤ 200 tokens).

Spawn `context-manager` (operation `recall.session`):

```
recall last session. project {name}.
```

`context-manager` returns the caveman summary from MemPalace project wing. If MemPalace unavailable, falls back to reading `sessions/{last_session_id}.md` (caveman-format thanks to `/save`).

### 2. 3-line brief

Reply normal English:

```
📁 Active project: {display_name} (phase: {phase})
✅ Last completed: {last_task or 'none'}
➡️ Next up: {next_task or 'awaiting decision'}
```

If `STATE.interrupted: true` add a fourth line:
```
⚠️ Last session interrupted. WIP at .wip/{task-id}/. Run /next to inspect, /rollback --wip to discard.
```

If workspace mode and other apps exist, append:
```
Other apps: {list}. Switch with /app <name>.
```

### 3. Wait for user decision

Ask: "Continue?" Do not load anything else.

User responses:
- "continue" / "yes" / "evet" / "devam" → proceed to lazy load (step 4).
- explicit slash command (`/build`, `/test`, etc.) → run that command (the command itself decides what to load).
- "show me X" → lazy load only X.
- "no" / silence → idle, hold context at ≤ 8%.

### 4. Lazy load by phase (only on user "continue")

Per `STATE.phase`:

| Phase | Loaded artefacts |
|---|---|
| `brainstorm` | nothing extra; idea-analyst + market-researcher already produce minimal output |
| `requirements` | (no extra; spawn requirements-expert when /requirements runs) |
| `design` | `STRUCTURE.md` outline if exists |
| `wireframe` | `STRUCTURE.md`, `DESIGN.md` (small) |
| `build` | next pending task block from PLAN.md + matching `design-system/pages/{page}.md` + WIREFRAMES.md page section |
| `test` | last test report under `test-reports/{latest}.md` |
| `deploy-ready` | `qa-reviewer` last output (cached in test report) |
| `polish-N` | `polish/iteration-{N}/PLAN.md` + `CHANGES.md` |
| `deployed` | `STATE.deployments[-1]` block only |

For deeper recall (e.g. "what did we decide about auth?"):
- `context-manager.recall.decision` with the query.

For code structure questions:
- `context-manager.recall.code` with the query (Graphify or grep fallback).

Never dump full files into context. Always go through `context-manager` for semantic recall.

### 5. Run next phase command

If user asked to continue and `STATE.interrupted == false`:
- Suggest the appropriate phase command (`/build`, `/test`, `/deploy`, `/polish`).
- Or run `/next` if user explicitly said "auto-pilot".

## Failure modes

- `STATE.md` missing → tell user, suggest `/new-project` or `/migrate` if `kit_version` is older than current.
- MemPalace and `sessions/` both missing → degraded restore using STATE.md only. Warn: "Limited context. Consider running /map-codebase to rebuild Graphify."
- `STATE.kit_version` is < current kit → trigger `/migrate` flow per Phase 7.

## Anti-Patterns (Forbidden)
- Read `MEMORY.md` content verbatim if it contains old-style verbatim dumps; instead suggest `/migrate`.
- Read full PLAN.md, full DESIGN.md, full STRUCTURE.md eagerly. Always lazy.
- Skip the "Continue?" prompt; users may want to switch projects or apps without loading anything.

## Anti-Pattern Reminder

Resume must stay ≤ 8% of context. If a user request post-resume requires more, surface that as an explicit cost: "Loading WIREFRAMES.md (~2k tokens). Continue?"

## Next

A phase-specific command, or `/next`.
