---
command: /next
description: Auto-pilot. Reads STATE.md phase and runs the correct next step.
phase: any
agents: []
skills: []
outputs: [Executes the appropriate next workflow]
---

# /next

State-machine router. Determines the next action from `STATE.md` phase and routes deterministically.

## Steps

1. Read `.state/ACTIVE-PROJECT.md` → get project name and type (standalone | workspace-app).
2. Resolve `{path}`:
   - standalone → `projects/{name}/`
   - workspace-app → `projects/{workspace-name}/apps/{active-app}/` (from `WORKSPACE.md`)
3. Read `{path}/STATE.md` → get `phase`, `wireframe_status`, `iteration_count`, `next_task`.
4. Route by phase:

| `phase` | Action |
|---|---|
| (no active project) | Tell user to run `/new-project` |
| `brainstorm` | Run `/requirements` |
| `requirements` | Run `/design` |
| `design` | Propose `/wireframe` (default). User may answer `--skip-wireframe` or `--ai-wireframe`. Set `wireframe_status` accordingly. |
| `wireframe` | Run `/build` |
| `build` | Tasks remaining in `PLAN.md`? yes → `/build` (next task) ; no → `/test` |
| `test` | L1–L4 pass? yes → `phase = deploy-ready` ; no → `/test` (fix loop via debugger) |
| `deploy-ready` | Ask user: "Deploy now or polish first?" → `/deploy` or `/polish` |
| `polish-N` | Tasks remaining in `polish/iteration-{N}/PLAN.md`? yes → `/build` (polish task) ; no → `/test` → returns to `deploy-ready` |
| `deployed` | "Project complete. Run `/finish` to archive?" |

5. Announce before executing:
   ```
   Auto-pilot: phase={phase}, wireframe_status={status}, iteration={N}
   Running: /{command} — {reason}
   Proceeding... (reply "stop" to cancel)
   ```
6. Execute the detected workflow.

## Workspace mode

In workspace mode, `/next` operates on the **active app** only. To advance a sibling app, run `/app <name>` first to switch.

## Failure modes

- `STATE.md` missing or unparseable → run `/status`, surface the issue, offer `/migrate` if `kit_version` is older than current.
- Phase value unknown → tell user the value, list valid values, ask which to set.
