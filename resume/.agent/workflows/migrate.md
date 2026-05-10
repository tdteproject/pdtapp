---
command: /migrate
description: Upgrades a v1.x project to v2.0. Backs up first, transforms STATE/PLAN/MEMORY/sessions, validates, surfaces report. /rollback reverts.
phase: any
agents: [context-manager]
skills: []
flags: [--dry-run, --target <version>, --force]
outputs: [Project upgraded, .backup-pre-{target}/ snapshot, migration log]
---

# /migrate

One-shot upgrade of an existing project to a newer kit version. Currently supports `1.x → 2.0.0`.

`/migrate` is **opt-in**. The kit's `--update` flag refreshes system files but does not touch project data. Users run `/migrate` per project when they're ready to adopt new features.

## Preconditions

- Active project exists (`.state/ACTIVE-PROJECT.md` populated).
- Project's `.kit-version` is older than the kit's current version (otherwise nothing to do).
- Locked files (`REQUIREMENTS.md`, `DESIGN.md`, etc.) parse as valid markdown — validator runs first.

## Path resolution

Standalone: `{path} = projects/{name}/`. Backup at `{path}/.backup-pre-{target}/`.
Workspace app: `{path} = projects/{workspace}/apps/{app}/`. Each app migrates independently. Workspace-level files migrate once.

## Modes

`/migrate`                    → live migration with confirmation.
`/migrate --dry-run`          → report planned changes; no writes.
`/migrate --target 2.0.0`     → explicit target version (default: kit current).
`/migrate --force`            → bypass pre-flight validator failures (DANGEROUS).

## Steps

### 1. Detect source version

Read `{path}/.kit-version` (or `STATE.md` frontmatter `kit_version`). If both missing → assume `1.0.0`. Determine `from` and `to`.

If `from >= to` → "Already on {from}. Nothing to do." Exit.

### 2. Pre-flight validator

Run a project-scoped validator:
- Locked files exist and parse as markdown.
- STATE.md is not corrupted (even if old schema).
- No untracked critical files in `.wip/`.

On failure: list issues, exit. User can fix manually or pass `--force` (re-asks).

### 3. Plan changes

Build a transformer plan (caveman list shown to user):

```
migrate {name} from {from} to {to}.

planned changes:
- STATE.md: add fields (kit_version, phase enum, wireframe_status, iteration_count, ...).
- PLAN.md: add per-task fields (id, size, dependencies, files_touched, status, notes); existing tasks preserved.
- REQUIREMENTS.md: add deploy_target field if missing (will prompt).
- MEMORY.md: convert verbatim content -> mempalace import + pointer file.
- sessions/*.md: bulk import to mempalace; originals preserved in backup.
- context-agent/ artefacts: imported to mempalace; folder removed.
- agents/, skills/ at project root: removed if present.
- .kit-version stamp: written.

backup: {path}/.backup-pre-{to}/
estimated time: {N} minutes
```

If `--dry-run` → print plan, exit.

### 4. User confirmation

```
Proceed with migration? (yes / no / cancel)
```

### 5. Snapshot

`{path}/.backup-pre-{to}/` — copy entire project tree (excluding existing `.backup-pre-*` dirs) before any write. Atomic: if backup fails, abort with no changes.

### 6. Run transformers (in order)

Spawn `context-manager` for MemPalace writes. Each transformer writes a one-line caveman entry to a migration log at `{path}/.migration-log.md`:

#### 6.1 STATE.md schema upgrade

Parse old `STATE.md` (any schema). Build new YAML frontmatter:

```yaml
kit_version: {to}
project: {name}
type: {standalone | workspace-app}
phase: <detect from old content; default deploy-ready if deployed, else build>
wireframe_status: <skipped if no WIREFRAMES.md, else done>
iteration_count: 0
last_session_id: null
interrupted: false
current_wave: 0
running_agents: []
parallel_concurrency: 3
last_updated: {today}
started: <preserve from old; default: today>
```

Body retained but trimmed; old phase progress table replaced by checklist per `templates/project/STATE.md`.

