# Architecture — ateschh-kit v2.0

## Overview

ateschh-kit is a structured AI development system that guides AI agents through the full software development lifecycle. It operates on a three-layer architecture: **Workflows → Agents → Skills**, with three integrations bundled at install time and twelve auto-loaded behavioural rules.

---

## The Three Layers

```
┌─────────────────────────────────────────────┐
│                 USER                        │
│         (types slash commands)              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           WORKFLOWS  (.claude/commands/)    │
│   Orchestrators — read state, route by      │
│   STATE.phase, spawn agents via Task(),     │
│   parse YAML envelopes, update state.       │
│                                             │
│  /new-project /workspace /app               │
│  /brainstorm /requirements /design          │
│  /wireframe /build /test /polish /deploy    │
│  /save /resume /status /finish /next        │
│  /quick /edit /run /map-codebase            │
│  /settings /job /migrate /rollback          │
└──────────┬──────────────────────────────────┘
           │ Task(subagent_type, prompt, tools)
┌──────────▼──────────────────────────────────┐
│             AGENTS  (.claude/agents/)       │
│   12 specialists, fresh context per spawn,  │
│   each returns caveman summary + YAML       │
│   envelope per OUTPUT-SCHEMA.md.            │
│                                             │
│  Pipeline:                                  │
│   idea-analyst   market-researcher          │
│   requirements-expert  architect            │
│   designer  wireframer                      │
│   coder  tester  qa-reviewer  debugger      │
│   deployer                                  │
│  Service:                                   │
│   context-manager (haiku, MemPalace +       │
│                    Graphify abstraction)    │
└──────────┬──────────────────────────────────┘
           │ may consult
┌──────────▼──────────────────────────────────┐
│             SKILLS  (.claude/skills/)       │
│   Reference text — domain knowledge.        │
│                                             │
│  Canonical (9):                             │
│   idea-analysis  market-research            │
│   requirements-lock  architecture-design    │
│   write-code  run-tests  fix-bugs           │
│   publish  context-management               │
│  Community (22, advisory):                  │
│   .claude/skills/community/...              │
└─────────────────────────────────────────────┘
```

---

## Real Subagent Delegation

The orchestrator **never** simulates an agent by reading its definition file inline. Every agent runs in its own context window via `Task(subagent_type: "<name>", prompt: <caveman task body>, ...)`. This is enforced by `Rule 11`.

Why:
- Orchestrator context stays small (≤ 8% on `/resume`).
- Each agent has a clean 200k window for its own work.
- Parallel dispatch becomes possible (multiple agents in one wave).

---

## Behavioural Rules (`.claude/rules/`)

| File | Topic |
|------|-------|
| `01-identity.md` | Role and behaviour |
| `02-language.md` | English-only system; user-facing language is user choice |
| `03-quality.md` | L1–L4 gates |
| `04-completion-lock.md` | One project at a time |
| `05-state-management.md` | STATE.md schema + workspace path resolution |
| `06-requirements-lock.md` | Tech stack lock |
| `07-token-management.md` | Context zones, lazy load, agent delegation |
| `08-ui-design.md` | Design engine integration |
| `09-error-recovery.md` | Failure categories, fallback order, WIP rollback |
| `10-polish-loop.md` | Polish iteration protocol, locked-file unlock |
| `11-agent-contract.md` | Spawn matrix, output schema, handoff, parallel dispatch |
| `12-caveman-style.md` | Caveman application matrix |

---

## Phase State Machine

`STATE.phase` is one of:
```
brainstorm → requirements → design → wireframe → build → test → deploy-ready
                                                             ↓
                                                    deploy-ready ⇄ polish-N
                                                             ↓
                                                         deployed
```

`/next` is a deterministic router over this enum. `/build` and `/test` honour `polish-N` automatically.

---

## Save / Resume Cycle

```
session work → /save
                 ↓
   caveman summary (≤500 tokens)
                 ↓
   ┌─────────────────────────────┐
   │ MemPalace project wing      │
   │ + agent diaries             │
   │ + STATE.md last_session_id  │
   │ + MEMORY.md pointer         │
   │ + sessions/session-N.md     │
   │   (caveman fallback only)   │
   └─────────────────────────────┘
                 ↓
   close session
                 ↓
   new session, /resume
                 ↓
   load only:
     ACTIVE-PROJECT.md
     STATE.md
     last-session caveman summary
                 ↓
   show 3-line brief, wait for "continue"
                 ↓
   on continue: lazy-load phase-specific artefacts
   on detail request: context-manager.recall.* (Graphify, MemPalace)
```

Target: ≤ 8% context restored after `/resume` with full integrations available.

---

## Parallel Dispatch

`/build --all` (or `/polish --all`, etc.) builds a DAG from PLAN.md `dependencies` and `files_touched`, then spawns concurrent waves up to `parallel_concurrency` (default 3). Tasks with overlapping `files_touched` are not in the same wave.

Failure modes:
- `fail-fast` (default): on any failure, finish the in-flight wave, then stop.
- `--continue-on-fail`: failed tasks marked, subsequent waves continue.

Algorithm specified in `Rule 11 §4`.

---

## Bundled Integrations

