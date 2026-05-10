# Completion Lock

## One Project Rule
Only one active project at a time. Before starting new: check `.state/ACTIVE-PROJECT.md`. If active project exists → ask user to finish or archive it first.

## Workspace Mode
A workspace counts as the active project. The one-project rule still holds.
- `/workspace` creates a workspace and sets it as the active project.
- `/app` adds apps or switches between apps within the active workspace.
- `/finish` on a workspace archives the entire workspace (all apps included).
- Do not create a second workspace while one is active.
- A workspace with multiple apps in progress is valid — each app has its own phase.

## Task Done When
- [ ] Code written
- [ ] L1 passes
- [ ] L2 passes
- [ ] STATE.md updated
- [ ] User has seen the result

## Scope Creep
User requests something outside current task → acknowledge, add to BACKLOG.md, continue current task. Never expand scope mid-execution.

## End of Session
- Update STATE.md with progress
- Write next task clearly
- Log in `.state/SESSION-LOG.md`
