---
command: /workspace
description: Creates a new workspace with shared design system and one or more apps. Each app gets a v2.0 STATE schema and .kit-version stamp.
phase: start
agents: []
skills: []
outputs: [projects/{workspace-name}/, ACTIVE-PROJECT.md (Type workspace)]
---

# /workspace

A workspace groups related apps under one project root with a shared design system and decision log.

## Preconditions

Read `.state/ACTIVE-PROJECT.md`:
- Active workspace → "Already in workspace '{workspace}'. Use `/app` to add an app, or `/finish` to close first."
- Active standalone → "Active standalone project '{name}'. Run `/finish` first."
- None → proceed.

## Steps

### 1. Capture inputs (one message)

```
Workspace setup:
1. Workspace name? (kebab-case)
2. What this workspace builds? (one sentence)
3. First app name?
4. What does the first app do?
5. Add a second app now? (name + description, or "no")
   (More can be added later with /app)
```

Wait for all answers.

### 2. Create workspace skeleton

```
projects/{workspace-name}/
  WORKSPACE.md            (from templates/workspace/, filled)
  DESIGN-SYSTEM.md        (from templates/workspace/, filled)
  DECISIONS.md            (header only)
  BACKLOG.md              (header only)
  sessions/               (empty)
  apps/                   (empty)
  .kit-version            ("2.0.0")
```

### 3. Create each app via shared sub-routine `app.create(name, description)`

For each app declared in step 1:

```
projects/{workspace-name}/apps/{app}/
  REQUIREMENTS.md   (template, unfilled, kit_version: 2.0.0)
  DESIGN.md         (template)
  STRUCTURE.md      (template)
  PLAN.md           (template)
  STATE.md          (template, frontmatter populated:
                     kit_version 2.0.0, type: workspace-app, phase: brainstorm,
                     wireframe_status: pending, iteration_count: 0)
  DECISIONS.md      (header)
  BACKLOG.md        (empty)
  sessions/         (empty)
  src/              (empty)
  .context7-cache/  (empty)
  .wip/             (empty)
  .kit-version      ("2.0.0")
```

Append a row to `WORKSPACE.md` Apps table.

### 4. Set first app active

`WORKSPACE.md`:
```yaml
active_app: {first-app-name}
```

### 5. Write ACTIVE-PROJECT.md

```markdown
# Active Project

- Type: workspace
- Workspace: {workspace-name}
- Path: projects/{workspace-name}
- Active app: {first-app-name}
- App path: projects/{workspace-name}/apps/{first-app-name}
- App phase: brainstorm
- Started: {today}
- Next: /brainstorm
```

### 6. Append SESSION-LOG.md (caveman)

```
{ISO timestamp} workspace {workspace-name} created. apps: {comma-sep}. active: {first}.
```

### 7. Confirm (normal English)

```
Workspace {workspace-name} created.
Apps: {list}
Active app: {first-app-name}
Run /brainstorm to start planning the active app.
Switch apps with /app <name>.
```

## Anti-Patterns (Forbidden)

- Mix app names with the workspace name (collision risk).
- Skip writing `.kit-version` stamps (Phase 7 migration relies on them).
- Set `active_app` without writing it to `WORKSPACE.md`.
- Treat the workspace as a single project for `/build` purposes — `/build` always operates on the active app.

## Next

`/brainstorm` for the active app.
