---
command: /map-codebase
description: Analyses an existing codebase. Prefers Graphify for structural extraction; falls back to 4-agent parallel analysis. Integrates the project into the kit workflow.
phase: pre-start
agents: [architect, requirements-expert, tester, context-manager]
skills: []
outputs: [.planning/codebase/, REQUIREMENTS.md, STRUCTURE.md, DESIGN.md, STATE.md, PLAN.md, ACTIVE-PROJECT.md]
---

# /map-codebase

Analyses an existing codebase — half-built, taken over, or inherited — and integrates it into the kit workflow. After this command, `/build`, `/test`, or any other phase command works as if the project was started from scratch.

**Does NOT modify any existing code.**

## Strategy

Two-tier analysis:

1. **Graphify-first** (preferred). `context-manager.recall.code` builds a graph and answers: tech stack, architecture, pages, data flow, quality. Token-cheap, structural.
2. **4-agent parallel fallback** (when Graphify unavailable). Spawns 4 `Task()` calls in parallel, one per concern: tech stack, architecture, quality, core concerns. Each writes a `.planning/codebase/0N-*.md` file.

The orchestrator picks tier 1 if `npx ateschh-kit doctor` reports Graphify ok; tier 2 otherwise. Mixed mode (Graphify for code structure + an agent for quality) allowed if the orchestrator deems it useful.

## Steps

### Phase 0 — Project Type Detection

1. Ask in a single message:
   ```
   A few questions before we start:

   1. Project name?
   2. Single app or multiple apps (workspace)?
      → Single: one codebase, one deployable
      → Workspace: multiple apps in subdirectories (e.g. web-app/, admin/, mobile/)
   3. Root folder to analyze? (default: current directory)
   ```
   Wait for answers.

   **If workspace** → skip to **Workspace Mode** section below.
   **If single app** → continue with Phase 1.

2. **Tier 1 — Graphify** (if available)

   Spawn `context-manager` (operation `recall.code`) with broad query "tech stack architecture data flow quality"; pass the project root. The returned graph nodes + relationships populate `.planning/codebase/01-tech-stack.md` through `04-core-concerns.md` directly. Skip the 4-agent fallback below.

   **Tier 2 — 4-agent parallel fallback** (Graphify unavailable)

   Launch all 4 agents simultaneously via 4 `Task()` calls in one message (concurrency = 4 for this command, justified by hard parallelism):

   **Agent 1 — Tech Stack Mapper**: reads package.json/pubspec.yaml/go.mod/requirements.txt/Cargo.toml
   - Identifies: runtime, framework + versions, all dependencies + purpose, build tools, CI/CD config
   - Output: `.planning/codebase/01-tech-stack.md`

   **Agent 2 — Architecture Mapper**: reads folder structure, entry points, routing files, page/component files
   - Identifies: directory structure, key modules + responsibilities, data flow, external integrations, pages/screens list
   - Output: `.planning/codebase/02-architecture.md`

   **Agent 3 — Quality & Standards Mapper**: reads ESLint/TSConfig/Prettier/test/CI configs, scans for TODOs
   - Identifies: code style rules, test coverage + patterns, type safety level, TODOs/FIXMEs, known bugs
   - Output: `.planning/codebase/03-quality-standards.md`

   **Agent 4 — Core Concerns Mapper**: reads auth, DB schema, API routes, state management, UI components
   - Identifies: auth architecture, DB schema summary, core business logic, state management, UI style/design system if any
   - Output: `.planning/codebase/04-core-concerns.md`

3. Synthesize findings:
   - `.planning/codebase/05-summary.md`:
     ```markdown
     # Codebase Summary
     **Tech Stack**: {one-line}
     **Architecture**: {pattern}
     **Quality Level**: {poor/fair/good/excellent}
     **Complexity**: {low/medium/high}
     ## Top 3 things to know
     ## Top 3 risks or problems
     ## What's complete
     ## What's missing or incomplete
     ```
   - `.planning/codebase/06-getting-started.md` — how to run locally
   - `.planning/codebase/07-conventions.md` — naming, file structure, patterns used

### Phase 2 — System Integration

4. Ask the user:
   ```
   ✅ Analysis complete. Now I'll integrate this project into the workflow.

   Before I do, two questions:
   1. Do you want to continue building from where it left off, or restart from scratch?
      → Continue: I'll map the current state and generate remaining tasks
      → Restart: I'll set up the project fresh (existing code can be kept or cleared)
   2. Is there a deployed version, or is this still in development?
   ```
   Wait for answers.

5. **If "Continue"** — generate project files from analysis:

   **REQUIREMENTS.md** — extracted from tech stack analysis:
   ```markdown
   # Requirements — {Project Name}
   **Status**: LOCKED ✅ (extracted from existing codebase)
   **Locked on**: {date}
   ## Stack
   {from 01-tech-stack.md}
   ## Libraries
   {from 01-tech-stack.md}
   ## Out of Scope
   - (anything not found in the codebase)
   ```

   **STRUCTURE.md** — extracted from architecture analysis:
   ```markdown
   # Structure — {Project Name}
   {pages/screens list with purpose, extracted from 02-architecture.md}
   ```

   **DESIGN.md** — extracted from UI/component analysis:
   - If a design system exists (Tailwind config, CSS variables, component library): extract colors, fonts, spacing
   - If none found: mark as "⚠️ No design system detected — run `/design` to define one"
   - Status: LOCKED if extracted, PENDING if not found

   **STATE.md** — based on completeness assessment:
   ```markdown
   # State — {Project Name}
   **Phase**: {detected phase} (e.g. Phase 4 — Build, 60% complete)
   **Imported from existing codebase on**: {date}

   ## Completed
   {list of what's done based on analysis}

   ## In Progress / Incomplete
   {list of half-built features, TODOs, broken areas}

   ## Not Started
   {list of missing pages/features that similar apps typically have}
   ```

   **PLAN.md** — remaining work as tasks:
   - List only what's NOT done yet
   - Each task: page or feature name, S/M/L size estimate, dependency order
   - Prioritize: fix broken → complete incomplete → add missing

