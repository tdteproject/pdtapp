---
name: fix-bugs
description: Root cause diagnosis and minimal targeted fix for reported defects
---

# Skill: Fix Bugs

## Process

### 1. Reproduce

Follow the exact steps from the defect report.
If you can't reproduce: ask for more context. Never fix what you can't see.

### 2. Isolate

| Question | Why it matters |
|----------|---------------|
| Frontend or backend? | Narrows search space |
| Every time or sometimes? | Suggests race condition or state issue |
| After what action? | Points to the trigger |
| Only for certain users? | Suggests auth/permission problem |

### 3. Diagnose

Common patterns:

| Symptom | Root cause |
|---------|-----------|
| `undefined is not an object` | Missing null check or async race |
| `401 Unauthorized` | Token expired or header wrong |
| Infinite re-render | `useEffect` dependency instability |
| Data doesn't update | Cache stale, state not invalidated |
| CORS error | Server missing CORS header |
| Build fails | Env var missing, version conflict |
| Hydration mismatch | Server vs client render difference |

### 4. Fix

Minimal and targeted:
- Fix the root cause (not a workaround)
- Touch as few files as possible
- Don't add features or refactor while fixing

### 5. Verify

- Re-run reproduction steps → bug gone
- Run L1 → build still clean
- Check adjacent code for same pattern

### 6. Escalate if Stuck

After 2 attempts with no fix:
```
I've tried:
1. {attempt}: {result}
2. {attempt}: {result}

The issue appears to be: {hypothesis}

Options:
A. {option}: {tradeoff}
B. {option}: {tradeoff}

Which should I try?
```
