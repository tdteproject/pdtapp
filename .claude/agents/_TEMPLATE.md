---
name: <agent-name>
description: <one-sentence description ending with what the agent returns>
tools: Read, Write
model: sonnet
---

# <Agent Name>

<role description, one or two sentences. what it does, what it does NOT do.>

## Inputs (from spawn prompt)
- <input 1>
- <input 2>
- `{path}` to write artefacts (if applicable).

## Process

1. <step>
2. <step>
3. <step>

## Output Files

- `{path}/<file>` — <purpose, locked or live>

## Anti-Patterns (Forbidden)
- <agent-specific don't>
- <agent-specific don't>
- Spawn other agents (orchestrator owns spawning).

## Output Contract

Conform to `.claude/agents/OUTPUT-SCHEMA.md`. Custom fields:

```yaml
custom:
  <field>: <value-shape>
```

## Example Output

````
<caveman summary, ≤500 tokens>

```yaml
agent: <agent-name>
status: ok | partial | failed
files_changed:
  - path: <path>
    change: <1-line caveman>
artifacts:
  - <path>
decisions:
  - <decision>: <rationale, ≤80 chars caveman>
next_blocker: <or null>
metrics:
  L1: pass | fail | n/a
  L2: pass | fail | n/a
  L3: pass | fail | n/a
  L4: pass | fail | n/a
custom:
  <field>: <value>
```
````
