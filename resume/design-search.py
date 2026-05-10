"""
ATESCHH KIT — Design Engine Wrapper

Cross-platform entry point for the bundled design engine. Resolves the right
Python interpreter context and delegates to design-engine/scripts/search.py.

Usage (from project root):
    python design-search.py "<query>" --design-system [-p "Project Name"]
    python design-search.py "<query>" --domain <domain>
    python design-search.py "<query>" --stack <stack>

Domains: style, color, typography, ux, product, landing, chart
Stacks:  react, nextjs, vue, svelte, react-native, flutter, swiftui, shadcn, ...

Run with `python` (not `python3`) on Windows. The kit's documentation always
uses `python` for portability — Windows installers register `python` and `py`,
not `python3`. On macOS/Linux, both `python` and `python3` work as long as a
Python 3 binary is on PATH.
"""

import os
import sys


def _abort(message: str, exit_code: int = 1) -> None:
    """Print a clear error to stderr and exit."""
    sys.stderr.write(f"[design-search] error: {message}\n")
    sys.exit(exit_code)


def _ensure_python3() -> None:
    """Refuse to run under Python 2 — the design engine requires Python 3.8+."""
    if sys.version_info < (3, 8):
        _abort(
            f"requires Python 3.8 or later (current: {sys.version.split()[0]}). "
            "Install Python 3 and re-run."
        )


def _engine_path() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(here, "design-engine", "scripts")


def _engine_entry() -> str:
    return os.path.join(_engine_path(), "search.py")


def main() -> None:
    _ensure_python3()

    engine = _engine_entry()
    if not os.path.isfile(engine):
        _abort(
            f"design engine not found at {engine}. "
            "Reinstall the kit or run `npx ateschh-kit@latest --update`."
        )

    sys.path.insert(0, _engine_path())
    sys.argv[0] = "design-search.py"

    try:
        with open(engine, encoding="utf-8") as fh:
            source = fh.read()
        # Run the search script in-process so argparse / persist paths work
        # against the user's current working directory.
        exec(compile(source, engine, "exec"), {"__name__": "__main__"})
    except SystemExit:
        raise
    except Exception as exc:  # noqa: BLE001 - surface every failure clearly
        _abort(f"design engine crashed: {exc.__class__.__name__}: {exc}", exit_code=2)


if __name__ == "__main__":
    main()
