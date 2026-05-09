---
kit_version: 2.0.0
project: {project-name}
type: standalone
phase: brainstorm
wireframe_status: pending
iteration_count: 0
last_session_id: null
interrupted: false
current_wave: 0
running_agents: []
parallel_concurrency: 3
last_updated: {YYYY-MM-DD}
started: {YYYY-MM-DD}
---

# Project State — {project-name}

`phase` valid values: `brainstorm | requirements | design | wireframe | build | test | deploy-ready | polish-N | deployed`.

`wireframe_status` valid values: `pending | done | skipped | ai-generated`.

## Phase Checklist

### brainstorm
- [ ] idea analysis (idea-analyst)
- [ ] market research (market-researcher)
- [ ] user approves

### requirements
- [ ] stack proposed (requirements-expert)
- [ ] stack approved
- [ ] REQUIREMENTS.md locked
- [ ] deploy_target set

### design
- [ ] visual system locked (DESIGN.md)
- [ ] design-system/MASTER.md generated (or warned absent)
- [ ] structure locked (STRUCTURE.md)
- [ ] PLAN.md generated

### wireframe
- [ ] WIREFRAMES.md locked (or wireframe_status: skipped | ai-generated)

### build
- [ ] tasks listed in PLAN.md
- next task: {T-id} {description}

### test
- [ ] L1 pass (build + types + lint)
- [ ] L2 pass (feature functionality)
- [ ] L3 pass (integration)
- [ ] L4 pass (qa-reviewer)

### deploy-ready
- user choice: deploy or polish

### polish-N (when active)
- iteration: {N}
- delta plan: polish/iteration-{N}/PLAN.md

### deployed
- url: {url}
- date: {date}
- platform: {platform}
- commit: {hash}

## Current Task

next: {describe the very next concrete action}

## Last Verification

```
date: {date}
L1: pass | fail | n/a
L2: pass | fail | n/a
L3: pass | fail | n/a
L4: pass | fail | n/a
```

## Blockers

{none | description}

## Design Engine Status

{ok | unavailable: reason}
