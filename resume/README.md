# ateschh-kit

> A structured AI development system for Claude Code, Antigravity, and OpenCode.
> Goes from idea to deployment without context rot or project abandonment.

**Version 2.0.0** — Real subagent delegation, lean save/resume, polish loop, integrated Graphify + MemPalace + Caveman.

---

## Install

```bash
npx ateschh-kit@latest
```

That's it. The system is now installed in your current directory and the bundled integrations are auto-installed if Python 3.9+ and a Python installer (uv / pipx / pip) are available.

> Always use `@latest` to make sure you get the newest version — npx caches packages locally.

**Update an existing install** (keeps your projects intact):

```bash
npx ateschh-kit@latest --update
```

`--update` refreshes system files, re-runs the integration installer (idempotent), and reports any v1.x projects that need migration.

**Skip auto-install of integrations:**

```bash
npx ateschh-kit@latest --no-integrations
```

**Verify everything is reachable:**

```bash
npx ateschh-kit doctor
```

After update, run `/migrate` inside any v1.x project to upgrade it to v2.0 (creates a backup automatically; `/rollback` available if needed).

---

## What This Is

A structured workflow system that guides AI agents through the full software development lifecycle:

```
/brainstorm → /requirements → /design → /wireframe → /build → /test → /polish (optional) → /deploy
```

Each phase is gated. You can't accidentally skip from brainstorm straight to coding.

## Why It Works

| Problem | Solution |
|---------|---------|
| AI forgets context between sessions | `/save` writes a caveman summary to MemPalace; `/resume` restores in ≤ 8% of context |
| Mid-project "let's switch frameworks" | REQUIREMENTS.md is locked after approval; only the polish loop can unlock (with explicit user approval) |
| Scope creep mid-build | New ideas go to BACKLOG.md — not now |
| Project abandonment | STATE.md always knows the next concrete action |
| Perfectionist drift | `/polish` provides a structured iteration loop with size caps and a 5-iteration soft guard |
| AI codes the wrong layout | `/wireframe` locks every page's content + layout before coding starts |
| Token waste re-reading code | Graphify graph + caveman compression target ~5–8% context restore on `/resume` |
| Repeated library docs lookups | `requirements-expert` seeds `.context7-cache/` once at lock time; `coder` reads from cache |

---

## Commands at a Glance

| Command | What it does |
|---------|-------------|
| `/new-project` | Start a new single-app project |
| `/workspace` | Create a multi-app workspace |
| `/app [name]` | Add or switch apps in a workspace |
| `/brainstorm` | Idea analysis + market research (parallel agents) |
| `/requirements` | Select and lock the tech stack; seed Context7 cache |
| `/design` | Theme + page structure (architect + designer in parallel) |
| `/wireframe` | Lock per-page content + layout (default after `/design`) |
| `/build` | Implement tasks; supports `--all` for parallel dispatch |
| `/test` | L1–L3 via tester, L4 via qa-reviewer |
| `/polish` | Open an iteration loop between `/test` and `/deploy` |
| `/deploy` | Production deploy via `deploy_target` from REQUIREMENTS.md |
| `/finish` | Generate completion report and archive |
| `/status` | Where you are now |
| `/save` | Save context (caveman summary, MemPalace + STATE) |
| `/resume` | Lean restore from any platform |
| `/next` | Auto-pilot: phase-aware state machine |
| `/quick` | Ad-hoc task bypass (no phase advance) |
| `/edit` | Focused edit of an existing file/page |
| `/run` | Compile, run, fix errors, log |
| `/map-codebase` | Analyse an existing codebase (Graphify-first) |
| `/settings` | View / edit kit configuration |
| `/job [n]` | Cross-platform handoff via `mission/job-NNN.md` |
| `/migrate` | Upgrade a v1.x project to v2.0 |
| `/rollback` | Restore project from latest pre-migrate backup |

---

## The Pipeline in Detail

### `/new-project` — start a project

Asks for a project name and a one-line description. Scaffolds `projects/{name}/` with empty templates and `STATE.phase: brainstorm`.

For multiple apps, use `/workspace` instead.

### `/brainstorm` — idea analysis + market research

