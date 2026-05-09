# Token Management

## Context Zones
| Zone | Usage | Action |
|------|-------|--------|
| PEAK | 0–30% | Normal |
| GOOD | 30–50% | Prefer summaries |
| DEGRADING | 50–70% | Warn user, checkpoint |
| POOR | 70%+ | Run `/save` immediately |

## Agent Delegation
Delegate when: task >50 lines, involves library research, has clear input/output.
Do NOT delegate when: task <5min, requires deeply shared session context.

## When Context Gets Tight
DEGRADING → summarize in 5 bullets, update STATE.md, tell user to `/save` then `/resume`.
POOR → stop, run `/save`, tell user to start new session.

## /save Creates
- `ACTIVE_CONTEXT.md` — 1-page state snapshot
- `sessions/session-NNN.md` — full session log
- `MEMORY.md` — long-term project memory

On `/resume` these load first, restoring full context in a fresh window.
