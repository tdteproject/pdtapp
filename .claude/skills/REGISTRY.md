# Skill Registry

Skills are reference material that agents read for domain expertise. They are not invoked directly — agents pull from them as context.

## Canonical Skills (kit core)

These are referenced by name in agent definitions and underpin the pipeline.

| Skill | Purpose | Used by |
|---|---|---|
| `idea-analysis` | Socratic 5-question idea evaluation | `idea-analyst` |
| `market-research` | Competitive landscape framework | `market-researcher` |
| `requirements-lock` | Stack selection + REQUIREMENTS.md lock format | `requirements-expert` |
| `architecture-design` | STRUCTURE.md + DESIGN.md + PLAN.md generation | `architect`, `designer` |
| `write-code` | Per-task implementation rules | `coder` |
| `run-tests` | L1–L4 verification protocol | `tester`, `qa-reviewer` |
| `fix-bugs` | Bug diagnosis + fix protocol | `debugger` |
| `publish` | Deploy playbook selection | `deployer` |
| `context-management` | Session save/restore semantics | orchestrator, `context-manager` |

## Community Skills (advisory)

Located under `.claude/skills/community/`. These are imported reference material for specific frameworks and platforms. Not part of the kit's core contract — agents may or may not consult them based on the project stack.

**Risk classification.** Community skills carry a `risk:` field inherited from their import source (`safe | unknown | community`). This metadata is **provenance only**, not a runtime gate — skill content is read as advisory text, never auto-executed. The `risk: unknown` tag means "we did not personally vet this for malicious patterns"; users who want stricter assurance should review each skill before relying on it. Reviewed-and-cleared skills can be re-tagged `risk: safe` over time.

| Skill | Domain |
|---|---|
| `cloudflare-workers-expert` | Cloudflare Workers, KV, D1, Durable Objects |
| `docker-expert` | Containerisation, multi-stage builds |
| `electron-development` | Electron desktop apps |
| `expo-api-routes` | Expo API routes |
| `expo-deployment` | EAS build / submit / update |
| `fastapi-pro` | FastAPI patterns |
| `flutter-expert` | Flutter / Dart |
| `llm-app-patterns` | LLM-application patterns |
| `nextjs-app-router-patterns` | Next.js App Router |
| `nextjs-best-practices` | Next.js general |
| `nodejs-backend-patterns` | Node.js backend |
| `postgres-best-practices` | PostgreSQL |
| `prisma-expert` | Prisma ORM |
| `prompt-engineering` | LLM prompt design |
| `rag-implementation` | Retrieval-augmented generation |
| `react-best-practices` | React |
| `react-native-architecture` | React Native (bare) |
| `shadcn` | shadcn/ui component library |
| `supabase-automation` | Supabase admin via MCP |
| `tailwind-design-system` | Tailwind tokens + variants |
| `typescript-expert` | TypeScript advanced |
| `vercel-deployment` | Vercel deploys |

## Conventions

- Frontmatter: `name`, `description`. No custom fields. Use `.claude/agents/REGISTRY.md` and this file for cross-references.
- Body: implementation rules, code patterns, checklists.
- Length: typically 1–3 KB for canonical, longer for community helpers covering broad ecosystems.

## Adding a Skill

1. Create `.claude/skills/<name>/SKILL.md` (canonical) or `.claude/skills/community/<name>/SKILL.md` (advisory).
2. Frontmatter: `name`, `description`.
3. Body: practical, code-pattern-heavy.
4. Add a row in this REGISTRY.
5. If canonical, reference it by name in an agent's definition.
