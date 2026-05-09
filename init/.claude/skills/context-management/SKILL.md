---
name: context-management
description: Save and restore project context across sessions and platforms
---

# Skill: Context Management

## Purpose

Prevent context rot and enable seamless continuation across sessions or platforms.

## Save Protocol

### When to Save

- Before ending a session
- When context > 50% full (DEGRADING zone)
- Before switching to another AI platform

### What to Save

1. **Session file** (`projects/{name}/sessions/session-NNN.md`):
   - What was done this session
   - Current phase and task
   - Files changed
   - Decisions made
   - Blockers or open questions

2. **Active context** (`.state/ACTIVE_CONTEXT.md`):
   - 1-page summary of current project state
   - Written for a fresh session to pick up immediately

3. **Session log** (`.state/SESSION-LOG.md`):
   - One-line entry per session
   - Running history of all work

### ACTIVE_CONTEXT.md Format

```markdown
# Active Context — {date} {time}

**Project**: {name}
**Phase**: {N}/6 — {phase name}

## Status in 3 lines
- Done: {last completed task}
- Next: {very next task}
- Blocked: {blocker or "None"}

## What's been built
{bullet list of completed features}

## Key decisions (don't re-discuss)
- {decision}: {why}

## Important file locations
- Requirements: projects/{name}/REQUIREMENTS.md
- Design: projects/{name}/DESIGN.md
- Plan: projects/{name}/PLAN.md
```

## Restore Protocol

### On `/resume`

1. Read `.state/ACTIVE_CONTEXT.md` (primary source)
2. Read `projects/{name}/STATE.md` (current progress)
3. Read latest session file (recent decisions)
4. Summarize to user in 3 lines
5. Ask: "Continue with {next task}?"

### Cross-Platform (Claude Code ↔ Antigravity)

Both platforms read the same file system.
The only difference is `MEMORY.md` behavior:
- **Claude Code**: add `MEMORY.md` path to Claude's memory
- **Antigravity**: the context-agent handles memory automatically

Either way, `/save` + `/resume` handles the transition.

## Context Health Monitoring

| Zone | Token Usage | Action |
|------|------------|--------|
| PEAK | 0–30% | Normal |
| GOOD | 30–50% | Prefer delegation |
| DEGRADING | 50–70% | Warn user, checkpoint |
| POOR | 70%+ | `/save` immediately |

At DEGRADING: "Context window is getting full — I recommend running `/save` soon."
At POOR: Stop, run `/save`, ask user to start new session.
