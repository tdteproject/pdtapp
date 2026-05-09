# Agent Output Schema

Every agent returns the same envelope: a caveman summary followed by a YAML structured block. This file is the canonical schema. Agents reference it and may extend the `custom:` field.

## Envelope

````
{caveman summary, ≤500 tokens, no preamble, no markdown headers}

```yaml
agent: <agent-name>
status: ok | partial | failed
files_changed:
  - path: <relative path>
    change: <1-line caveman>
artifacts:
  - <path written, e.g. STRUCTURE.md>
decisions:
  - {decision}: {rationale, ≤80 chars caveman}
next_blocker: <1-line caveman, or null>
metrics:
  L1: pass | fail | n/a
  L2: pass | fail | n/a
  L3: pass | fail | n/a
  L4: pass | fail | n/a
custom:
  # agent-specific fields here
```
````

## Field Reference

### `agent` (required)
Agent name as declared in frontmatter `name:` field.

### `status` (required)
- `ok` — work complete, all gates passed, ready for next step.
- `partial` — work complete but a non-blocking issue surfaced (warnings, follow-ups).
- `failed` — work could not complete; orchestrator must escalate.

### `files_changed`
List of file paths the agent wrote or edited. Empty list if read-only.

### `artifacts`
List of locked artefacts produced (REQUIREMENTS.md, DESIGN.md, STRUCTURE.md, PLAN.md, WIREFRAMES.md, defect reports, etc.).

### `decisions`
Non-trivial choices made during execution. Each entry is a one-line caveman with rationale. The orchestrator routes these to `DECISIONS.md` in normal English (not caveman) via `context-manager`.

### `next_blocker`
Single line describing the next thing that prevents progress. `null` if the agent finished cleanly. Examples:
- `null`
- `coder uncertain about auth lib api. need user pick.`
- `tester L2 fail. login form crash safari. spawn debugger.`

### `metrics`
Verification levels relevant to this agent. Use `n/a` for levels that do not apply (e.g. `idea-analyst` does not run L1).

### `custom`
Agent-specific structured data. Schema declared in the agent's own definition file. Examples:
- `coder` adds `lines_changed`, `tests_added`.
- `tester` adds `defect_list` array.
- `deployer` adds `url`, `commit`, `platform`.
- `requirements-expert` adds `deploy_target`, `stack` array.

## Caveman Summary Style

The summary above the YAML block:
- Drop articles (a / an / the).
- Drop pleasantries ("I have", "we will").
- Drop hedging ("probably", "I think").
- Keep code snippets and identifiers verbatim.
- Use sentence fragments: `[thing] [action] [reason]. [next].`
- Maximum 500 tokens. Aim for under 200.

### Good
> task done. login form. used react-hook-form per design tokens. files: LoginForm.tsx, useAuth.ts. L1 pass. L2 pass. zod schema added. supabase client wired via env var. no blockers.

### Bad (verbose)
> I have completed the task of implementing the login form. I used react-hook-form because it matches the design tokens specified in DESIGN.md. The files I changed are LoginForm.tsx and useAuth.ts. I ran L1 verification and it passed cleanly with no errors. I also ran L2 and the form works correctly. I added a zod validation schema. I wired up the supabase client using the environment variables. I did not encounter any blockers.

## Validation

`scripts/validate.ps1` checks:
- The YAML block is valid YAML.
- Required fields (`agent`, `status`, `metrics`) are present.
- `agent` matches the spawned subagent's `name:`.
- `status` is one of the three legal values.
- `metrics.L*` values are one of the three legal values.

Custom fields are not validated; agent definitions document their own contract.
