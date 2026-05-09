# Coding Discipline

Behavioral guidelines to reduce common LLM coding mistakes. Adapted from Andrej Karpathy's observations on LLM coding pitfalls (https://github.com/forrestchang/andrej-karpathy-skills).

Applies to every agent that writes or edits code: `coder`, `debugger`, `architect` (when scaffolding), and orchestrator inline edits.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks (≤ 5 lines, single file, obvious intent), use judgment.

## 1. Think Before Coding

**No silent assumptions. No hidden confusion. Surface tradeoffs.**

Before implementing:
- State assumptions explicitly. If uncertain → ask.
- Multiple interpretations exist → present them. Do not pick silently.
- Simpler approach exists → say so. Push back when warranted.
- Something unclear → stop. Name what is confusing. Ask.

In agent context: caveman summary or `next_blocker` field carries the question. Orchestrator surfaces to user. Do not fabricate a path forward.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that was not requested.
- No error handling for impossible scenarios.
- 200 lines that could be 50 → rewrite.

Test: would a senior engineer call this overcomplicated? If yes → simplify.

Conflicts with Rule 03 (file size cap 500–600). Both bind: keep files small AND keep the code inside small.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Do not "improve" adjacent code, comments, or formatting.
- Do not refactor things that are not broken.
- Match existing style, even if a different style would be preferred.
- Unrelated dead code noticed → mention in `decisions` or BACKLOG.md. Do not delete.

When changes create orphans:
- Remove imports / variables / functions that YOUR changes made unused.
- Do not remove pre-existing dead code unless explicitly asked.

Test: every changed line should trace directly to the task's `acceptance_criteria` or the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform vague tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, make them pass."
- "Fix the bug" → "Write a test that reproduces it, make it pass."
- "Refactor X" → "Tests pass before and after."

For multi-step tasks, state a brief plan in the agent's caveman summary:
```
1. {step} → verify: {check}
2. {step} → verify: {check}
3. {step} → verify: {check}
```

Strong criteria let agents loop independently. Weak criteria ("make it work") force constant clarification cycles.

In ATESCHH KIT terms: PLAN.md tasks must have non-empty `acceptance_criteria`. Empty acceptance criteria block parallel dispatch (per Rule 11) and reduce agent autonomy. Fill incrementally as tasks run.

## 5. Anti-Patterns (Forbidden)

- Picking one interpretation silently when ambiguity exists.
- Adding features the user did not request ("you might also want...").
- Wrapping single-use code in factories, builders, or dependency injection containers.
- Renaming variables in unrelated lines while editing.
- Reformatting whole files because of a 1-line change.
- Deleting comments the agent does not understand.
- Marking a task `done` without a concrete verification step.

## 6. Conformance

These principles are working when:
- Diffs contain fewer unrelated changes.
- Coder agents return fewer `next_blocker: "uncertain: ..."` mid-task (asking up-front instead).
- Tasks marked `done` have non-empty `acceptance_criteria` and a concrete L1+L2 pass log.
- Code reviews surface fewer "why is this here?" questions.

`scripts/validate.ps1` (future) may add a check for empty `acceptance_criteria` on `status: done` tasks.

## 7. Reference

Source: Andrej Karpathy's tweet (https://x.com/karpathy/status/2015883857489522876), packaged as guidelines by https://github.com/forrestchang/andrej-karpathy-skills. Adapted to ATESCHH KIT terminology and integrated with Rules 03, 04, 11, 12.
