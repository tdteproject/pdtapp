---
command: /finish
description: Closes a project (or workspace). Generates COMPLETION-REPORT, archives the directory, clears ACTIVE-PROJECT.md.
phase: deployed
agents: [context-manager]
skills: [context-management]
flags: [--workspace, --app <name>]
outputs: [archive/{name}/, ACTIVE-PROJECT.md cleared]
---

# /finish

Close the active project. For workspaces, the user picks single-app close vs full-workspace archive.

## Path resolution

Read `.state/ACTIVE-PROJECT.md`:
- Standalone → `{path} = projects/{name}/`. Archive root: `archive/{name}/`.
- Workspace → ask the user (step 1) before deciding.

## Steps

### 1. Workspace decision (workspace-only)

If `Type: workspace`:

```
Active workspace: {workspace-name}
Apps: {list with phase per app}

Finish what?
1. Active app only ({active-app}) → archive that app's directory inside the workspace, keep workspace open.
2. Entire workspace → archive the whole workspace; only allowed if every app is at phase: deployed.
```

Default: option 1. Flag overrides: `/finish --app <name>` (specific app), `/finish --workspace` (whole workspace).

### 2. Pre-archive guard

- Standalone or single-app close: warn if `STATE.phase != deployed`. User confirms anyway or aborts.
- Whole workspace: every app must be `deployed`; otherwise list non-deployed apps and ask user to either close them first or use `--force` (still asks one final confirmation).

### 3. Generate COMPLETION-REPORT.md

Append to the project (or app, or workspace) before archiving:

```markdown
# {name} — Completion Report

**Closed**: {ISO date}
**Started**: {STATE.started}
**Duration**: {N} days
**kit_version**: {STATE.kit_version}
**Live URL**: {STATE.deployments[-1].url} (if any)

## Summary
{2-3 sentences in normal English}

## Tech stack
{table from REQUIREMENTS.md}

## Pages / features
{from STRUCTURE.md}

## Polish iterations
{count, with one-line summary each, from polish/iteration-*/CHANGES.md}

## Key decisions
{from DECISIONS.md, normal English, top ~5}

## Lessons learned
{1-3 bullets in normal English; placeholder for the user to edit before archiving}

## Backlog (carry forward)
{lines from BACKLOG.md if any}
```

For workspace close: also include a per-app sub-section.

### 4. Archive

- `mv projects/{...}/ → archive/{...}/`. Move, don't copy (saves disk).
- Preserve folder structure including `polish/`, `sessions/`, `.context7-cache/`, `.wip/` for audit.
- Workspace close: archive the whole `projects/{workspace-name}/` directory.

### 5. ACTIVE-PROJECT.md update

- Standalone close → `# Active Project\n\n(No active project)\n\nLast completed: {name} on {date}.`
- Single-app close in workspace (other apps remain) → unset `active_app`, ask user to switch via `/app <name>` or close workspace.
- Whole-workspace close → reset same as standalone close.

### 6. Append SESSION-LOG.md (caveman)

```
{ISO timestamp} finish {name}. {duration} days. archive {path}.
```

### 7. context-manager.write.session-summary (caveman, MemPalace)

```
project {name} closed. {duration} days. {N} pages. {N} polish iterations. archive {path}.
```

### 8. Confirm (normal English)

```
Project {name} archived to archive/{name}/.
Live URL: {url}
Backlog carried forward: {count} items in COMPLETION-REPORT.md.

Run /new-project or /workspace to start something new.
```

## Anti-Patterns (Forbidden)

- Delete project files instead of moving them to archive.
- Archive without writing COMPLETION-REPORT.md.
- Archive a workspace whose apps are mid-build without an explicit user override.
- Forget to clear ACTIVE-PROJECT.md (leaves orphan pointer).

## Next

`/new-project`, `/workspace`, or `/resume <archived-name>` if reopening for reference (not supported yet — Phase 7 may add).