Runs `idea-analyst` (5 Socratic questions) and `market-researcher` (3–5 competitors) **in parallel**. Synthesises both into a written summary. Locks `IDEA-ANALYSIS.md` and `MARKET-RESEARCH.md`.

You'll be asked free-form to describe the idea, then 3–5 specific follow-ups.

### `/requirements` — lock the tech stack

`requirements-expert` proposes a stack based on the idea + your platform answers. If Context7 MCP is available, it verifies versions are current and seeds `.context7-cache/<lib>@<ver>/` so `coder` doesn't re-query during build (saves ~20–40k tokens per build session).

You approve before the file locks. `deploy_target` (vercel / cloudflare / expo / firebase / docker / other) is captured here so `/deploy` knows what to do.

### `/design` — visual system + page structure

Two agents run in parallel:
- `designer` proposes 2–3 themes (mood + palette + font pairing); you pick or mix. Writes locked `DESIGN.md` and generates `design-system/MASTER.md` via the bundled design engine.
- `architect` produces `STRUCTURE.md` (page list, navigation, data flow) and `PLAN.md` (task list with id, size, dependencies, files_touched, acceptance criteria).

You approve both before they lock.

### `/wireframe` — content + layout lock

`wireframer` walks each page in `STRUCTURE.md`. For each page:
1. Proposes section list and exact copy (CTAs, error messages, empty states, loading states).
2. Generates an ASCII layout sketch.
3. Asks for your approval / edits / additions per page.

Locked `WIREFRAMES.md` is the source of truth for `coder` during build.

Modes:
- `/wireframe` — interactive (default; user approves each page).
- `/wireframe --skip` — set `wireframe_status: skipped`; advance to build with no wireframes.
- `/wireframe --ai` — generate without per-page approval; lock with `Status: AI-GENERATED`.

### `/build` — implement tasks

Wireframe-gated: refuses to run unless `wireframe_status` is `done | skipped | ai-generated`.

Modes:
- `/build` — next pending task (single).
- `/build --task T-014` — specific task.
- `/build --all` (alias `--batch`) — parallel dispatch of every remaining pending task.
- `/build --continue-on-fail` — applies with `--all`; failed tasks marked, others continue.

Per task, the spawn matrix (Rule 11) decides whether to spawn `coder` or have the orchestrator handle it inline (trivial 1–3 line edits stay inline). Spawned coder gets a caveman task body, lazy-loaded context (REQUIREMENTS, DESIGN, MASTER tokens, page wireframe, Graphify hits, MemPalace recall of prior decisions, Context7 cache).

Each completed task:
- Updates `PLAN.md` (status: done, notes: caveman summary).
- Writes a session-summary line to MemPalace.
- Appends `SESSION-LOG.md` (caveman).
- Invalidates Graphify cache for changed files.

If L2 fails, the orchestrator spawns `debugger` automatically.

### `/test` — quality gates

Two-stage:
1. `tester` runs L1 (build / typecheck / lint), L2 (feature functionality), L3 (integration). Per defect, orchestrator spawns `debugger`.
2. After L1–L3 pass, `qa-reviewer` runs L4 (perf, accessibility, security, UX polish). For non-critical L4 defects you choose: fix now or accept and ship.

When clean, `STATE.phase: deploy-ready`.

### `/polish` — iteration loop (optional)

Use this between `/test` (passing) and `/deploy` when you want refinements without restarting the project. Common reasons: visual tweaks, copy changes, scope adjustment, performance optimisation.

Flow:
1. Asks: what's changing, which pages/modules, should wireframes be re-done, iteration size (S / M / L).
2. `architect` produces a delta plan at `polish/iteration-{N}/PLAN.md`.
3. If a polish task needs to modify a locked file (REQUIREMENTS, DESIGN, WIREFRAMES, STRUCTURE), the orchestrator asks for your explicit approval per file. Each unlock is logged to `DECISIONS.md`.
4. Routes through `/build` → `/test` (regression scope) → back to `deploy-ready`.
5. Files are re-locked at iteration end. Iteration audit trail kept in `polish/iteration-{N}/CHANGES.md`.

Soft guard: at iteration 5+, the kit asks for an explicit reason. Cancel anytime with `/polish --cancel`.

### `/deploy` — production deploy

