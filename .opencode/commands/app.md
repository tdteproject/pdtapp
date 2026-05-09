---
command: /app [name]
description: Add a new app to the active workspace, or switch active app. Uses the same scaffold sub-routine as /workspace for consistency.
phase: any
agents: []
skills: []
---

# /app

Workspace-mode only. Add a new app or switch the active app pointer.

## Preconditions

Read `.state/ACTIVE-PROJECT.md`:
- No active project → "No active workspace. Run `/workspace` first."
- `Type != workspace` → "`/app` is workspace-only. Active project is standalone ('{name}'). Run `/finish` then `/workspace` to migrate."
- Active workspace → proceed.

## Steps

### 1. Read app inventory

`projects/{workspace-name}/WORKSPACE.md` → list of apps + active_app pointer.

### 2. Resolve target

If `[name]` provided:
- App exists → switch (step 4).
- App does not exist → create (step 3) then switch.

If no argument:
- Show app list with phase per app (caveman row per app).
- Ask: "Switch to which app, or enter a new name to create?"
- Wait. Then proceed as above.

### 3. Create new app (shared sub-routine)

Same scaffold as in `/workspace` step 3:

```
projects/{workspace-name}/apps/{name}/
  REQUIREMENTS.md, DESIGN.md, STRUCTURE.md, PLAN.md, STATE.md (all from templates)
  DECISIONS.md, BACKLOG.md (headers)
  sessions/, src/, .context7-cache/, .wip/ (empty)
  .kit-version ("2.0.0")
```

STATE.md frontmatter populated:
```yaml
kit_version: 2.0.0
project: {name}
type: workspace-app
phase: brainstorm
wireframe_status: pending
iteration_count: 0
parallel_concurrency: 3
last_updated: {today}
started: {today}
```

Append a row to `WORKSPACE.md` apps table:
`| {name} | {description} | brainstorm | pending |`

### 4. Switch active app

- `WORKSPACE.md`: set `active_app: {name}`.
- `.state/ACTIVE-PROJECT.md`:

```markdown
# Active Project

- Type: workspace
- Workspace: {workspace-name}
- Path: projects/{workspace-name}
- Active app: {name}
- App path: projects/{workspace-name}/apps/{name}
- App phase: {read from STATE.md}
- Last worked on: {today}
- Next: {next from STATE.md or "/brainstorm" for fresh app}
```

### 5. Append SESSION-LOG.md (caveman)

```
{ISO timestamp} app switch -> {name}. workspace {workspace-name}. phase {phase}.
```

### 6. Confirm (normal English)

```
Active app: {name}
Workspace: {workspace-name}
Phase: {phase}
Next: {next task or command}

Other apps: {list}.
Switch with /app <name>.
```

## Anti-Patterns (Forbidden)

- Create an app outside `apps/` (e.g. directly under workspace root).
- Skip writing `.kit-version` for the new app (Phase 7 migration relies on it).
- Switch active app without updating both `WORKSPACE.md` and `ACTIVE-PROJECT.md`.
- Modify the previously active app's STATE.md as part of the switch (each app's state is independent).

## Next

`/brainstorm` (new app) or whatever the active app's STATE points to.
