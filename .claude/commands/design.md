---
command: /design
description: Defines visual system + page structure. Locks DESIGN.md, design-system/MASTER.md, STRUCTURE.md, PLAN.md.
phase: design
agents: [architect, designer]
skills: [architecture-design]
---

# /design

## Preconditions

- `STATE.phase` is `requirements` (i.e. `/requirements` is locked).
- `{path}/REQUIREMENTS.md` exists with `Status: LOCKED`.

If a precondition fails: tell the user which prior phase to run and exit.

## Path resolution

- Standalone project: `{path} = projects/{name}/`
- Workspace app: `{path} = projects/{workspace-name}/apps/{app}/` (resolve `App Path` from `WORKSPACE.md`)

In workspace mode, also reference `projects/{workspace-name}/DESIGN-SYSTEM.md` for shared tokens.

## Steps

### Part A — Visual system

1. Ask 2–3 targeted visual-direction questions in one message: mood (minimal / bold / playful / professional), apps/sites admired, brand colors or fonts. Wait for answers.

2. Spawn `designer` via `Task(subagent_type: "designer", ...)`. Provide:
   - User answers from step 1.
   - Outputs of `idea-analyst` and `market-researcher` (from `/brainstorm` artefacts).
   - Path to write to: `{path}`.

3. Designer proposes 2–3 theme options. User picks or mixes.

4. Designer:
   - Writes `{path}/DESIGN.md` (high-level decisions, locked).
   - Runs `python design-search.py "<product_type> <style_keywords>" --design-system --persist -p "{Project Name}"` to generate `{path}/design-system/MASTER.md`.
   - If design engine unavailable: continue with `DESIGN.md` only, log warning to STATE.md.

### Part B — Page structure

5. Spawn `architect` via `Task(subagent_type: "architect", ...)`. Provide:
   - DESIGN.md.
   - Idea analysis + market research outputs.
   - Path to write to: `{path}`.

6. Architect proposes page tree. User approves/modifies.

7. Architect writes:
   - `{path}/STRUCTURE.md` (page list, navigation, data per page).
   - `{path}/PLAN.md` (task list per `templates/project/PLAN.template.md` — id, size, description, acceptance criteria, dependencies, files touched).

### Wrap up

8. Update `{path}/STATE.md`: `phase: design` → `phase: wireframe` (default next step). Set `wireframe_status: pending`.

9. Append caveman summary to `SESSION-LOG.md` and write to MemPalace project wing.

10. Confirm to user:
    ```
    Design locked.
    theme: {name}
    pages: {N}
    plan: {N} tasks
    next: /wireframe (recommended) or /build --skip-wireframe
    ```

## Failure modes

- Design engine fails (Python missing, etc.): warn, continue without `MASTER.md`, set `STATE.design_engine_status: unavailable`.
- User rejects all theme options: re-prompt with broader question set.
- Architect output missing fields: refuse to lock, ask architect to retry.