`deployer` reads `REQUIREMENTS.deploy_target`, picks the right playbook (vercel, cloudflare-workers, cloudflare-pages, supabase, expo, firebase, docker, other), runs pre-deploy checklist (L1–L4 pass, env vars production-ready, no hardcoded credentials), executes deploy, runs post-deploy smoke (golden path verification).

For `deploy_target: other`, emits a manual checklist instead of auto-deploying.

`STATE.phase: deployed` and the live URL is appended to STATE.md.

### `/finish` — archive

Generates `COMPLETION-REPORT.md` (summary, tech stack, polish iterations, key decisions, lessons learned, carry-forward backlog), then moves the project to `archive/{name}/`. Clears `ACTIVE-PROJECT.md`.

For workspaces, asks: finish the active app only, or archive the whole workspace.

---

## Save / Resume — cross-platform

The kit's defining feature: a session restored from `/save` consumes ≤ 8% of the context window before lazy-loading anything.

```
Platform A  → /save
   → caveman summary (~200–500 tokens) written to MemPalace project wing
   → STATE.md last_session_id updated
   → MEMORY.md becomes a thin pointer
   → SESSION-LOG.md appended (caveman)
   → close session

Platform B  → /resume
   → load only ACTIVE-PROJECT.md, STATE.md, last-session caveman summary (~3–5k tokens total)
   → show 3-line brief: project / last task / next task
   → wait for "continue" before loading anything else
   → on continue: lazy-load phase-specific artefacts only
   → on detail request ("what did we decide about auth?"): query MemPalace
   → on code question: query Graphify
```

If MemPalace or Graphify is unavailable, the kit falls back to filesystem and grep — slower, but `/resume` still works.

---

## Working on an Existing Codebase

```
cd path/to/existing-project
npx ateschh-kit@latest
/map-codebase
```

`/map-codebase`:
1. Detects whether Graphify is available.
2. Graphify path: builds a graph and produces `.planning/codebase/01-tech-stack.md` … `04-core-concerns.md` directly from the graph.
3. Fallback: spawns 4 parallel analysis agents, one per concern.
4. Writes `REQUIREMENTS.md`, `STRUCTURE.md`, `DESIGN.md`, `STATE.md`, `PLAN.md` from the analysis. **Does not modify your existing code.**

After `/map-codebase`, the project is integrated into the kit and you can continue with `/build`, `/test`, `/polish`, or `/deploy` as if it had been started here.

---

## Cross-Platform Jobs

Use the `mission/` queue to hand work off between platforms.

```
Claude Code:
  → creates mission/job-001.md with status PENDING
  → contains Context, Task, Expected Output

Antigravity (or OpenCode):
  → /job 1
  → executes, appends Result section, status DONE

Claude Code (next session):
  → reads mission/job-001.md result
```

Useful when one platform is faster at a specific task or when you're switching tools mid-day.

---

## Migration from v1.x

If you have an existing v1.x project, run:

```
/migrate
```

What happens:
1. Pre-flight validator checks locked files parse cleanly.
2. Backup taken at `{path}/.backup-pre-2.0.0/`.
3. Transformers run:
   - `STATE.md` rewritten with v2.0 frontmatter (`kit_version`, `phase` enum, `wireframe_status`, etc.); phase auto-detected.
   - `PLAN.md` rewritten with new task schema (`id`, `size`, `dependencies`, `files_touched`, etc.); existing tasks preserved by id.
   - `MEMORY.md` archived to `sessions/legacy-memory-2.0.0.md` and replaced with a pointer; verbatim content imported to MemPalace if available.
   - Stale directories (`agents/`, `skills/`, `context-agent/`) cleaned up.
   - `.kit-version` stamped.
4. Post-flight validator confirms.
5. Migration log at `{path}/.migration-log.md`.

If anything looks wrong, `/rollback` restores from the backup. `/rollback --list` shows all rollback points.

Until you migrate, v2.0 commands continue to operate on v1.x projects in **degraded mode** with a banner reminder.

See [templates/MIGRATION-GUIDE.md](templates/MIGRATION-GUIDE.md) for the full walkthrough.

---

## What's Inside

