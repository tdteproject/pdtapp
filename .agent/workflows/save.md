---
command: /save
description: Compresses the current session to a caveman summary. Writes to MemPalace + STATE.md. No verbatim dumps. Cross-platform safe.
phase: any
agents: [context-manager]
skills: [context-management]
outputs: [STATE.md updated, MemPalace wing updated, MEMORY.md pointer refreshed, session-NNN.md compact entry, SESSION-LOG.md appended]
---

# /save

Lean session save. Optimised for `/resume` round-trip cost. No verbatim transcript dumps; everything is caveman-compressed.

Pairs with `/resume`. Together they target ≤ 8% context restore on the next session.

## Path resolution

Read `.state/ACTIVE-PROJECT.md`:
- Standalone → `{name}` = project, `{path}` = `projects/{name}/`. Display = `{name}`.
- Workspace → `{name}` = active app, `{path}` = `App Path` from WORKSPACE.md. Display = `{workspace} / {app}`.

## Steps

### 1. Compose caveman summary

Distil the session into ≤ 500 tokens of caveman text:
- What was done (decisions made, tasks completed, files touched).
- Current phase + next task.
- Open blockers (if any).
- Touched agents (the orchestrator tracks this naturally during the session).

Style per `Rule 12`. Example:

```
phase build. T-014 login form done. T-015 signup next. used react-hook-form. zod schema in schemas/auth.ts. supabase client wired via env. files: LoginForm.tsx, useAuth.ts. L1+L2 pass. no blockers. wireframes locked. context7 cache fresh.
```

### 2. Write to MemPalace via context-manager

Spawn `context-manager` (operation `write.session-summary`):

```
write session summary. project {name}. caveman text below. touched agents: [coder, debugger].

text:
{caveman summary from step 1}
```

`context-manager` writes to:
- Project wing entry `proj-{name}/sessions/{id}` (caveman).
- Each touched agent's diary entry (caveman).

If MemPalace unreachable → `context-manager` falls back to writing the same text to `{path}/sessions/session-{NNN}.md` (caveman, not verbatim). It returns `fallback_used: mempalace`.

### 3. Update STATE.md (always, regardless of MemPalace status)

```yaml
last_session_id: {id from MemPalace, or session-NNN if fallback}
interrupted: false
last_updated: {ISO date}
```

### 4. Refresh MEMORY.md pointer

`{path}/MEMORY.md` becomes a thin pointer:

```markdown
# Project Memory — {name}

Latest session: {id}
Project wing: proj-{name}
Last updated: {date}

(Use /resume to restore context. Old verbatim sessions in `sessions/`.)
```

### 5. Append SESSION-LOG.md (caveman, single line)

```
{ISO timestamp} save. phase {phase}. {1-line caveman of session highlight}. wing proj-{name}.
```

### 6. Confirm to user (normal English)

```
Session saved.
Phase: {phase}
Next: {next_task}
Wing: proj-{name} ({fallback_used: mempalace if relevant})
Run /resume on any ATESCHH KIT install to continue.
```

## Failure modes

- MemPalace unreachable → fallback writes to `sessions/`. Still successful, flagged in confirm message.
- STATE.md write fails (permission, disk) → abort, surface error, do not delete session in flight.
- Both MemPalace and filesystem fail → rare; surface critical error, keep session running.

## Anti-Patterns (Forbidden)
- Dumping verbatim session transcripts.
- Writing normal English where caveman is required (per Rule 12).
- Skipping STATE.md update.
- Replacing MEMORY.md content with the full summary (use the pointer pattern).

## Next

`/resume` (any platform).
