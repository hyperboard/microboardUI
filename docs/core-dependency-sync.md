# Core Dependency Sync Setup

This repository can automatically update the UI dependency when a new core package version is published and then reuse the existing deployment workflow by pushing to the staging branch.

## UI repository settings

- `vars.CORE_SYNC_BRANCH`
  - Branch that should receive the automated dependency update.
  - Default: `staging`

Required for the deploy workflow used after the sync:

- `vars.CLOUDFLARE_PAGES_PROJECT_STAGING`
- `vars.UI_API_URL_STAGING`
- `vars.UI_EMBED_URL_STAGING`
- `secrets.CLOUDFLARE_API_TOKEN`
- `secrets.CLOUDFLARE_ACCOUNT_ID`

Optional for staging if websocket traffic uses a dedicated endpoint:

- `vars.UI_WS_URL_STAGING`

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

The workflow uses `package_name` and `version` to update `package.json` and `bun.lock`, validates the result with `bun run build:prod` using the branch-specific UI environment variables, commits only if files changed, pushes to the target branch, and then explicitly dispatches the Cloudflare Pages deploy workflow for that branch.

## Manual testing

The workflow also supports `workflow_dispatch` with:

- `package_name`
- `version`
- `target_branch`

## Why deployment is dispatched explicitly

GitHub does not start another workflow from a `push` created by a workflow that uses the repository `GITHUB_TOKEN`. Because of that, the dependency sync workflow cannot rely on its own bot push to trigger `deploy.yml`. Instead, after a successful sync commit, it dispatches the deploy workflow directly for the target branch.