| Integration | Purpose | Used by |
|-------------|---------|---------|
| **Graphify** | Codebase knowledge graph | `/map-codebase`, `/build` (lazy code recall via `context-manager.recall.code`), `/edit` |
| **MemPalace** | Per-project + per-agent memory wings | `/save`, `/resume`, `/build` (decision recall) |
| **Caveman** | Token compression on machine-read artefacts | hooks per `Rule 12` matrix |
| **Context7** (separate install) | Library docs verification | `/requirements` (seeds `.context7-cache/`); `coder` reads cache at task time |

`npx ateschh-kit doctor` verifies all reachable.

---

## File System

```
ateschh-kit/
├── CLAUDE.md
├── AGENTS.md
├── ARCHITECTURE.md         ← this file
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── REFACTOR-PLAN.md        (active during v1 → v2 migration)
├── LICENSE
│
├── .claude/
│   ├── agents/             ← 12 agents + REGISTRY + OUTPUT-SCHEMA + CONTEXT7-CACHE-FORMAT + _TEMPLATE
│   ├── skills/             ← canonical (9) + community/ (22) + REGISTRY
│   ├── commands/           ← slash command source of truth (23 files)
│   ├── rules/              ← 12 behavioural rules
│   └── settings.local.json
│
├── .agent/workflows/       ← generated mirror (Antigravity)
├── .opencode/commands/     ← generated mirror (OpenCode)
│
├── templates/
│   ├── project/            ← REQUIREMENTS, DESIGN, STRUCTURE, PLAN, STATE, DECISIONS, BACKLOG, POLISH-PLAN, POLISH-CHANGES
│   └── workspace/          ← WORKSPACE, DESIGN-SYSTEM
│
├── design-engine/          ← built-in UI/UX intelligence (CSVs + Python)
├── design-search.py        ← cross-platform Python wrapper
│
├── scripts/
│   ├── sync-commands.ps1 / .sh
│   ├── sync-skills.ps1
│   ├── validate.ps1
│   ├── migrate.ps1         (Phase 7)
│   └── rollback.ps1        (Phase 7)
│
├── bin/
│   └── install.js          ← npx entry point + doctor
│
├── setup.py                ← post-install scaffolding
│
├── .state/                 ← runtime state (gitignored)
│   ├── ACTIVE-PROJECT.md
│   ├── ACTIVE-CONTEXT.md
│   └── SESSION-LOG.md
│
├── projects/               ← active projects (gitignored)
└── archive/                ← finished projects (gitignored)
```

---

## Per-Project Layout

```
projects/<name>/
├── REQUIREMENTS.md         ← locked after /requirements
├── DESIGN.md               ← locked after /design (high-level decisions)
├── STRUCTURE.md            ← locked after /design (page list)
├── PLAN.md                 ← live, schema per templates/project/PLAN.md
├── WIREFRAMES.md           ← locked after /wireframe (or absent if skipped)
├── DECISIONS.md            ← append-only, normal English (audit trail)
├── BACKLOG.md              ← append-only future ideas
├── STATE.md                ← live; frontmatter holds kit_version, phase, etc.
├── MEMORY.md               ← thin pointer to MemPalace wing
├── design-system/
│   ├── MASTER.md           ← generated by design-engine
│   └── pages/<page>.md     ← per-page overrides (optional)
├── .context7-cache/
│   └── <lib>@<ver>/        ← API summaries; coder reads, requirements-expert writes
├── polish/
│   └── iteration-N/
│       ├── PLAN.md
│       └── CHANGES.md
├── sessions/               ← caveman fallback when MemPalace unavailable
├── test-reports/           ← per-test-run reports
├── run-log.md              ← /run history
├── .wip/                   ← in-progress task snapshots (per Rule 09)
├── .backup-pre-2.0/        ← migration backup (Phase 7)
├── .kit-version            ← stamp file used by /migrate detection
└── src/                    ← actual code
```

For workspace mode, the same layout sits under `projects/<workspace>/apps/<app>/`, plus workspace-level `WORKSPACE.md` and `DESIGN-SYSTEM.md` at the workspace root.

---

## Output Envelope

Every spawned agent returns:
1. A caveman summary (≤ 500 tokens, sentence fragments, no fluff).
2. A YAML structured block conforming to `.claude/agents/OUTPUT-SCHEMA.md`.

Required envelope fields: `agent`, `status`, `files_changed`, `artifacts`, `decisions`, `next_blocker`, `metrics` (L1–L4), `custom`.

The orchestrator parses YAML to make routing decisions. The caveman summary is logged to SESSION-LOG and MemPalace; it is not relayed verbatim to the user (the orchestrator translates to normal English when speaking to the user).

---

## Quality Gates

| Level | Owner | Required |
|-------|-------|----------|
| L1 build/types/lint | tester or coder (inline) | Always |
| L2 feature works | tester or coder (inline) | Always |
| L3 integration | tester | At `/test` |
| L4 perf / a11y / sec / UX | qa-reviewer | Before `/deploy` |

Polish iterations re-run the relevant level after their tasks complete.

---

## Migration Compatibility

v1.x projects detected via missing `kit_version` stamp. `/migrate` performs a one-shot transformation:
- STATE.md schema upgrade (defaults populated).
- PLAN.md schema upgrade (existing tasks preserved, new fields blank).
- MEMORY.md and `sessions/*.md` imported into MemPalace wings.
- Locked files frontmatter gain `kit_version` field; content untouched.
- Backup at `projects/<name>/.backup-pre-2.0/`. `/rollback` available.

Until migrated, v2.0 commands operate on v1.x projects in degraded mode and surface an upgrade prompt.