#### 6.2 PLAN.md schema upgrade

For each existing task in old PLAN.md:
- Generate `id` (T-001, T-002, ... in order seen).
- Set `size: M` (best guess; user can edit).
- `description` from existing task line.
- `acceptance_criteria: []` (empty, prompt user).
- `dependencies: []` (empty).
- `files_touched: []` (empty; coder will fill at task time, may slow parallel dispatch).
- `status: done` if old line had a check mark, else `pending`.
- `notes: <preserve old text if any>`.

Append a header note: "Migrated from v1.x. Empty files_touched and dependencies will reduce parallel dispatch efficiency until edited."

#### 6.3 REQUIREMENTS.md `deploy_target` field

If missing, prompt user inline:
```
REQUIREMENTS.md does not declare a deploy_target. Pick one now or skip:
1) vercel  2) cloudflare-workers  3) cloudflare-pages  4) supabase
5) expo    6) firebase            7) docker            8) other
9) skip (will prompt at /deploy time)
```

Add `deploy_target: <value>` to the requirements frontmatter. Keep file `Status: LOCKED`.

#### 6.4 MEMORY.md → MemPalace import + pointer

If MemPalace is reachable:
- `context-manager.write` operation imports old MEMORY.md verbatim content as a single entry under `proj-{name}/legacy-import/` wing.
- MEMORY.md replaced with thin pointer (per `/save` Phase 2 spec).

If MemPalace unreachable: leave MEMORY.md as-is, append a header note "Pending MemPalace import; run /migrate again when MemPalace is available."

#### 6.5 sessions/*.md import

Per session file:
- Import as `proj-{name}/sessions/legacy-{N}` MemPalace entry.
- Original file kept in backup; the live `sessions/` directory is preserved (entries serve as fallback if MemPalace dies later).

#### 6.6 context-agent/ removal

If `context-agent/` exists at project root or anywhere referenced: copy to backup, delete from live tree.

#### 6.7 Stale artefacts cleanup

- `agents/` or `skills/` at project root → backup + delete (these belong only at kit level, not project level).
- Old `ACTIVE_CONTEXT.md` (underscore) → rename to `ACTIVE-CONTEXT.md` if it exists at project root (it shouldn't; system file lives in `.state/`).

#### 6.8 Stamp `.kit-version`

Write `{to}` to `{path}/.kit-version`.

### 7. Post-flight validator

Run kit's `validate.ps1` scoped to this project:
- New STATE.md parses with kit_version `{to}`.
- PLAN.md tasks all have required fields.
- No deprecated paths remain.

On failure: surface errors, offer `/rollback`.

### 8. Confirm

```
Migrated {name}: {from} → {to}.
Backup: {path}/.backup-pre-{to}/
Log: {path}/.migration-log.md

Notes:
- {N} PLAN tasks need files_touched + dependencies for parallel dispatch (run /next or edit manually).
- {N} sessions imported to mempalace.
- deploy_target: {value or "skipped"}.

Run /status to see post-migration state.
Run /rollback to revert.
```

### 9. SESSION-LOG.md (caveman)

```
{ISO timestamp} migrate {name} {from} -> {to}. backup .backup-pre-{to}/. {N} sessions imported.
```

## Failure modes

- Backup fails (disk full, permission) → abort with no changes.
- Transformer fails mid-flight → backup intact; partial state preserved at `.wip/migrate/`. Surface error.
- Post-flight validator fails → ask user: continue with degraded migration (manual fixes), or rollback.
- MemPalace fully unavailable → run filesystem-only migration; log MemPalace-pending status; user can re-run after MemPalace install.

## Anti-Patterns (Forbidden)

- Migrate without backup.
- Modify locked file content (only frontmatter `kit_version` stamp is allowed).
- Auto-pick `deploy_target` (must be user choice).
- Run on a project whose locked files don't parse (use `--force` only with explicit user OK).
- Skip the post-flight validator.

## Next

- Successful → `/status` to inspect, `/build` or whatever phase the migrated state lands in.
- Failed / unhappy → `/rollback`.
