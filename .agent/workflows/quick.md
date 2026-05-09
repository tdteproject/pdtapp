---
command: /quick
description: Ad-hoc task bypass. No phase advance, no PLAN.md, no STATE schema changes. Spawn matrix decides delegation.
phase: any
agents: [coder, debugger, context-manager]
skills: []
outputs: [Completed task, optional BACKLOG / DECISIONS append]
---

# /quick

For one-off requests outside the main pipeline: a small bug fix, a question, a quick refactor, a one-shot script.

`/quick` does **not** advance project phase, does **not** write PLAN.md, does **not** mark wireframes done. It's a bypass.

Use:
- Bug fix outside the current phase scope.
- Code explanation / review question.
- Single-file refactor.
- One-off script.

Don't use for:
- New features (use `/build`).
- Changes to locked files (use `/polish`).
- Multi-day work (split into a project).

## Steps

### 1. Capture task

If task wasn't stated, ask once: "What is the task? (one sentence)"

### 2. Spawn decision (per Rule 11)

```
spawn = (lines_changed_estimate > 20)
     or (files_touched > 1)
     or (domain expertise needed: design / deploy / debug)
```

Inline → orchestrator does it directly.
Spawn → `coder` Task() with caveman task body. Bug fix → spawn `debugger` instead.

### 3. Lazy context

If a project is active and the task touches its code:
- Read REQUIREMENTS.md (constraint check).
- `context-manager.recall.code <target>` (Graphify or grep fallback).

If no project active, work in the bare directory.

### 4. Execute

Do the work (inline or via spawned agent). Run L1+L2 if it's code.

### 5. Log selectively

- Bug fix related to active project → append `DECISIONS.md` via `context-manager.write.decision`.
- New idea surfaced → append `BACKLOG.md` (single line, no timestamp ceremony).
- Configuration / settings touched → mention in confirmation; do not modify STATE.md unless task is explicitly part of project work.

### 6. Confirm

Reply normal English: 1–2 lines. Result + any side notes.

## Anti-Patterns (Forbidden)

- Advance project phase.
- Write to STATE.md unless the task explicitly fixed something the user asked to log.
- Modify locked files (REQUIREMENTS, DESIGN, WIREFRAMES, STRUCTURE, DECISIONS in their locked sections).
- Treat `/quick` as `/build` (bypass spawn matrix).

## Next

Back to whatever the user was doing. `/status` to see the active project.
