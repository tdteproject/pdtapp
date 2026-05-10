# Agent Contract

This rule governs how the orchestrator spawns subagents, what those subagents return, how they hand off work, and when parallel dispatch is used. It is binding for every workflow that delegates via `Task()`.

## 1. Spawn Decision Matrix

Not every task warrants a subagent. Spawn overhead is real (prompt + output tokens, latency). The orchestrator decides per-task using this matrix:

| Condition | Action |
|---|---|
| `task.size` is `M` or `L` | spawn |
| `task.size == S` AND `files_touched > 1` | spawn |
| `task.size == S` AND `files_touched == 1` AND `lines_changed > 20` | spawn |
| `task.size == S` AND single file AND ≤ 20 lines | orchestrator inline |
| Domain expertise needed (design, deploy, debug) | spawn |
| Multiple agents working in parallel | spawn |
| Read-only question / status report | orchestrator inline |
| Routing / save / resume / status / settings | orchestrator inline |

`task.size`, `files_touched`, and dependencies come from `PLAN.md` per `templates/project/PLAN.template.md`.

## 2. Output Contract

Every spawned agent returns:

1. A **caveman summary** (≤ 500 tokens; rough sentence fragments, no articles, terse).
2. A **structured fields block** in fenced YAML, conforming to the schema declared in the agent's definition.

The caveman summary is for the orchestrator to relay (and to log to `SESSION-LOG.md` and MemPalace). The structured block is for the orchestrator to parse and act on.

Canonical envelope returned by every agent:

````
{caveman summary, ≤500 tokens, no preamble}

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
  # agent-specific structured fields, defined per agent
```
````

Agents may add **custom** fields (kept under `custom:`) but must include the canonical fields. The validator enforces the canonical block; custom fields are not validated.

## 3. Handoff Matrix

Subagents do **not** spawn other subagents directly. The orchestrator is the only spawner. Handoff is encoded by the agent's `next_blocker` and `status` fields.

| Condition in agent output | Orchestrator action |
|---|---|
| `coder` returns `metrics.L1 == fail` or `metrics.L2 == fail` | spawn `debugger` with the failed defect report |
| `coder` returns `next_blocker == "uncertain: <X>"` | surface to user, do not spawn anything |
| `tester` returns `metrics.L1..L3 == fail` with defect list | spawn `debugger` per defect |
| `tester` returns `metrics.L4` not yet run | spawn `qa-reviewer` |
| `qa-reviewer` returns blocker | spawn `debugger`; do not let `/deploy` proceed |
| `architect` and `designer` both return `status == ok` (parallel) | proceed to wireframe phase |
| `idea-analyst` and `market-researcher` both return `status == ok` (parallel) | summarise to user, transition phase |
| any agent returns `status == failed` with no recovery hint | escalate to user |

## 4. Parallel Dispatch

The orchestrator may spawn multiple agents in parallel when **all** of the following hold:

- The tasks are independent (no `dependencies` overlap, no `files_touched` overlap).
- Concurrency limit is respected (default **3**, configurable via `.claude/settings.local.json` `parallel_concurrency`).
- The user requested a batch operation (natural language: "do all of phase X" / "run all remaining tasks", or explicit flags: `/build --all`, `/build --batch`).

### Algorithm

```
build DAG from PLAN.md `dependencies`
loop:
    leaves = tasks with all deps satisfied AND not yet done
    if leaves empty: exit
    wave = pick up to <concurrency_limit> leaves with non-overlapping files_touched
    spawn wave in parallel
    wait for all
    record results in STATE.md (current_wave++, running_agents → done_agents)
    if any failed AND not --continue-on-fail: stop, surface to user
```

### Failure modes

- **fail-fast** (default): on any agent failure, wait for the in-flight wave to finish, then stop. Surface failed task ids and next steps.
- **continue-on-fail** (`--continue-on-fail`): on failure, mark task as failed in STATE.md, continue with subsequent waves. Failed tasks are listed at end and require user resolution.

### File-conflict detection

Before assembling a wave, the orchestrator computes `files_touched` for every leaf. Tasks whose sets intersect cannot be in the same wave. They are queued for sequential execution after the wave completes.

## 5. Anti-Patterns (Forbidden)

- Spawning a subagent for a single-line trivial change.
- An agent spawning another agent (must go through orchestrator).
- Returning prose-only output without the YAML structured block.
- Returning the YAML block without the caveman summary.
- Including verbatim file dumps in the caveman summary.
- Caveman style applied to user-facing replies, locked project files, or DECISIONS.md.
- Parallel dispatch without checking `files_touched` overlap.
- Concurrency exceeding the configured limit.
- Recursive spawning (agent A → agent B → agent A).

## 6. Failure Escalation Ladder

Every agent observes the same escalation rule:

1. **First attempt**: do the work as described.
2. **Second attempt** (only if first observed a recoverable issue): retry with adjusted approach. Document in caveman summary.
3. **Third attempt is forbidden.** If the second attempt fails, return `status: failed` with `next_blocker` describing what was tried. Orchestrator surfaces to user.

"Attempt" = a complete pass through the agent's process section, including verification.

## 7. Tools Discipline

Each agent declares only the tools it needs in its frontmatter `tools:` field. Validator confirms agents do not exceed their declared tool set.

Default tool sets:

| Agent | Tools |
|---|---|
| `coder` | Read, Edit, Write, Bash, Grep, Glob |
| `architect` | Read, Write, Grep, Glob |
| `designer` | Read, Write, Bash, Grep |
| `wireframer` | Read, Write, Grep |
| `tester` | Read, Bash, Grep, Glob |
| `qa-reviewer` | Read, Bash, Grep, Glob |
| `debugger` | Read, Edit, Bash, Grep, Glob |
| `deployer` | Read, Bash, Grep |
| `idea-analyst` | Read, Write |
| `market-researcher` | Read, Write, WebSearch, WebFetch |
| `requirements-expert` | Read, Write, Grep |
| `context-manager` | Read, Bash, Grep, Glob |

## 8. Conformance

`scripts/validate.ps1` enforces:
- Frontmatter `name`, `description`, `tools`, `model` present.
- Agent body includes `## Output Contract` section.
- Output schema reference (link to `.claude/agents/OUTPUT-SCHEMA.md`) present.

A pull request that adds or modifies an agent must also update this rule's matrices if the agent introduces new handoff patterns or tool needs.
