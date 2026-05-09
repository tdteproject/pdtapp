---
name: requirements-lock
description: Writes and locks the REQUIREMENTS.md file after tech stack is approved
---

# Skill: Requirements Lock

## Purpose

Formally lock the tech stack into REQUIREMENTS.md so it cannot change during development.

## When to Use

After the requirements-expert proposes a stack and the user approves it.

## Steps

### 1. Write REQUIREMENTS.md

Use this template exactly:

```markdown
# Requirements — {Project Name}

**Status**: LOCKED ✅
**Locked on**: {YYYY-MM-DD}

## Platform
{Web App / Mobile iOS+Android / Desktop / etc.}

## Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | {name} | {version} | {1 sentence} |
| Database | {name} | {version} | {1 sentence} |
| Auth | {name} | {version} | {1 sentence} |
| UI Components | {name} | {version} | {1 sentence} |
| Styling | {name} | {version} | {1 sentence} |
| State | {name} | {version} | {1 sentence} |
| Deploy | {name} | {version} | {1 sentence} |

## All Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| {library} | {version} | {purpose} |

## Out of Scope (v1)

- {feature or technology not included}
- {reason}

## Change Policy

To change this document: run `/requirements` and get explicit approval.
Any library not listed here must be approved before use.
```

### 2. Verify File is Complete

Before saving:
- [ ] All categories filled (no "TBD")
- [ ] All versions specified (no "latest" — use real semver)
- [ ] Out of scope section filled
- [ ] File status says LOCKED ✅

### 3. Log in DECISIONS.md

```markdown
## {date} — Tech Stack Locked
- Locked: {framework + DB + deploy}
- Reasoning: {brief why}
```
