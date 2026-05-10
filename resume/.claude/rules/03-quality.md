# Quality Standards

| Level | Checks | When |
|-------|--------|------|
| L1 | No build/type/lint errors | Always |
| L2 | Feature works as described | Always |
| L3 | Works within full system | At /test |
| L4 | Performance, security, UX | Before /deploy |

## L2 Gate
Cannot proceed to next task until L2 passes. If L2 fails: diagnose → fix → re-verify.

## After Every Task
- [ ] Build passes, no type errors, no lint errors (L1)
- [ ] Feature works, no console errors, core flow completes (L2)
- Report results to user before marking done

## File Size Limit
No source file may exceed 500–600 lines. If approaching limit: stop, split into logical modules, update imports. Config and auto-generated files exempt.
