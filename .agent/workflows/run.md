---
command: /run
description: Compiles and runs the app. On error, spawns debugger per Rule 11. Appends caveman entries to run-log.md.
phase: any
agents: [debugger, context-manager]
skills: []
outputs: [Live app, run-log.md appended]
---

# /run

Verify the app starts and the core flow works. Surface errors and fix them via `debugger`.

## Path resolution

Standalone: `{path} = projects/{name}/`
Workspace app: `{path} = projects/{workspace-name}/apps/{app}/`

## Steps

### 1. Read context (minimal)

- `{path}/STATE.md` (frontmatter only).
- `{path}/REQUIREMENTS.md` (stack + framework).
- `{path}/package.json` (dev script).

### 2. Determine run command

| Framework (from REQUIREMENTS) | Dev command |
|---|---|
| Next.js | `npm run dev` |
| Expo | `npx expo start` |
| Vite | `npm run dev` |
| Hono / Node | `npm run dev` (or fallback to `node src/index.js`) |
| Electron | `npm run electron:dev` |
| Other | Read `package.json` scripts; pick the dev script |

### 3. Build check (L1)

```
npm run build
```

If fail:
- Capture error output.
- Spawn `debugger` via `Task()` with the build error as defect (caveman task body).
- After debugger fix, retry `npm run build`. Two attempts max per Rule 11.

### 4. Start dev server

Run dev command in background (Bash with `run_in_background: true` or platform equivalent).

Watch first 30 seconds for:
- Port conflicts → ask user to free the port or pass `--port`.
- Missing env vars → list missing keys, refer to `.env.example`.
- Import errors → spawn `debugger`.

### 5. Smoke test core flow

If WIREFRAMES.md or STRUCTURE.md exists:
- Identify Golden Path (entry → core action → success).
- Manually walk through it (read-only check; user does the clicking unless an MCP tool is available).
- Confirm no console errors.

### 6. Append run-log.md (caveman)

`{path}/run-log.md` is append-only:

```
{ISO timestamp} run. {framework}. {url}. status {ok | failed-fixed | failed}. errors {N}. fixes {list}.
```

### 7. Confirm to user

- Success: "App at {url}. Golden Path ok. {N} errors fixed during run."
- Partial: "App at {url}. {N} unresolved warnings. See run-log.md."
- Failure: "App did not start. Blocker: {description}. Tried {N} debugger spawns. Manual intervention needed."

## Anti-Patterns (Forbidden)

- Run dev server without first attempting build check.
- Modify locked files to silence warnings.
- Move on (advance phase) when the app does not start.
- Overwrite previous run-log entries (append-only).
- Skip Golden Path verification when WIREFRAMES exist.

## Next

If clean → continue work. If errors persisted → `/test` for full L1–L4, or `/quick` to fix manually.
