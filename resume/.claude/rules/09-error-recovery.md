# Error Recovery

Workflows and agents fail. This rule defines how the system degrades gracefully and preserves user work.

Companion to `Rule 11 — Agent Contract` (which covers agent-internal failures via the escalation ladder). This rule covers **infrastructure** and **workflow-level** failures.

## 1. Failure Categories

| Category | Example | Recovery |
|---|---|---|
| **MCP unavailable** | Context7 down, MemPalace not started | Degrade to fallback (cache, file IO, grep) |
| **Tool crash** | `design-search.py` Python missing | Log warning, continue without that artefact |
| **Network** | Vercel API timeout during deploy | Retry once with backoff; surface to user if still fails |
| **Filesystem** | Disk full, permission denied | Stop, surface to user with concrete remediation |
| **Mid-task interrupt** | User Ctrl+C, session crash | Mark `STATE.interrupted: true`, save WIP to `.wip/` |
| **L2 fail** | Coder produced broken code | Spawn `debugger` (handled by Rule 11) |
| **Validator fail** | Output schema violation | Reject agent output; surface to user |

## 2. Fallback Order

When an integration fails, agents and workflows fall back in declared order:

```
context-manager.recall.code:
   1. graphify query  (preferred)
   2. mempalace recall.code (legacy import wing)
   3. grep over project (last resort, slowest)

context-manager.recall.session:
   1. mempalace project wing (preferred)
   2. read MEMORY.md + sessions/{last-id}.md (v1.x compat)
   3. read STATE.md only (degraded)

context-manager.write.session-summary:
   1. mempalace project wing + agent diaries (preferred)
   2. append to sessions/session-NNN.md (degraded)
   3. ALWAYS update STATE.md last_session_id (mandatory)
```

The agent's output records `fallback_used` so the user knows the system is in degraded mode.

## 3. WIP Rollback

A workflow that writes multiple files (e.g. `/build` for an `L`-size task) must:

1. Stage writes in `{path}/.wip/{task-id}/`.
2. On success: move staged files to their final paths atomically.
3. On failure or interrupt: leave `.wip/` intact for inspection. Do not delete.

`/rollback --wip <task-id>` (added in Phase 7) discards a WIP cleanly.

`/build` and `/polish` honour this. Single-file edits skip staging — failure leaves the file unchanged.

## 4. STATE.md on Interrupt

If an agent or workflow is interrupted before completion:

```yaml
interrupted: true
last_session_id: <id>
running_agents: [<list still in flight>]
notes: "interrupted at {phase}/{task}. wip at .wip/{task-id}/."
```

`/resume` detects `interrupted: true`, surfaces the last known state, and asks the user to continue, retry, or rollback.

## 5. User-Facing Failure Messages

Always include three things:
- **What failed** (one line, specific).
- **What was preserved** (files unchanged, WIP location, last good state).
- **What to try next** (concrete command or fix).

Bad: `"Error: Could not connect to MCP."`
Good: `"MemPalace unreachable. Falling back to MEMORY.md. Run 'npx ateschh-kit doctor' to diagnose. Session work preserved in STATE.md."`

## 6. Logging

Every failure appends one caveman line to `SESSION-LOG.md`:

```
2026-04-29T14:32:08 [warn] context7 timeout. fell back to cache.
2026-04-29T14:35:12 [error] vercel deploy 502. retry 1 succeeded.
2026-04-29T14:48:00 [interrupt] user ctrl+c at /build T-014. wip preserved.
```

The validator does not enforce log format yet (Phase 6), but agents and workflows should follow this pattern from day one.

## 7. Forbidden Recovery Behaviours

- Silently retry forever.
- Delete user work to "clean state".
- Skip a failed step and pretend it succeeded.
- Modify locked files (REQUIREMENTS, DESIGN, etc.) as a workaround.
- Rewrite STATE.md to hide the interrupt.
- Catch an agent failure and continue as if it returned `status: ok`.
