"""
ATESCHH KIT — Project migration v1.x -> v2.0.

Used by /migrate. Do not run directly unless you know what you're doing.

Usage:
    python scripts/migrate.py <project-path> [--target 2.0.0] [--dry-run] [--force]

Exit codes:
    0  ok
    1  precondition fail (validator)
    2  backup fail
    3  transformer fail
    4  postcondition fail
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Iterable

CURRENT_KIT_VERSION = "2.0.0"


@dataclass
class MigrationContext:
    project_path: Path
    from_version: str
    to_version: str
    dry_run: bool = False
    force: bool = False
    log_lines: list[str] = field(default_factory=list)

    @property
    def backup_dir(self) -> Path:
        return self.project_path / f".backup-pre-{self.to_version}"

    @property
    def kit_version_file(self) -> Path:
        return self.project_path / ".kit-version"

    def log(self, line: str) -> None:
        ts = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        entry = f"{ts} {line}"
        self.log_lines.append(entry)
        if not self.dry_run:
            with (self.project_path / ".migration-log.md").open("a", encoding="utf-8") as fh:
                fh.write(entry + "\n")


def detect_from_version(project: Path) -> str:
    stamp = project / ".kit-version"
    if stamp.exists():
        return stamp.read_text(encoding="utf-8").strip() or "1.0.0"

    state = project / "STATE.md"
    if state.exists():
        m = re.search(r"^kit_version:\s*(\S+)", state.read_text(encoding="utf-8"), re.MULTILINE)
        if m:
            return m.group(1)
    return "1.0.0"


def preflight(project: Path, force: bool) -> list[str]:
    issues: list[str] = []
    must_exist = ["STATE.md"]
    for f in must_exist:
        if not (project / f).exists():
            issues.append(f"missing required file: {f}")

    locked = ["REQUIREMENTS.md", "DESIGN.md"]
    for f in locked:
        p = project / f
        if p.exists() and p.stat().st_size == 0:
            issues.append(f"locked file empty: {f}")

    return issues if not force else []


def take_backup(ctx: MigrationContext) -> None:
    if ctx.backup_dir.exists():
        raise FileExistsError(f"backup already exists: {ctx.backup_dir}")

    if ctx.dry_run:
        ctx.log(f"would backup -> {ctx.backup_dir}")
        return

    def ignore(_dir: str, names: list[str]) -> list[str]:
        return [n for n in names if n.startswith(".backup-pre-") or n.startswith(".rollback-discarded-")]

    shutil.copytree(ctx.project_path, ctx.backup_dir, ignore=ignore, dirs_exist_ok=False)
    ctx.log(f"backup ok -> {ctx.backup_dir}")


def transform_state_md(ctx: MigrationContext) -> None:
    state_path = ctx.project_path / "STATE.md"
    if not state_path.exists():
        ctx.log("STATE.md missing; created from template defaults")
        if not ctx.dry_run:
            state_path.write_text(_default_state_body(ctx), encoding="utf-8")
        return

    text = state_path.read_text(encoding="utf-8")
    has_frontmatter = text.startswith("---\n")

    detected_phase = _detect_phase_from_old_state(text)
    detected_wireframe = "done" if (ctx.project_path / "WIREFRAMES.md").exists() else "skipped"

    new_frontmatter = _build_frontmatter(ctx, detected_phase, detected_wireframe)

    if has_frontmatter:
        end = text.find("\n---\n", 4)
        body = text[end + 5 :] if end != -1 else text
    else:
        body = text

    new_text = new_frontmatter + "\n" + body
    if ctx.dry_run:
        ctx.log(f"would rewrite STATE.md (phase={detected_phase}, wireframe_status={detected_wireframe})")
    else:
        state_path.write_text(new_text, encoding="utf-8")
        ctx.log(f"STATE.md upgraded (phase={detected_phase}, wireframe_status={detected_wireframe})")


def transform_plan_md(ctx: MigrationContext) -> None:
    plan_path = ctx.project_path / "PLAN.md"
    if not plan_path.exists():
        ctx.log("PLAN.md missing; skipped")
        return

    text = plan_path.read_text(encoding="utf-8")
    if "files_touched:" in text:
        ctx.log("PLAN.md already in v2 schema; skipped")
        return

    tasks = _extract_v1_tasks(text)
    if not tasks:
        ctx.log("PLAN.md has no parseable tasks; manual review needed")
        return

    new_text = _render_v2_plan(tasks, ctx)
    if ctx.dry_run:
        ctx.log(f"would rewrite PLAN.md ({len(tasks)} tasks migrated)")
    else:
        plan_path.write_text(new_text, encoding="utf-8")
        ctx.log(f"PLAN.md upgraded ({len(tasks)} tasks migrated; files_touched/dependencies left empty)")


def transform_memory_md(ctx: MigrationContext) -> None:
    mem_path = ctx.project_path / "MEMORY.md"
    if not mem_path.exists():
        return

    text = mem_path.read_text(encoding="utf-8")
    if text.strip().startswith("# Project Memory") and "Latest session:" in text:
        ctx.log("MEMORY.md already pointer-style; skipped")
        return

    pointer = _build_memory_pointer(ctx, text)
    if ctx.dry_run:
        ctx.log(f"would convert MEMORY.md to pointer ({len(text)} chars archived)")
    else:
        archive = ctx.project_path / "sessions" / f"legacy-memory-{ctx.to_version}.md"
        archive.parent.mkdir(parents=True, exist_ok=True)
        archive.write_text(text, encoding="utf-8")
        mem_path.write_text(pointer, encoding="utf-8")
        ctx.log(f"MEMORY.md converted to pointer; original archived at {archive.relative_to(ctx.project_path)}")


def cleanup_stale_artifacts(ctx: MigrationContext) -> None:
    for stale in ["agents", "skills", "context-agent"]:
        path = ctx.project_path / stale
        if path.exists():
            if ctx.dry_run:
                ctx.log(f"would remove stale dir: {stale}/")
            else:
                shutil.rmtree(path)
                ctx.log(f"removed stale dir: {stale}/")

    legacy = ctx.project_path / "ACTIVE_CONTEXT.md"
    if legacy.exists():
        new = ctx.project_path / "ACTIVE-CONTEXT.md"
        if ctx.dry_run:
            ctx.log("would rename ACTIVE_CONTEXT.md -> ACTIVE-CONTEXT.md")
        else:
            legacy.rename(new)
            ctx.log("renamed ACTIVE_CONTEXT.md -> ACTIVE-CONTEXT.md")


def stamp_version(ctx: MigrationContext) -> None:
    if ctx.dry_run:
        ctx.log(f"would stamp .kit-version = {ctx.to_version}")
    else:
        ctx.kit_version_file.write_text(ctx.to_version + "\n", encoding="utf-8")
        ctx.log(f".kit-version stamped {ctx.to_version}")


def postflight(ctx: MigrationContext) -> list[str]:
    issues: list[str] = []
    state = ctx.project_path / "STATE.md"
    if not state.exists():
        issues.append("STATE.md missing post-migration")
    else:
        text = state.read_text(encoding="utf-8")
        if f"kit_version: {ctx.to_version}" not in text:
            issues.append(f"STATE.md kit_version mismatch (expected {ctx.to_version})")

    if not ctx.kit_version_file.exists():
        issues.append(".kit-version stamp missing")
    return issues


def _detect_phase_from_old_state(text: str) -> str:
    lower = text.lower()
    if "deployed" in lower or "live url" in lower:
        return "deployed"
    if "phase 6" in lower or "phase: 6" in lower:
        return "deploy-ready"
    if "phase 5" in lower or "phase: 5" in lower:
        return "test"
    if "phase 4" in lower or "phase: 4" in lower:
        return "build"
    if "phase 3" in lower or "phase: 3" in lower:
        return "design"
    if "phase 2" in lower or "phase: 2" in lower:
        return "requirements"
    return "brainstorm"


def _build_frontmatter(ctx: MigrationContext, phase: str, wireframe: str) -> str:
    name = ctx.project_path.name
    today = datetime.now().strftime("%Y-%m-%d")
    return (
        "---\n"
        f"kit_version: {ctx.to_version}\n"
        f"project: {name}\n"
        "type: standalone\n"
        f"phase: {phase}\n"
        f"wireframe_status: {wireframe}\n"
        "iteration_count: 0\n"
        "last_session_id: null\n"
        "interrupted: false\n"
        "current_wave: 0\n"
        "running_agents: []\n"
        "parallel_concurrency: 3\n"
        f"last_updated: {today}\n"
        f"started: {today}\n"
        "---\n"
    )


def _default_state_body(ctx: MigrationContext) -> str:
    return _build_frontmatter(ctx, "brainstorm", "pending") + "\n# Project State — " + ctx.project_path.name + "\n"


def _extract_v1_tasks(text: str) -> list[tuple[str, bool]]:
    tasks: list[tuple[str, bool]] = []
    for line in text.splitlines():
        m = re.match(r"^\s*-\s*\[(x| )\]\s*(.+)$", line)
        if m:
            tasks.append((m.group(2).strip(), m.group(1) == "x"))
    return tasks


def _render_v2_plan(tasks: list[tuple[str, bool]], ctx: MigrationContext) -> str:
    today = datetime.now().strftime("%Y-%m-%d")
    lines = [
        "---",
        f"project: {ctx.project_path.name}",
        f"generated_by: migrate.py ({ctx.from_version} -> {ctx.to_version})",
        f"generated_on: {today}",
        f"total_tasks: {len(tasks)}",
        "---",
        "",
        f"# Build Plan — {ctx.project_path.name}",
        "",
        "Migrated from v1.x. `files_touched` and `dependencies` are empty; fill in via /edit or",
        "let /build infer (parallel dispatch is degraded until populated).",
        "",
        "## Tasks",
        "",
    ]
    for i, (desc, done) in enumerate(tasks, 1):
        status = "done" if done else "pending"
        lines.extend(
            [
                f"```yaml",
                f"- id: T-{i:03d}",
                f"  size: M",
                f"  description: {desc}",
                f"  acceptance_criteria: []",
                f"  dependencies: []",
                f"  files_touched: []",
                f"  status: {status}",
                f"  notes: migrated from v1.x",
                f"```",
                "",
            ]
        )
    return "\n".join(lines)


def _build_memory_pointer(ctx: MigrationContext, original: str) -> str:
    today = datetime.now().strftime("%Y-%m-%d")
    return (
        f"# Project Memory — {ctx.project_path.name}\n"
        "\n"
        "Latest session: pending (run /save to populate)\n"
        f"Project wing: proj-{ctx.project_path.name}\n"
        f"Last updated: {today}\n"
        "\n"
        "Original v1.x content archived under `sessions/legacy-memory-*.md`.\n"
        "Run /resume to restore context. MemPalace import will run on first /save\n"
        "if MemPalace becomes available.\n"
    )


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Migrate an ATESCHH KIT project to v2.0.")
    parser.add_argument("project", help="Path to the project directory")
    parser.add_argument("--target", default=CURRENT_KIT_VERSION, help="Target kit version")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args(list(argv) if argv is not None else None)

    project = Path(args.project).resolve()
    if not project.is_dir():
        print(f"[migrate] project not found: {project}", file=sys.stderr)
        return 1

    from_v = detect_from_version(project)
    if from_v == args.target:
        print(f"[migrate] {project.name} already on {args.target}; nothing to do.")
        return 0

    issues = preflight(project, force=args.force)
    if issues:
        print("[migrate] preflight failures:")
        for i in issues:
            print(f"  - {i}")
        return 1

    ctx = MigrationContext(project, from_v, args.target, dry_run=args.dry_run, force=args.force)
    ctx.log(f"migrate start {project.name} {from_v} -> {args.target}")

    try:
        take_backup(ctx)
    except Exception as exc:
        print(f"[migrate] backup failed: {exc}", file=sys.stderr)
        return 2

    try:
        transform_state_md(ctx)
        transform_plan_md(ctx)
        transform_memory_md(ctx)
        cleanup_stale_artifacts(ctx)
        stamp_version(ctx)
    except Exception as exc:
        print(f"[migrate] transformer failed: {exc}", file=sys.stderr)
        return 3

    issues = [] if ctx.dry_run else postflight(ctx)
    if issues:
        print("[migrate] postflight failures:")
        for i in issues:
            print(f"  - {i}")
        return 4

    ctx.log(f"migrate ok {project.name} -> {args.target}")
    print(json.dumps(
        {
            "project": project.name,
            "from": from_v,
            "to": args.target,
            "backup": str(ctx.backup_dir.relative_to(project)),
            "dry_run": args.dry_run,
            "log_lines": ctx.log_lines,
        },
        indent=2,
    ))
    return 0


if __name__ == "__main__":
    sys.exit(main())
