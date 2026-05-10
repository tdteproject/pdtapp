---
command: /deploy
description: Spawns deployer for the deploy_target in REQUIREMENTS.md. Verifies post-deploy and updates STATE.md.
phase: deploy-ready
agents: [deployer, context-manager]
skills: [publish]
outputs: [Live URL, STATE.md updated, deployment log appended]
---

# /deploy

## Preconditions

- `STATE.phase` is `deploy-ready`.
- Latest `tester` and `qa-reviewer` outputs both `ready_for_deploy: yes`.
- `REQUIREMENTS.md` has `deploy_target` set.

## Path resolution

Standalone: `{path} = projects/{name}/`
Workspace app: `{path} = projects/{workspace-name}/apps/{app}/`. Deploy the active app only.

## Steps

### 1. Pre-flight

- Read `REQUIREMENTS.md`. Confirm `deploy_target` value.
- If `deploy_target == other` → emit a manual checklist, do not auto-deploy. Wait for user to confirm a manual step has been completed and provide a URL.
- Confirm `STATE.phase == deploy-ready` and last test report shows L1–L4 clean.
- Verify env vars: read `.env.example` and confirm production equivalents exist (do not read the production secret values; just confirm presence).

### 2. Spawn deployer

`Task(subagent_type: "deployer", ...)`. Caveman task body:

```
deploy. target {deploy_target}. follow playbook. run pre-deploy checklist. execute. verify post-deploy. report per OUTPUT-SCHEMA.

deploy_target: {value}
{path}: {project path}
commit: {current head sha}
env_var_inventory: {list from .env.example}
```

### 3. Parse return

- `status: ok` and `custom.post_deploy_checks: pass` → success.
- `status: partial` with non-blocker issues (e.g. minor warnings) → success with notes.
- `status: failed` → preserve any deploy log, surface error + remediation. Do NOT advance phase.
- `deploy_target == other` and `custom.url == null` → manual mode; ask user to paste the live URL once they confirm deploy.

### 4. Wrap up on success

- Append deployment block to `{path}/STATE.md`:
  ```yaml
  deployments:
    - date: {date}
      platform: {value}
      url: {url}
      commit: {sha}
      status: live
  ```
- Update `STATE.phase: deployed`.
- `context-manager.write.session-summary`:
  ```
  deploy ok. {platform}. {url}. commit {sha-short}. all checks pass.
  ```
- Append `SESSION-LOG.md` (caveman).
- Append `DECISIONS.md` (normal English) if deployer made non-trivial decisions during deploy.

### 5. Confirm

Reply normal English:
```
Deployed.
URL: {url}
Platform: {platform}
Run /finish to archive, or /polish to iterate.
```

## Failure modes

- `deployer` returns `failed` with build error → surface, do not retry. Likely needs `/build` fix.
- Network / DNS / quota → `deployer` retries once with backoff per Rule 09. If still failing, return `failed`.
- Post-deploy smoke test fails → `deployer` flags it; user decides rollback vs forward-fix.

## Next

`/finish` or `/polish`.
