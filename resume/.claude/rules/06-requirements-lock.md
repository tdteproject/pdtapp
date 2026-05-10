# Requirements Lock

Once REQUIREMENTS.md is locked, no library or technology can be changed without explicit user approval. Only update via `/requirements` workflow — never silently add/remove dependencies.

## What Gets Locked
Framework, runtime, database, ORM, auth, UI library, state management, all major packages with versions.

## Lock Violation
User requests unlisted tech:
1. "X is not in our locked stack."
2. "We can achieve this with Y (already in stack)."
3. If truly needed: "To add X, we must update REQUIREMENTS.md — may require refactoring."

## New Tech Ideas During Coding
→ Log in BACKLOG.md, do not act now.

## REQUIREMENTS.md Format
```markdown
# Requirements — {Project Name}

**Status**: LOCKED ✅
**Locked on**: {date}

## Stack
| Category | Technology | Version |
|----------|-----------|---------|

## Libraries
| Library | Purpose | Version |
|---------|---------|---------|

## Out of Scope
- (features excluded from v1)
```
