---
command: /job [number]
description: Execute a cross-platform job (mission/job-NNN.md). For Claude Code ↔ Antigravity ↔ OpenCode handoff.
phase: any
agents: [coder, debugger, context-manager]
skills: []
outputs: [mission/job-NNN.md updated with Result section]
---

# /job

Used when the other AI tool (Antigravity, OpenCode, etc.) has queued a self-contained task in `mission/job-NNN.md`. The receiving platform runs `/job NNN` to pick it up.

## Steps

### 1. Locate the job

- Argument given (`/job 3`) → read `mission/job-003.md`.
- No argument → list `mission/job-*.md` files with status `PENDING` (caveman one-line each); ask which.

If file missing or status is `DONE` → tell user, exit.

### 2. Parse

Frontmatter: `id`, `status`, `from`, `to`, `created`. Body: `Context`, `Task`, `Expected Output`. Read referenced files only as needed (lazy).

### 3. Execute

Apply spawn matrix per Rule 11:
- Job describes a code task → estimate size; spawn `coder` or handle inline.
- Job is a question / report → handle inline.
- Job describes a bug fix → spawn `debugger`.

Run L1+L2 if code was changed.

### 4. Append Result section

```markdown
---
## Result

status: DONE
completed_by: {this platform}
completed_at: {ISO timestamp}

summary (caveman): {1-3 lines}

output_files:
  - {path}: {what changed}

metrics:
  L1: pass | fail | n/a
  L2: pass | fail | n/a
```

Update frontmatter `status: DONE`.

### 5. Append SESSION-LOG.md (caveman)

```
{ISO timestamp} job-{NNN} done. summary: {1-line caveman}.
```

### 6. Confirm (normal English)

```
Job {NNN} complete. Result appended to mission/job-{NNN}.md.
Switch back to {from} platform to continue.
```

## Creating a Job

Either platform can create jobs. Format:

```markdown
---
id: "NNN"
status: PENDING
from: {your platform}
to: {target platform}
created: {ISO date}
---

# Job NNN: {title}

## Context
{brief; what phase, last completed task}

## Task
{self-contained, specific}

## Expected Output
{files or results}
```

Save as `mission/job-NNN.md`. Tell user to switch platforms and run `/job NNN`.

## Anti-Patterns (Forbidden)

- Skip the L1+L2 check on code-changing jobs.
- Run a job whose `to:` field doesn't match the current platform without explicit user override.
- Modify the original `Task` field (jobs are append-only after `Result`).
- Skip the SESSION-LOG entry.

## Next

Switch platforms; the originating side reads the Result.
