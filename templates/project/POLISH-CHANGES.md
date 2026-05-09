# Polish Iteration {N} — Changes

**Started**: {YYYY-MM-DD}
**Closed**: {YYYY-MM-DD or "in-progress"}
**Size declared**: S | M | L
**Outcome**: in-progress | shipped | cancelled

## Reason for this iteration

{1–3 sentences in normal English explaining why polish was needed at this stage. Example: "Stakeholder feedback after preview deploy: hero copy felt generic, mobile spacing tight on iPhone SE, login button colour fails contrast on dark mode."}

## Scope summary

- **Visual**: {bullet, or "none"}
- **Copy / UX**: {bullet, or "none"}
- **Functional**: {bullet, or "none"}
- **Performance / a11y**: {bullet, or "none"}

## Locked-file unlocks

For each unlock approved during this iteration:

```yaml
- file: <DESIGN.md | REQUIREMENTS.md | WIREFRAMES.md | STRUCTURE.md>
  approved_at: <YYYY-MM-DD HH:MM>
  reason: <normal English, the user-approved justification>
  decisions_md_entry: <link / anchor in DECISIONS.md>
  re_locked: yes | no   # set to yes when iteration closes
```

If no unlocks happened: `none`.

## Task outcomes

A summary table populated as tasks complete. Source of truth is `PLAN.md` in this iteration directory.

| Task id | Description | Status | Notes |
|---|---|---|---|
| P{N}-T-001 | … | done | … |

## Decisions

Cross-link to `DECISIONS.md` entries created during this iteration. The orchestrator writes detailed entries to `DECISIONS.md` (project-level, normal English); this section just lists them.

```
- DECISIONS.md#{anchor or date}: short title
- DECISIONS.md#{anchor}: short title
```

## Closing notes

When the iteration ends (shipped or cancelled):
- Iteration's locked files are re-locked.
- `STATE.iteration_count` increments.
- This file's `Outcome` and `Closed` fields populate.
- A caveman summary is written to MemPalace project wing via `context-manager`.
