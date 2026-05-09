# Agent Registry

Canonical list of all agents in the kit. The orchestrator spawns agents via `Task(subagent_type: "<name>", ...)`.

## Pipeline Agents

| Name | Role | Triggered by | Skills referenced |
|---|---|---|---|
| `idea-analyst` | Socratic idea analysis | `/brainstorm` | `idea-analysis` |
| `market-researcher` | Competitive analysis | `/brainstorm` | `market-research` |
| `requirements-expert` | Tech stack selection + lock | `/requirements` | `requirements-lock` |
| `architect` | Page structure + plan | `/design` | `architecture-design` |
| `designer` | Visual design system | `/design` | `architecture-design` |
| `wireframer` | Page-by-page layout + copy | `/wireframe` | (built-in) |
| `coder` | Implements one PLAN task | `/build` | `write-code` |
| `tester` | L1–L3 quality checks | `/test` | `run-tests` |
| `qa-reviewer` | L4 pre-deploy review | `/test` (final pass) | (built-in) |
| `debugger` | Bug diagnosis + fix | `/build`, `/test` (on failure) | `fix-bugs` |
| `deployer` | Production deploy | `/deploy` | `publish` |

## Service Agents

| Name | Role | Used by |
|---|---|---|
| `context-manager` | MemPalace and Graphify queries | `/save`, `/resume`, `/build`, all pipeline agents |

## Conventions

- Frontmatter: `name`, `description`, `tools`, `model`. No custom fields.
- Output contract: every agent returns a caveman summary plus structured fields described in its definition.
- Tool restrictions: each agent declares only the tools it needs.
- Model: `sonnet` by default. Override only with documented reason.

## Adding an Agent

1. Create `.claude/agents/<name>.md` with the standard frontmatter.
2. Define inputs, process, output contract.
3. Add a row here.
4. Wire it into the relevant workflow(s) via `Task(subagent_type: "<name>", ...)`.
5. Run `scripts/validate.ps1` to confirm registry alignment.
