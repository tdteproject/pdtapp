---
command: /test
description: Runs L1–L3 via tester, then L4 via qa-reviewer. Spawns debugger per defect. Sets phase to deploy-ready on full pass.
phase: test
agents: [tester, qa-reviewer, debugger, context-manager]
skills: [run-tests, fix-bugs]
---

# /test

## Preconditions

- `STATE.phase` is `test` (or `polish-N` returning to test).
- All `PLAN.md` tasks have `status: done` (or task list explicitly skipped via `--scope last-task`).

## Path resolution

Standalone: `{path} = projects/{name}/`
Workspace app: `{path} = projects/{workspace-name}/apps/{app}/`

## Modes

`/test`                       → full L1–L4 pass (default)
`/test --scope last-task`     → L1–L2 only on the most recently changed code
`/test --scope regression`    → re-run L1–L3 to confirm fixes
`/test --skip-l4`             → run L1–L3 only; do not advance to deploy-ready

## Steps

### 1. Spawn tester for L1–L3

`Task(subagent_type: "tester", ...)`. Caveman task body:

```
run L1 + L2 + L3. report defects per OUTPUT-SCHEMA.

scope: {all | last-task | regression}
{path}: {project path}
structure: {path}/STRUCTURE.md
wireframes: {path}/WIREFRAMES.md (if exists)
last touched: {list from recall.code or graphify.changed-since-last-test}
```

### 2. Parse tester return

Read `metrics.L1`, `metrics.L2`, `metrics.L3` and `custom.defects`.

For each defect, severity-ordered (critical → high → medium → low):
- Spawn `debugger` (one defect per spawn) via `Task()`. Caveman body includes the defect entry.
- Wait for `debugger` return.
  - `status: ok`, `metrics.L1: pass`, `metrics.L2: pass` → mark defect resolved, append `DECISIONS.md` if non-trivial.
  - `status: failed` after two attempts → escalate to user with `next_blocker`.

After all defects processed, re-spawn `tester` with `scope: regression` to confirm the fix set holds.

### 3. Spawn qa-reviewer for L4

Once L1–L3 are clean:
`Task(subagent_type: "qa-reviewer", ...)`. Caveman task body:

```
run L4. perf + a11y + sec + ux. report per OUTPUT-SCHEMA.

build path: {production build dir or preview url}
{path}: {project path}
design refs: DESIGN.md, design-system/MASTER.md, WIREFRAMES.md
```

Skip this step if `--skip-l4` flag is set.

### 4. Handle L4 defects

Per defect:
- **Critical** → spawn `debugger`, repeat regression.
- **High / Medium / Low** → ask user: fix now, or accept and ship?
  - Fix → spawn `debugger` per defect.
  - Accept → annotate in `DECISIONS.md` as accepted technical debt.

### 5. Wrap up

If all gates pass (or accepted defects only):
- Update `STATE.md`: `phase: deploy-ready`. Record `last_test_run: {date}`.
- Write test report to `{path}/test-reports/{date}.md` (normal English, audit trail).
- `context-manager.write.session-summary`:
  ```
  test done. L1-L4 pass. {N} defects fixed. {M} accepted. ready deploy.
  ```
- Append SESSION-LOG.md (caveman).

If gates fail and cannot be resolved:
- Update `STATE.md`: `phase: test` (stay).
- Surface unresolved defects to user.
- Suggest `/polish` if scope creeped, else fix manually + re-run `/test`.

### 6. Confirm

Reply normal English: "L1–L4 clean. Run `/deploy` or `/polish`."

## Failure modes

- Tester returns `failed` mid-run (e.g. dev server won't start) → debugger spawn for the infrastructure issue, then re-spawn tester.
- Debugger fails twice on same defect → mark `accepted` only with explicit user OK; otherwise block.
- L4 perf fail with unclear cause → run again on a clean production build before declaring failure.

## Next

`/deploy` (if all pass) or `/polish` (if scope changes needed).
