---
command: /new-project
description: Creates a new standalone project. Initialises folder structure, STATE.md with kit_version 2.0.0, and ACTIVE-PROJECT.md.
phase: start
agents: []
skills: []
outputs: [projects/{name}/ created, ACTIVE-PROJECT.md updated]
---

# /new-project

## Steps

### 1. Active-project guard

Read `.state/ACTIVE-PROJECT.md`:
- Active workspace → "You are in workspace '{workspace}'. Use `/app` to add a new app, or `/finish` to close the workspace first."
- Active standalone project → "You are working on '{project}'. Finish with `/finish` or archive first. Continue anyway?"
- None → proceed.

### 2. Ask user

Single message:
```
1. Project name? (no spaces, kebab-case)
2. One sentence: what does it do?
```

### 3. Scaffold

Copy from `templates/project/`:
- `REQUIREMENTS.md`, `DESIGN.md`, `STRUCTURE.md`, `STATE.md`, `PLAN.md`, `DECISIONS.md` → `projects/{name}/`
- Create empty: `projects/{name}/BACKLOG.md`, `projects/{name}/sessions/`, `projects/{name}/src/`
- Create empty: `projects/{name}/.context7-cache/` (populated by `/requirements`)
- Create empty: `projects/{name}/.wip/` (used by `/build` and `/polish` per Rule 09)

### 4. Populate STATE.md frontmatter

Set in `projects/{name}/STATE.md`:
```yaml
kit_version: 2.0.0
project: {name}
type: standalone
phase: brainstorm
wireframe_status: pending
iteration_count: 0
last_session_id: null
interrupted: false
current_wave: 0
running_agents: []
parallel_concurrency: 3
last_updated: {today}
started: {today}
```

Also write `projects/{name}/.kit-version` containing `2.0.0` (used by `/migrate` detection).

### 5. Write ACTIVE-PROJECT.md

```markdown
# Active Project

- Project: {name}
- Type: standalone
- Path: projects/{name}
- Phase: brainstorm
- Started: {today}
- Next: /brainstorm
```

### 6. Append SESSION-LOG.md (caveman)

```
{ISO timestamp} new-project {name}. standalone. phase brainstorm.
```

### 7. Confirm (normal English)

```
Project {name} created.
Path: projects/{name}
Phase: brainstorm

Run /brainstorm to describe your idea.
```

## Failure modes

- Project name collision → suggest a suffix.
- Templates missing → fail loudly. Suggest `npx ateschh-kit@latest --update`.

## Next

`/brainstorm`
