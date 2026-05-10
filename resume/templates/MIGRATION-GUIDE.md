# Migration Guide — v1.x → v2.0

This guide explains how to upgrade an existing ateschh-kit project from v1.x to v2.0.

## Why migrate

v2.0 changes the project layout in ways v1.x commands cannot understand. The new commands (`/build --all`, `/polish`, `/migrate`, polished `/save`/`/resume`) all rely on:

- A YAML frontmatter on `STATE.md` with a `phase` enum and a `kit_version` stamp.
- A new task schema in `PLAN.md` (`id`, `size`, `dependencies`, `files_touched`, `acceptance_criteria`, `status`, `notes`).
- A pointer-style `MEMORY.md` backed by the MemPalace memory wing.
- A `.context7-cache/` directory seeded by `requirements-expert`.

Without migrating, a v1.x project keeps working in **degraded mode**: phase-aware commands fall back to legacy heuristics, parallel `/build --all` operates as a serial loop, and `/resume` has to read raw session files instead of MemPalace summaries.

## When to migrate

Migrate when you want any of the following:

- Token-cheap `/save` ↔ `/resume` round-trip (target: ≤ 8% context).
- Parallel `/build --all` waves.
- The `/polish` iteration loop.
- Graphify-backed `/map-codebase` and code recall during `/build`.
- The new spawn matrix (real `Task()` delegation per `Rule 11`).

Don't migrate if the project is already deployed and you only need to keep the lights on. v1.x commands continue to work in degraded mode forever.

## Before you start

1. Commit any uncommitted work in the project. Migration takes a backup, but committed history is the safest restore path.
2. Run `npx ateschh-kit@latest --update` to refresh kit system files (this does not touch project data).
3. Optionally run `npx ateschh-kit doctor` to confirm Graphify and MemPalace are installed (migration works without them; the import step will be deferred).

## Running the migration

Inside an active v1.x project:

```
/migrate
```

What happens:

1. **Pre-flight validation**: locked files exist, STATE.md is parseable.
2. **Backup**: full project tree copied to `{path}/.backup-pre-2.0.0/`.
3. **Transformers run in order**:
   - `STATE.md` rewritten with the v2.0 frontmatter; phase auto-detected from old content; `wireframe_status` set to `done` (if WIREFRAMES.md exists) or `skipped`.
   - `PLAN.md` rewritten with the new task schema. Existing tasks preserved by id (`T-001`, `T-002`, …); `files_touched` and `dependencies` left empty (you can fill them in later for better parallel dispatch).
   - `MEMORY.md` archived as `sessions/legacy-memory-2.0.0.md`; the live `MEMORY.md` becomes a thin pointer.
   - `agents/`, `skills/`, and `context-agent/` directories at project level are removed (they belong only at kit level).
   - `.kit-version` stamped with `2.0.0`.
4. **Post-flight validation**: new schema parses, kit_version stamp present.
5. **Summary** printed; migration log written to `.migration-log.md`.

A dry run is available:

```
/migrate --dry-run
```

This reports the planned changes without touching anything.

## After migration

Inspect the result with `/status`. Common follow-ups:

- **Fill in `deploy_target`** in `REQUIREMENTS.md` if the migration prompt was skipped.
- **Edit `PLAN.md`** to populate `files_touched` and `dependencies` on remaining tasks. Without these fields, `/build --all` runs serially.
- **Run `/save`** when you're ready — this seeds MemPalace with the first v2.0 session summary.

## Rolling back

If anything looks wrong:

```
/rollback
```

This moves the live tree to `.rollback-discarded-{timestamp}/` (recoverable) and restores `.backup-pre-2.0.0/`. Re-run `/migrate` later if you want to try again.

To list every available rollback point:

```
/rollback --list
```

## Known limitations

- **`files_touched` and `dependencies` migration is best-effort empty.** v1.x PLAN.md did not carry this metadata; `/build --all` parallel dispatch is degraded until you fill these fields. Consider populating the highest-priority tasks first.
- **MemPalace import is deferred when MemPalace is unreachable.** The migration completes, but `MEMORY.md` retains its legacy content with a pending-import note. Re-run `/migrate` once MemPalace is up; only the MEMORY.md transformer re-runs.
- **Workspace mode**: each app under a workspace migrates independently. Run `/migrate` once per app while it's active (`/app <name>` to switch). Workspace-level files (`WORKSPACE.md`, `DESIGN-SYSTEM.md`) get a one-time `kit_version` stamp on the first per-app migration.
- **Locked files are never modified beyond the `kit_version` stamp.** If you need to change `REQUIREMENTS.md` or `DESIGN.md` content as part of an upgrade, do so via `/polish` after migration.

## Troubleshooting

**"preflight failures: locked file empty"** — A locked file is corrupt or empty. Fix manually (or restore from git), then re-run `/migrate`.

**"backup already exists"** — A previous migration attempt left `.backup-pre-2.0.0/`. Either delete it (after confirming it's not needed) or move it aside, then re-run.

**"postflight failures: STATE.md kit_version mismatch"** — Rare; usually means something edited STATE.md mid-migration. Run `/rollback` and try again with no concurrent processes touching the project.

**MemPalace unavailable warning** — Expected if you haven't installed MemPalace. Migration succeeds; MemPalace import is deferred until first `/save` after MemPalace becomes available.
