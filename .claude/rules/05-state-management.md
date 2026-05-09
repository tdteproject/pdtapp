# State Management

## Project Files — `projects/{name}/`
| File | Purpose | Locked? |
|------|---------|---------|
| REQUIREMENTS.md | Tech stack + libraries | ✅ Yes |
| DESIGN.md | Colors, fonts, UI system | ✅ Yes |
| STRUCTURE.md | Pages and features | No |
| WIREFRAMES.md | Per-page content + ASCII layout | ✅ After /wireframe |
| STATE.md | Current progress (live) | No |
| PLAN.md | Task details | No |
| DECISIONS.md | Why X was chosen | No |
| BACKLOG.md | Future ideas | No |

## Global Files — `.state/`
| File | Purpose |
|------|---------|
| ACTIVE-PROJECT.md | Active project name + path |
| SESSION-LOG.md | All session logs |
| ACTIVE_CONTEXT.md | Context snapshot for /save |

## STATE.md Must Always Show
- Current phase (1–6), completed tasks, next task, last verification results

## Update Rules
- Update STATE.md after every task (not end of session)
- Never leave STATE.md partially done
- Unexpected end → write "INTERRUPTED" + last known state

## Workspace Mode — Path Resolution

When `ACTIVE-PROJECT.md` contains `- **Type**: workspace`:
- All commands that read/write project files resolve against the **active app path**:
  `projects/{workspace-name}/apps/{active-app}/`
- Workspace-level files live at: `projects/{workspace-name}/`
- Use `App Path` from ACTIVE-PROJECT.md as the base for all per-app file operations.
- Workspace-level DESIGN-SYSTEM.md is shared across apps. Each app's DESIGN.md may extend it.

## Workspace Files — `projects/{workspace-name}/`
| File | Purpose | Locked? |
|------|---------|---------|
| WORKSPACE.md | App manifest + active app pointer | No |
| DESIGN-SYSTEM.md | Shared design tokens across all apps | After /design |
| DECISIONS.md | Workspace-level architectural decisions | No |
| BACKLOG.md | Workspace-level future ideas | No |

## Session Log Format
```
## YYYY-MM-DD — {project-name}
- **Done**: {completed}
- **Status**: Phase {N}, Task {X}
- **Next**: {next task}
```