```
ateschh-kit/
├── CLAUDE.md              ← Main orchestration (Claude Code auto-loads)
├── AGENTS.md              ← Same content (Antigravity / OpenCode auto-load)
├── ARCHITECTURE.md        ← Internal architecture details
├── README.md              ← This file
├── .claude/
│   ├── agents/            ← 12 specialist subagents (Claude Code native)
│   ├── skills/            ← 9 canonical + 22 community helpers
│   ├── commands/          ← Slash commands (single source of truth)
│   ├── rules/             ← 12 auto-loaded behavioural rules
│   └── settings.local.json
├── .agent/workflows/      ← Generated copy of commands (Antigravity native)
├── .opencode/commands/    ← Generated copy of commands (OpenCode native)
├── templates/
│   ├── project/           ← STATE, REQUIREMENTS, DESIGN, STRUCTURE, PLAN, DECISIONS, BACKLOG, POLISH-PLAN, POLISH-CHANGES
│   └── workspace/         ← WORKSPACE, DESIGN-SYSTEM
├── design-engine/         ← Built-in UI/UX intelligence (CSVs + Python)
├── design-search.py       ← Cross-platform Python wrapper
├── scripts/
│   ├── sync-commands.{ps1,sh}  ← Mirror .claude/commands/ to .agent/ and .opencode/
│   ├── sync-skills.ps1         ← Refresh community skills from global Claude skills dir
│   ├── validate.ps1            ← Frontmatter, contract, sync drift, dead refs
│   ├── migrate.py              ← v1.x → v2.0 transformation
│   └── rollback.py             ← Restore from backup
├── bin/install.js         ← npx entry point + doctor
└── mission/               ← Cross-platform job queue (gitignored)
```

`.claude/commands/` is the single source of truth. `.agent/workflows/` and `.opencode/commands/` are mirrors generated by `npm run sync` (or `pwsh -File scripts/sync-commands.ps1`).

---

## Per-Project Layout

After `/new-project foo`:

```
projects/foo/
├── REQUIREMENTS.md       ← locked after /requirements (deploy_target included)
├── DESIGN.md             ← locked after /design (high-level decisions)
├── STRUCTURE.md          ← locked after /design (page list, navigation, API)
├── PLAN.md               ← live, schema per templates/project/PLAN.md
├── WIREFRAMES.md         ← locked after /wireframe (or absent if skipped)
├── DECISIONS.md          ← append-only, normal English (audit trail)
├── BACKLOG.md            ← append-only future ideas
├── STATE.md              ← live; frontmatter holds kit_version, phase, etc.
├── MEMORY.md             ← thin pointer to MemPalace wing
├── design-system/
│   ├── MASTER.md         ← generated by design-engine
│   └── pages/<page>.md   ← per-page overrides (optional)
├── .context7-cache/
│   └── <lib>@<ver>/      ← API summaries seeded by /requirements
├── polish/
│   └── iteration-N/
│       ├── PLAN.md
│       └── CHANGES.md
├── sessions/             ← caveman fallback when MemPalace unavailable
├── test-reports/         ← per-test-run reports
├── run-log.md            ← /run history
├── .wip/                 ← in-progress task snapshots (Rule 09)
├── .backup-pre-2.0/      ← migration backup (if migrated)
├── .kit-version          ← stamp file used by /migrate detection
└── src/                  ← actual code
```

Workspace mode mirrors the same layout under `projects/<workspace>/apps/<app>/` plus workspace-level `WORKSPACE.md` and `DESIGN-SYSTEM.md`.

---

## Bundled Integrations

Auto-installed by `npx ateschh-kit@latest` when prerequisites are present.

| Integration | Purpose | Install command (auto-run) |
|-------------|---------|---------------------------|
| **Graphify** | Codebase knowledge graph; cuts token cost on `/build` and `/resume` | `uv tool install graphifyy && graphify install` |
| **MemPalace** | Per-project + per-agent memory wings; backbone of `/save` and `/resume` | `pip install mempalace` (then registered as MCP) |
| **Caveman** | Token compression on machine-read artefacts | `claude plugin install caveman@caveman` |
| **Context7** (recommended) | Library docs verification at `/requirements` | `npx -y @upstash/context7-mcp` (manual) |

