---
command: /brainstorm
description: Idea analysis + market research. Spawns idea-analyst and market-researcher in parallel.
phase: brainstorm
agents: [idea-analyst, market-researcher]
skills: [idea-analysis, market-research]
---

# /brainstorm

## Preconditions

- Active project exists.
- `STATE.phase` is `brainstorm`.

## Path resolution

- Standalone: `{path} = projects/{name}/`
- Workspace app: `{path} = projects/{workspace-name}/apps/{app}/`

## Steps

1. Ask the user for a free-form idea description in one prompt. Wait.

2. Read response. Identify gaps. Generate 3–5 follow-up questions specific to this idea. Send all in one message. Wait.

3. Spawn `idea-analyst` and `market-researcher` **in parallel** via two simultaneous `Task()` calls (single message, two tool uses). Each gets a caveman task body.

   `idea-analyst` Task body (caveman):
   ```
   analyse idea. user description + Q&A below. apply 5 socratic questions. write IDEA-ANALYSIS.md to {path}.

   description:
   {user description}

   answers:
   {Q&A}

   path: {path}
   ```

   `market-researcher` Task body (caveman):
   ```
   research market. idea below. find 3-5 competitors. identify gap. write MARKET-RESEARCH.md to {path}.

   idea: {one-line summary from description}
   target hint: {if user gave one}

   path: {path}
   ```

   Output contract for both: `OUTPUT-SCHEMA.md`. Orchestrator parses YAML envelope.

4. Both agents return. Read their YAML blocks:
   - `idea-analyst.custom.verdict`
   - `market-researcher.custom.gap_identified`
   - `next_blocker` from each.

5. If either returns `status: failed`: surface to user, do not advance phase.

6. If `idea-analyst.custom.verdict == fundamental-flaw`: warn user, ask whether to revise idea or abandon.

7. Synthesise to user (normal English):
   ```
   Idea Summary
     {3 bullets from idea-analyst}
   Target User
     {who, pain}
   Market Opportunity
     {gap from market-researcher}
   Risks
     {top 2-3}
   ```

8. Ask: "Does this capture your idea? Ready for `/requirements`?"

9. On user yes:
   - Update `{path}/STATE.md`: `phase: requirements`.
   - `context-manager.write.session-summary` with caveman: `brainstorm done. verdict {x}. gap {x}. next /requirements.`
   - Append SESSION-LOG.md (caveman).

## Failure modes

- Either agent returns `failed` → surface, no phase advance.
- User rejects synthesis → loop back to step 2 with new questions.
- MemPalace unreachable → `context-manager` falls back to `MEMORY.md` write (per Rule 09).

## Next

`/requirements`
