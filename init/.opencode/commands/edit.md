---
command: /edit
description: Focused edit of an existing page, component, or file. Spawn matrix decides delegation; small tweaks stay inline.
phase: any
agents: [coder, context-manager]
skills: [write-code]
---

# /edit

For tweaks to existing code: layout adjustments, copy changes, small visual fixes, single-file logic touches.

Not for new features (use `/build`). Not for bugs (use `/run` to repro then `/build` or spawn `debugger`).

## Path resolution

Standalone: `{path} = projects/{name}/`
Workspace app: `{path} = projects/{workspace-name}/apps/{app}/`

## Steps

### 1. Identify target

If user named a file or page, use it. Otherwise ask: "Which page or file?"

### 2. Recall context (lazy)

- `context-manager.recall.code <target>` → Graphify hits relevant to the target (or grep fallback).
- Read `{path}/DESIGN.md` (small, theme constraints).
- If touching a page, read `{path}/design-system/pages/{page}.md` (or MASTER fallback).
- Read the target file(s) only.

### 3. Clarify if vague

One question max if the request is ambiguous.

### 4. Spawn decision (per Rule 11)

```
spawn = (files_touched > 1)
     or (lines_changed_estimate > 20)
     or (touches multiple components / shared state)
```

If spawn = false → orchestrator edits inline (Edit tool), runs L1+L2, done.
If spawn = true → spawn `coder` with a caveman task body that names the target, the change, and constraints (no scope creep, design-system tokens only).

### 5. Run L1 + L2

After edit (inline or via coder):
- L1: `npm run build`, typecheck, lint.
- L2: smoke test the affected feature.

If L2 fails → spawn `debugger`.

### 6. Wrap up

- `context-manager.write.session-summary` (caveman): `edit {target}. {1-line caveman}.`
- Append SESSION-LOG.md (caveman).
- If non-trivial decision was made (e.g. extracted a shared component), append `DECISIONS.md` via `context-manager.write.decision`.

## Failure modes

- Target unclear → exit, ask.
- Edit affects locked files (REQUIREMENTS, DESIGN, etc.) → refuse. Suggest `/polish` for sanctioned unlock.
- L2 fails twice → escalate to user.

## Anti-Patterns (Forbidden)
- Refactor the surrounding file beyond the edit scope.
- Introduce design tokens not in DESIGN.md / MASTER.md.
- Spawn `coder` for a 1–3 line change that the orchestrator could do inline.

## Next

`/run`, `/test`, or another `/edit`.
