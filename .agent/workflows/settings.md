---
command: /settings
description: View / edit ATESCHH KIT user configuration (parallel concurrency, integrations, caveman mode, etc).
phase: any
agents: []
skills: []
outputs: [.state/USER-CONFIG.md, .claude/settings.local.json (selectively)]
---

# /settings

Read-mostly orchestrator command. Writes only to `USER-CONFIG.md` (user prefs) or `.claude/settings.local.json` (MCP/permissions) — **never** to project files.

## Steps

### 1. Load

- `.state/USER-CONFIG.md` — create with defaults if missing.
- `.claude/settings.local.json` — peek at MCP allowlist + permissions.

### 2. Menu

```
ateschh-kit settings

1. View all settings
2. Set parallel concurrency (current: {value})
3. Set caveman mode (current: {matrix-default | off | aggressive})
4. Toggle integration (graphify / mempalace / caveman)
5. Set active project (or workspace)
6. View system info (kit version, integrations status, project counts)
7. Reset state (does NOT delete projects/ or archive/)
8. Cancel
```

### 3. Selection handling

- **1**: pretty-print `USER-CONFIG.md`.
- **2**: prompt for integer 1-5; write `parallel_concurrency` to USER-CONFIG. Hint: project-level override lives in `STATE.md`.
- **3**: ask for `matrix-default | off | aggressive`. Write to USER-CONFIG. (Aggressive = caveman applied to user-facing replies too. Confirm twice — most users don't want this.)
- **4**: list integrations + status; toggle the chosen one. Updates `.claude/settings.local.json` MCP entries via `update-config` skill.
- **5**: list `projects/` directories; user picks; write `.state/ACTIVE-PROJECT.md`. For workspaces, also ask which app within.
- **6**: print:
  ```
  Kit version: 2.0.0
  OS: {platform}
  Kit location: {repo path}
  Active project: {name or "none"}
  Projects: {N} active, {M} archived
  Sessions logged: {count from SESSION-LOG.md lines}
  Integrations:
    - graphify: {ok | not installed | unreachable}
    - mempalace: {ok | not installed | unreachable}
    - caveman: {ok | not installed}
    - context7: {ok | not installed}
  ```
- **7**: warning + `RESET` typed confirm; clears `ACTIVE-PROJECT.md` + `ACTIVE-CONTEXT.md`; preserves `SESSION-LOG.md` and all of `projects/`, `archive/`.
- **8**: exit.

## USER-CONFIG.md format

```yaml
---
kit_version: 2.0.0
created: {date}
---

# User Configuration

## Preferences
parallel_concurrency: 3        # 1-5; how many agents per parallel wave
caveman_mode: matrix-default    # matrix-default | off | aggressive
default_deploy_target: vercel   # used as a hint by /requirements
auto_run_doctor_on_resume: yes  # check integrations before lazy-load

## Integrations
graphify_enabled: yes
mempalace_enabled: yes
caveman_enabled: yes
```

## Anti-Patterns (Forbidden)

- Modify project STATE.md from `/settings`.
- Edit MCP secrets directly (use `update-config` skill).
- Skip the `RESET` typed-confirmation for state reset.
- Write to USER-CONFIG.md without preserving existing fields.

## Next

User decides. Most flows return to `/status` or `/next`.
