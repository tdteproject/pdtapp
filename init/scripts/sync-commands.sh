#!/usr/bin/env bash
# sync-commands.sh
# Mirrors .claude/commands/ to .agent/workflows/ and .opencode/commands/.
# .claude/commands/ is the single source of truth.

set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
src="$root/.claude/commands"

if [ ! -d "$src" ]; then
  echo "source not found: $src" >&2
  exit 1
fi

for target in "$root/.agent/workflows" "$root/.opencode/commands"; do
  rm -rf "$target"
  mkdir -p "$target"
  cp -R "$src"/* "$target"/
  count=$(find "$target" -type f -name "*.md" | wc -l)
  echo "synced -> $target ($count files)"
done

echo "command tree synchronised."
