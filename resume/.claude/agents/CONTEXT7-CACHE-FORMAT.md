# Context7 Cache Format

`requirements-expert` writes a per-library cache during `/requirements` lock. `coder` reads it at task time instead of querying Context7 fresh per task. Saves ~20–40k tokens per `/build` session.

## Location

`{path}/.context7-cache/<lib>@<version>/`

Where `<lib>` is the npm / pip package id (e.g. `next`, `@supabase/supabase-js`, `tailwindcss`) and `<version>` is the locked semver from REQUIREMENTS.md.

For scoped packages, replace `/` with `__` in the directory name to keep paths clean: `@supabase/supabase-js@2.45.4` → `@supabase__supabase-js@2.45.4/`.

## Files per library

```
.context7-cache/<lib>@<ver>/
  api-summary.md       # required
  breaking-changes.md  # required if major-version bump from prior cache
  patterns.md          # optional; idiomatic usage examples
  meta.yaml            # required; cache provenance
```

### `api-summary.md`

A condensed reference of the API surface most relevant to the project, written in normal English (coder reads it for clarity, not for compression). Sections:

```markdown
# {lib} {ver} — API summary

## Imports
```ts
import { foo, bar } from '{lib}'
```

## Common patterns
- {function or hook}: signature + 1-line purpose
- {class}: constructor + 1-line purpose

## Gotchas
- {non-obvious behaviour with a one-line rationale}

## Links
- Docs: {url}
- Migration: {url if applicable}
```

### `breaking-changes.md`

Only present when this version is a major bump from a previously cached version (or when Context7 surfaced breaking notes). Format:

```markdown
# {lib} {prev-ver} → {ver}

## Breaking
- {change}: {how to migrate}

## Deprecations
- {api}: removed in {ver}, use {alternative}
```

### `patterns.md` (optional)

Idiomatic usage patterns specific to this stack. Coder consults this for "how do real apps use it?". Skip if Context7 returned no useful examples.

### `meta.yaml`

```yaml
lib: <name>
version: <semver>
cached_at: <ISO date>
cached_by: requirements-expert
context7_status: ok | degraded
source: context7-mcp | manual | fallback
freshness_check: <YYYY-MM-DD when last verified>
ttl_days: 30
```

## Freshness

Cache entry is **fresh** if `(today - cached_at).days < ttl_days`. Default TTL: 30 days.

Coder behaviour at task time:
1. Look up `{lib}@{ver}` cache directory.
2. If missing → query Context7 if available (then write new cache); else operate without (degraded, log).
3. If present and fresh → use it.
4. If present but stale → use it but spawn `context-manager` to refresh in the background (does not block coder).

`/polish` may invalidate cache: when REQUIREMENTS.md is unlocked and a library version bumped, the old cache directory is **deleted**, a new one is generated.

## What goes in `coder` Task() prompt

Just paths, not content:

```
context7 cache:
  - .context7-cache/next@15.0.3/api-summary.md
  - .context7-cache/next@15.0.3/breaking-changes.md
  - .context7-cache/@supabase__supabase-js@2.45.4/api-summary.md
```

Coder reads only what it needs (typically just `api-summary.md` for the libs the current task touches).

## Anti-Patterns

- Cache entire Context7 responses verbatim (defeats the purpose; cache is curated).
- Skip `meta.yaml` (validator and freshness logic depend on it).
- Cache code (the library source) — only API summaries.
- Per-task caching by `coder` (only `requirements-expert` writes cache; coder reads).
