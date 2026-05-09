# Caveman Style

Rules for when caveman-compressed text is required, when normal English is required, and how to write caveman correctly.

Companion to `OUTPUT-SCHEMA.md` (which uses the format) and to the future Caveman skill (which automates routing in Phase 3).

## 1. Application Matrix

| Artefact / channel | Style |
|---|---|
| `.claude/agents/*.md` (definitions) | normal English, tight, no fluff |
| `.claude/skills/**/SKILL.md` | normal English, tight |
| `.claude/commands/*.md` | normal English, tight |
| `.claude/rules/*.md` | normal English, tight |
| `Task()` prompt — task body | **caveman** |
| `Task()` prompt — output contract / schema refs | normal English (precise) |
| `Task()` prompt — file references | already terse, leave alone |
| Agent return output (caveman summary above YAML) | **caveman** |
| Agent return output (YAML structured block) | normal (machine-parsed) |
| Inter-agent handoff text | **caveman** |
| User-facing reply | normal English (user reads this) |
| `REQUIREMENTS.md`, `DESIGN.md`, `STRUCTURE.md`, `PLAN.md`, `WIREFRAMES.md`, `DECISIONS.md` | normal English (locked, audited) |
| `STATE.md` body fields | **caveman** |
| `SESSION-LOG.md` entries | **caveman** |
| MemPalace wing entries | **caveman** |
| Commit messages | **caveman** (`/caveman-commit`) |
| GitHub PR body / release notes | normal English |

## 2. Caveman Rules

Drop:
- Articles: a, an, the.
- Pleasantries: please, thanks, just, basically, really.
- Hedging: probably, maybe, I think, sort of.
- Filler: in order to → to. due to the fact that → because.
- Self-narration: I have, I will, we are going to.

Keep:
- Code identifiers (function names, file paths) verbatim.
- Numbers, units, version strings.
- Domain-specific jargon (auth, RLS, hydration) — clarity wins over compression.

Style:
- Sentence fragments allowed. `[thing] [action] [reason]. [next].`
- Period-separated clauses preferred over commas.
- Lists over prose where applicable.
- Maximum 500 tokens per agent caveman summary; aim for under 200.

## 3. Examples

### Good (agent summary)
> task done. T-014 login form. used react-hook-form. zod schema. supabase via env. files: LoginForm.tsx, useAuth.ts, schemas/auth.ts. L1 pass. L2 pass. no blockers.

### Bad (verbose)
> I have completed the implementation of task T-014, which is the login form. I decided to use react-hook-form because it integrates well with our requirements. I added a zod schema for validation. The supabase client is wired up using environment variables. The files I changed are LoginForm.tsx, useAuth.ts, and schemas/auth.ts. L1 verification passed and L2 also passed. There are no blockers.

### Good (STATE.md notes field)
> phase build. T-014 done. T-015 next. wireframe locked. context7 cache fresh. no interrupt.

### Bad (STATE.md notes — too verbose, redundant with structured fields)
> We are currently in the build phase. Task T-014 has been completed successfully. The next task to work on is T-015. The wireframes are locked. Context7 cache is fresh. There has been no interruption.

### Good (SESSION-LOG entry)
> 2026-04-29T14:32 build T-014 done. coder spawn. L1+L2 pass. 142 lines. mempalace updated.

### Bad (SESSION-LOG entry — prose)
> At 2:32 PM on April 29th 2026, the build for task T-014 was completed by spawning the coder agent. Both L1 and L2 verifications passed. The agent changed 142 lines of code. MemPalace was updated with the session summary.

## 4. Forbidden

- Caveman style applied to user-facing replies.
- Caveman style applied to locked project files (REQUIREMENTS, DESIGN, STRUCTURE, WIREFRAMES, DECISIONS).
- Caveman style with critical nuance dropped (security warnings, edge cases, etc.).
- Mixing caveman and normal English within the same artefact.
- Caveman so terse that meaning is ambiguous to a machine reader.

## 5. Enforcement

Manual until Phase 3 (Caveman skill installed):
- LLM author writes caveman where the matrix requires.
- Validator (Phase 6) flags caveman markers (dropped articles, sentence fragments) in artefacts where the matrix requires normal English.

Automatic from Phase 3:
- Caveman skill hook routes per matrix.
- Hook output verified by validator.

## 6. Quick Reference

```
agent prompt task body  → caveman
agent return summary    → caveman
agent return YAML       → normal (structured)
STATE.md body           → caveman
SESSION-LOG.md          → caveman
MemPalace               → caveman
commit message          → caveman
user reply              → normal
locked file             → normal
agent definition        → normal (tight)
rule / command file     → normal (tight)
```