6. **If "Restart"** — ask:
   ```
   Clear existing code from src/ and start fresh, or keep code and overwrite gradually during /build?
   ```
   - Keep: run normal `/new-project` flow, `/build` will overwrite files task by task
   - Clear: remove src/, then run `/new-project` flow from scratch

7. Write `projects/{name}/` with all generated files.
   Write `.state/ACTIVE-PROJECT.md`:
   ```markdown
   # Active Project
   - **Name**: {name}
   - **Path**: projects/{name}/
   - **Phase**: {detected phase}
   - **Started**: {date}
   - **Source**: imported from existing codebase
   ```

### Phase 3 — Handoff

8. Report:
   ```
   ✅ Codebase mapped and integrated!

   📁 Analysis:    .planning/codebase/ — 7 files
   📋 Project:     projects/{name}/
   🔧 Stack:       {one-line tech stack}
   📐 Structure:   {N} pages/modules detected
   📊 Progress:    ~{X}% complete (estimated)

   ## What's done
   {bullet list}

   ## What's left
   {bullet list}

   ## Suggested next step
   → `/build` — continue coding from where it left off
   → `/design` — define or improve the visual system first
   → `/test`   — run quality checks on existing code first
   ```
9. Ask: "Which step do you want to take next?"

---

## Workspace Mode

> Use this path when the user has multiple apps in subdirectories.

### Phase 1 — App Discovery

W1. Ask:
   ```
   Tell me about the apps in this workspace:

   1. Workspace name? (e.g. my-saas)
   2. List the apps and their folders:
      - App name → folder path (e.g. web-app → ./web, admin → ./admin)
   3. Is there a shared folder (shared/, packages/, libs/)? If yes, which one?
   ```
   Wait for answers.

W2. For each app, launch 4 parallel analysis agents (same as Phase 1 above):
   - Tech Stack, Architecture, Quality, Core Concerns
   - Output to `.planning/codebase/{app-name}/01-tech-stack.md` ... `04-core-concerns.md`
   - Run all apps in parallel if possible, otherwise sequentially

W3. Also analyze the shared folder if present:
   - Output to `.planning/codebase/shared/`

W4. Generate a per-app summary and a workspace-level summary:
   - `.planning/codebase/{app-name}/05-summary.md` — per app
   - `.planning/codebase/00-workspace-summary.md`:
     ```markdown
     # Workspace Summary — {workspace-name}
     **Apps**: {list}
     **Shared code**: {yes/no, what}
     **Common tech**: {shared stack across apps}

     ## Per-App Status
     | App | Stack | Completeness | Phase |
     |-----|-------|-------------|-------|
     | {app} | {stack} | ~{X}% | Phase {N} |

     ## Cross-App Risks
     {shared DB? auth shared? API dependencies between apps?}
     ```

### Phase 2 — Workspace Integration

W5. Ask:
   ```
   ✅ Analysis complete for all {N} apps.

   For each app, do you want to:
   → Continue: map current state, generate remaining tasks
   → Restart: set up fresh (keep or clear existing code)

   Answer per app, or say "continue all" / "restart all".
   ```
   Wait for answers.

W6. Create workspace folder structure:
   - `projects/{workspace-name}/WORKSPACE.md` — app manifest table
   - `projects/{workspace-name}/DESIGN-SYSTEM.md` — fill from any shared design tokens found
   - `projects/{workspace-name}/DECISIONS.md`
   - `projects/{workspace-name}/BACKLOG.md`

W7. For each app — generate project files under `projects/{workspace-name}/apps/{app-name}/`:
   - `REQUIREMENTS.md` — from tech stack analysis
   - `STRUCTURE.md` — from architecture analysis
   - `DESIGN.md` — from UI analysis (or mark PENDING)
   - `STATE.md` — completeness assessment
   - `PLAN.md` — remaining tasks only, prioritized

   Fill `WORKSPACE.md` apps table with detected phase and status for each app.

W8. Set the first app (or most active one) as active. Write `.state/ACTIVE-PROJECT.md`:
   ```markdown
   # Active Project
   - **Type**: workspace
   - **Workspace**: {workspace-name}
   - **Path**: projects/{workspace-name}
   - **Active App**: {first-app}
   - **App Path**: projects/{workspace-name}/apps/{first-app}
   - **App Phase**: {detected phase}
   - **Last worked on**: {date}
   - **Source**: imported from existing codebase
   - **Next task**: {first task from PLAN.md}
   ```

### Phase 3 — Workspace Handoff

W9. Report:
   ```
   ✅ Workspace mapped and integrated!

   🗂 Workspace: {workspace-name}
   📁 Analysis:  .planning/codebase/ — {N} apps analyzed
   📋 Projects:  projects/{workspace-name}/apps/

   ## App Status
   | App | Stack | Done | Left |
   |-----|-------|------|------|
   | {app} | {stack} | {X items} | {Y items} |

   ## Suggested next steps
   → `/build`        — continue coding the active app ({first-app})
   → `/app [name]`   — switch to a different app
   → `/design`       — define or improve the shared design system
   → `/test`         — run quality checks on existing code first
   ```
W10. Ask: "Which app do you want to start with?"
