---
command: /rollback
description: Restores the active project from the latest pre-migration backup. Also discards a /build WIP if requested.
phase: any
agents: []
skills: []
flags: [--migrate, --wip <task-id>, --list]
outputs: [Project restored from backup, or WIP discarded]
---

# /rollback

Reverse a migration or discard a WIP task. The kit creates backups at `{path}/.backup-pre-<version>/` (migrations) and `{path}/.wip/<task-id>/` (in-progress builds).

## Modes

`/rollback`                       → equivalent to `/rollback --migrate` (default).
`/rollback --migrate`             → restore project from latest `.backup-pre-*/`.
`/rollback --wip <task-id>`       → delete the named WIP directory (single-task rollback after `/build` interrupt).
`/rollback --list`                → list all available rollback points; do nothing else.

## Path resolution

Standalone: `{path} = projects/{name}/`.
Workspace app: `{path} = projects/{workspace}/apps/{app}/`. Per-app rollback only.

## Steps — `--migrate` mode

### 1. List backups

`{path}/.backup-pre-*/` directories sorted by name (newest version last). Pick the most recent unless user specifies otherwise.

### 2. Confirm

```
Rollback {name} to pre-migration state?
Backup: .backup-pre-{version}/
Created: {timestamp}
Current state will be moved to {path}/.rollback-discarded-{timestamp}/ (recoverable).
Proceed? (yes / no)
```

### 3. Execute

- Move current live tree (excluding `.backup-pre-*` and `.rollback-discarded-*` dirs) to `.rollback-discarded-<timestamp>/`.
- Copy `.backup-pre-{version}/` contents to live tree.
- Restore `.kit-version` to the pre-migration value.
- Append to SESSION-LOG.md (caveman):
  ```
  {ISO timestamp} rollback {name} -> pre-{version}. discarded snapshot at .rollback-discarded-{timestamp}/.
  ```

### 4. Confirm (normal English)

```
Rolled back to {pre-version}.
Discarded current state (recoverable): .rollback-discarded-{timestamp}/
Run /status to verify.
```

## Steps — `--wip <task-id>` mode

### 1. Locate WIP

`{path}/.wip/{task-id}/`. If missing → "No WIP for task {task-id}." Exit.

### 2. Confirm

```
Delete WIP for task {task-id}?
Files in WIP: {list}
This is permanent for the WIP. The PLAN.md task will be marked back to status: pending.
Proceed? (yes / no)
```

### 3. Execute

- Remove `{path}/.wip/{task-id}/`.
- Update PLAN.md task `status: pending`, `notes: wip discarded {timestamp}.`
- Append SESSION-LOG.md (caveman):
  ```
  {ISO timestamp} rollback wip {task-id}. plan task reset to pending.
  ```

### 4. Confirm

```
WIP for {task-id} discarded.
PLAN.md task reset to pending.
```

## Steps — `--list` mode

List all rollback points, no action:
```
Available rollback points for {name}:

Migration backups:
- .backup-pre-2.0.0/   created 2026-04-29 14:32
- .backup-pre-1.5.0/   created 2026-03-12 09:11

Discarded snapshots (still recoverable):
- .rollback-discarded-2026-04-29-15-08/

WIP tasks:
- .wip/T-014/    started 2026-04-29 11:20
- .wip/T-022/    started 2026-04-29 13:45

Run /rollback --migrate or /rollback --wip <id> to act.
```

## Anti-Patterns (Forbidden)

- Delete `.backup-pre-*` directories without explicit user request.
- Rollback when no backup exists (must show "no rollback point" instead of attempting).
- Skip the discarded-snapshot move (data loss risk).
- Modify locked files during rollback (the backup contains them; restore as-is).
- Run `--migrate` rollback while a `/build`, `/test`, or `/deploy` is mid-flight.

## Failure modes

- Disk full during snapshot move → abort, no changes.
- Backup directory corrupted → list issues, refuse rollback, suggest manual recovery.

## Next

- Successful migrate-rollback → `/status` shows pre-migration state. User can `/migrate` again later.
- Successful WIP discard → `/build` (or `/next`) to resume work cleanly.
