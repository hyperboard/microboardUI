# Core Dependency Sync Setup

This repository can automatically update the UI dependency when a new core package version is published and then reuse the existing deployment workflow by pushing the update branch.

## UI repository settings

Required:

- No new required variables are needed if the update branch should stay `staging`.

Optional:

- `vars.CORE_SYNC_BRANCH`
  - Branch that should receive the automated dependency update.
  - Default: `staging`

Already required by the existing deploy workflow:

- `secrets.API_URL`
- `secrets.CLOUDFLARE_API_TOKEN`
- `secrets.CLOUDFLARE_ACCOUNT_ID`

## Core repository settings

Required in the core repository so it can notify this UI repository after a successful publish:

- `vars.UI_REPOSITORY`
  - Format: `owner/repository`
  - Example: `hyperboard/microboardUI`

- `secrets.UI_REPOSITORY_DISPATCH_TOKEN`
  - Token used by the core repository to call `repository_dispatch` on the UI repository.
  - It must have permission to dispatch events to this repository.

## Event contract

The UI workflow listens for:

- `repository_dispatch`
- type: `microboard_published`

Expected payload fields:

- `package_name`
- `version`
- `source_repository`
- `source_sha`
- `workflow`

The workflow uses `package_name` and `version` to update `package.json` and `bun.lock`, validates the result with `bun run build`, commits only if files changed, and pushes to the target branch so the existing Cloudflare Pages deploy workflow runs automatically.

## Manual testing

The workflow also supports `workflow_dispatch` with:

- `package_name`
- `version`
- `target_branch`