If any auto-install fails (no Python, no internet, etc.), the kit continues in **degraded mode** for that integration. Run `npx ateschh-kit doctor` to see status.

### Degraded mode behaviours

| Missing integration | Effect |
|---------------------|--------|
| Graphify | `/map-codebase` falls back to multi-agent analysis; `/build` uses grep instead of code graph (slower) |
| MemPalace | `/save` writes to `sessions/*.md` (caveman); `/resume` reads from filesystem (works but heavier) |
| Caveman | Caveman compression is applied manually by agents; still works, just not enforced by hook |
| Context7 | `/requirements` runs in degraded mode without version verification (locks anyway, with warning) |

---

## Doctor

```
npx ateschh-kit doctor
```

Reports:
- Node version
- Python version (recommends 3.10+ for Graphify)
- Git version
- Kit version
- Graphify reachable
- MemPalace reachable
- Caveman plugin installed (Claude Code)
- Context7 MCP installable
- Validator script present

Use this after any install / update or when something feels off.

---

## Configuration

Kit-wide settings live in `.state/USER-CONFIG.md` (created by `/settings` on first run):

```yaml
parallel_concurrency: 3       # 1-5; how many agents per parallel wave
caveman_mode: matrix-default  # matrix-default | off | aggressive
default_deploy_target: vercel # used as a hint by /requirements
auto_run_doctor_on_resume: yes
```

Per-project overrides live in `STATE.md` frontmatter.

MCP and permissions config: `.claude/settings.local.json`.

---

## Supported Platforms

| Platform | Slash Commands | Status |
|----------|---------------|--------|
| Claude Code | `.claude/commands/` | ✅ Full support, real `Task()` delegation |
| Antigravity | `.agent/workflows/` | ✅ Full support |
| OpenCode | `.opencode/commands/` | ✅ Full support |
| Cursor | via CLAUDE.md | ✅ Works (no native slash commands; agents read CLAUDE.md as system prompt) |
| Windsurf | via CLAUDE.md | ✅ Works |

---

## Quality Gates

| Level | What it checks | Owner | When |
|-------|---------------|-------|------|
| L1 | Build, types, lint clean | tester or coder | Always |
| L2 | Feature works as described | tester or coder | Always |
| L3 | Works within full system (auth, CRUD, error states) | tester | At `/test` |
| L4 | Perf / a11y / sec / UX polish | qa-reviewer | Before `/deploy` |

`/test` runs all four sequentially, spawning `debugger` per defect. `/polish` re-runs the relevant level after its tasks.

---

## Troubleshooting

**`/resume` shows "kit version older than current; run /migrate"** — your project was created on v1.x. Run `/migrate` to upgrade. Backup is automatic; `/rollback` available.

**`/build` refuses with "wireframe_status: pending"** — you skipped `/wireframe`. Either run it now, or pass `/build --skip-wireframe` (sets status to `skipped`) or `/build --ai-wireframe` (lets AI generate one).

**`/deploy` says "deploy_target not set"** — `REQUIREMENTS.md` is missing the `deploy_target` field. Edit it manually or unlock via `/polish` and add it.

**Doctor reports Graphify / MemPalace not installed** — auto-install needs Python 3.9+ and one of: `uv`, `pipx`, or system `pip`. Install one, then re-run `npx ateschh-kit --update`.

**Doctor reports Caveman missing but install said it succeeded** — Caveman is a Claude Code GUI plugin. The doctor probes the user plugin directory. If you installed via `claude plugin install` from another session, it's there but doctor's path detection may have missed it. The kit operates correctly; this is a doctor-only false negative.

**`/save` warns "MemPalace unreachable"** — the MCP server isn't running or isn't registered. The session is preserved in `sessions/session-NNN.md` as fallback. Re-register MemPalace and re-run `/save` to push to MemPalace.

**Validator fails (`pwsh -File scripts/validate.ps1`)** — usually means an agent or skill has malformed frontmatter, or the command tree drifted between `.claude/commands/`, `.agent/workflows/`, and `.opencode/commands/`. Re-run `pwsh -File scripts/sync-commands.ps1` then validate again.

---

## License

MIT — use freely, modify freely, no attribution required.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Contributions to skills, agents, integrations, and migration paths are welcome.
