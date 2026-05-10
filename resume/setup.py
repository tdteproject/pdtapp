#!/usr/bin/env python3
"""
setup.py — ateschh-kit Initial Setup

Run once:
    python setup.py

What it does:
  1. Creates required directories (.state/, projects/, archive/)
  2. Initializes empty state files
  3. Locates and verifies Claude Code memory path
  4. Shows setup summary
"""

import os
import re
import sys
import shutil
from pathlib import Path
from datetime import date


# ── Root dir: the directory containing this file ─────────────────────────────
ROOT = Path(__file__).resolve().parent
TODAY = date.today().strftime("%Y-%m-%d")


# ── 1. Create directory structure ─────────────────────────────────────────────

DIRS = [
    ROOT / ".state",
    ROOT / "projects",
    ROOT / "archive",
    ROOT / "context-agent" / "scripts",
]

def create_dirs():
    for d in DIRS:
        d.mkdir(parents=True, exist_ok=True)
    print("✓ Directories created")


# ── 2. Initialize state files ─────────────────────────────────────────────────

STATE_FILES = {
    ROOT / ".state" / "ACTIVE-PROJECT.md": f"""# Active Project

(No active project yet)

Last updated: {TODAY}
""",
    ROOT / ".state" / "SESSION-LOG.md": f"""# Session Log

<!-- Updated automatically on /save -->

## {TODAY} — Setup
- ateschh-kit installed
""",
    ROOT / ".state" / "ACTIVE_CONTEXT.md": f"""# Active Context

<!-- Auto-updated by /save -->

No active project. Run `/new-project` to get started.
""",
}

def create_state_files():
    for path, content in STATE_FILES.items():
        if not path.exists():
            path.write_text(content, encoding="utf-8")
    print("✓ State files initialized")


# ── 3. Find memory path ───────────────────────────────────────────────────────

def find_claude_config_dir() -> Path:
    override = os.environ.get("CLAUDE_CONFIG_DIR")
    if override:
        return Path(override)

    home = Path.home()
    appdata = os.environ.get("APPDATA")

    # Windows: %APPDATA%\Claude or ~/.claude
    if appdata:
        candidate = Path(appdata) / "Claude"
        if candidate.exists():
            return candidate

    # macOS / Linux
    return home / ".claude"


def find_memory_path() -> Path:
    claude_config = find_claude_config_dir()
    raw = str(ROOT)
    sanitized = re.sub(r"[/\\]", "-", raw).lstrip("-")
    return claude_config / "projects" / sanitized / "memory"


def setup_memory():
    memory_dir = find_memory_path()
    memory_dir.mkdir(parents=True, exist_ok=True)

    memory_md = memory_dir / "MEMORY.md"
    if not memory_md.exists():
        memory_md.write_text(
            "<!-- ateschh-kit auto-memory index -->\n"
            "<!-- Updated automatically on /save -->\n\n"
            f"- [Active Context](active_context.md) — Current project state and last session\n",
            encoding="utf-8",
        )

    print(f"✓ Memory directory: {memory_dir}")
    return memory_dir


# ── 4. Python version check ───────────────────────────────────────────────────

def check_python():
    major, minor = sys.version_info[:2]
    if major < 3 or (major == 3 and minor < 8):
        print(f"✗ Python 3.8+ required (current: {major}.{minor})")
        sys.exit(1)
    print(f"✓ Python {major}.{minor}")


# ── 5. Summary ────────────────────────────────────────────────────────────────

def print_summary(memory_dir: Path):
    print(f"""
╔══════════════════════════════════════════════════════╗
║  ateschh-kit setup complete!                         ║
╚══════════════════════════════════════════════════════╝

📁 Install directory : {ROOT}
🧠 Memory directory  : {memory_dir}

Getting started:
  1. Open this directory in Claude Code or Antigravity
  2. New project: /new-project
  3. Resume existing: /resume

""")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f"\nateschh-kit setup starting...\n")

    check_python()
    create_dirs()
    create_state_files()
    memory_dir = setup_memory()
    print_summary(memory_dir)


if __name__ == "__main__":
    main()
