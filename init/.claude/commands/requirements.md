---
command: /requirements
description: Selects and locks the tech stack via requirements-expert. Verifies versions through Context7 and seeds the per-library cache.
phase: requirements
agents: [requirements-expert]
skills: [requirements-lock]
---

# /requirements

## Preconditions

- `STATE.phase` is `requirements`.
- `IDEA-ANALYSIS.md` and `MARKET-RESEARCH.md` exist (from `/brainstorm`).

## Path resolution

Standalone: `{path} = projects/{name}/`
Workspace app: `{path} = projects/{workspace-name}/apps/{app}/`

## Steps

### 1. Context7 detection

Attempt a Context7 health call.
- **Available** → continue normally, version verification on.
- **Unavailable** → warn the user, offer two options:
  - **Install**: print install snippet (`npx -y @upstash/context7-mcp` or MCP config), exit and wait for restart.
  - **Degraded mode**: continue without verification. `requirements-expert` will lock with `context7_status: degraded`. User must accept this explicitly.

### 2. Targeted questions

Ask 3–5 stack-shaping questions in one message: preferred framework/language, deployment target, expected scale, existing infrastructure, team experience, hard constraints (budget, compliance, offline). Wait.

### 3. Spawn requirements-expert

Single `Task(subagent_type: "requirements-expert", ...)` call. Caveman task body:

```
select stack. user idea + answers below. propose stack. verify each major lib via context7 (or degraded mode if flagged). lock REQUIREMENTS.md. seed .context7-cache/ per major lib.

idea: {one-line}
answers: {Q&A}
context7_status: ok | degraded
path: {path}
```

Output contract: `OUTPUT-SCHEMA.md`. Custom fields include `deploy_target`, `cache_seeded`, `major_libs_cached`.

### 4. Parse return

If `status: failed` → surface and stop, no lock.
If `status: ok`:
- Confirm `artifacts: [REQUIREMENTS.md]` present.
- Confirm `deploy_target` set (not null).
- Confirm `cache_seeded: yes` if `context7_status: ok`. If `degraded`, cache is empty — log warning.

### 5. Wrap up

- Append decision to `{path}/DECISIONS.md` (normal English, not caveman):
  ```
  ## {date} — Tech Stack Locked
  - Selected: {framework}, {db}, {ui}
  - Verified via: Context7 on {date}, or degraded mode
  - Reason: {brief}
  ```
- Update `{path}/STATE.md`: `phase: design`.
- `context-manager.write.session-summary`:
  ```
  requirements done. stack locked. deploy {target}. cache {yes|no}. next /design.
  ```
- Append SESSION-LOG.md (caveman).

### 6. Confirm

Reply normal English: "Stack locked. Run `/design` next, or `/next` for auto-pilot."

## Failure modes

- `requirements-expert` returns `failed` → preserve any partial proposal as draft in `{path}/.wip/requirements/`, do not overwrite REQUIREMENTS.md.
- Context7 dies mid-task → `requirements-expert` flags `context7_status: degraded`, continues.
- User refuses degraded mode → exit, wait for Context7 install.

## Next

`/design`
