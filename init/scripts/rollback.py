"""
ATESCHH KIT — Project rollback.

Restores a project from the latest pre-migration backup, or discards a single
/build WIP directory.

Usage:
    python scripts/rollback.py <project-path> [--migrate | --wip <task-id> | --list]

Exit codes:
    0  ok
    1  precondition fail
    2  rollback fail
"""

from __future__ import annotations

import argparse
import shutil
import sys
from datetime import datetime
from pathlib import Path


def list_rollback_points(project: Path) -> dict[str, list[str]]:
    return {
        "migration_backups": sorted(p.name for p in project.glob(".backup-pre-*") if p.is_dir()),
        "discarded_snapshots": sorted(p.name for p in project.glob(".rollback-discarded-*") if p.is_dir()),
        "wip": sorted(p.name for p in (project / ".wip").glob("*") if p.is_dir()) if (project / ".wip").exists() else [],
    }


def rollback_migrate(project: Path) -> int:
    backups = sorted(project.glob(".backup-pre-*"), key=lambda p: p.name)
    if not backups:
        print("[rollback] no migration backups found")
        return 1

    latest = backups[-1]
    timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    discarded = project / f".rollback-discarded-{timestamp}"
    discarded.mkdir()

    for child in project.iterdir():
        if child.name.startswith(".backup-pre-") or child.name.startswith(".rollback-discarded-"):
            continue
        shutil.move(str(child), str(discarded / child.name))

    for child in latest.iterdir():
        shutil.copy2(child, project / child.name) if child.is_file() else shutil.copytree(child, project / child.name)

    print(f"[rollback] restored from {latest.name}; discarded current state at {discarded.name}")
    return 0


def rollback_wip(project: Path, task_id: str) -> int:
    wip_dir = project / ".wip" / task_id
    if not wip_dir.is_dir():
        print(f"[rollback] no wip for task {task_id}")
        return 1

    shutil.rmtree(wip_dir)
    print(f"[rollback] wip {task_id} discarded")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Rollback an ATESCHH KIT project.")
    parser.add_argument("project", help="Path to the project directory")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--migrate", action="store_true", help="Restore from latest .backup-pre-*/")
    group.add_argument("--wip", metavar="TASK_ID", help="Discard a single /build WIP")
    group.add_argument("--list", action="store_true", help="List rollback points; do nothing")
    args = parser.parse_args(argv)

    project = Path(args.project).resolve()
    if not project.is_dir():
        print(f"[rollback] project not found: {project}", file=sys.stderr)
        return 1

    if args.list:
        points = list_rollback_points(project)
        for category, items in points.items():
            print(f"{category}:")
            for item in items or ["(none)"]:
                print(f"  - {item}")
        return 0

    if args.wip:
        return rollback_wip(project, args.wip)

    return rollback_migrate(project)


if __name__ == "__main__":
    sys.exit(main())
