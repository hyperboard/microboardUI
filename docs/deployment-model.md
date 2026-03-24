# UI Deployment Model

This repository is the reference implementation for the UI deployment model used by Microboard.

## Branch Model

- `staging`
  - Integration branch.
  - Every push deploys the staging UI environment.
  - Must point to the staging backend.
  - Receives automated dependency updates when the core `microboard` package publishes.

- `release`
  - Production branch.
  - Every push deploys the production UI environment.
  - Must point to the production backend.
  - Updated intentionally and remains stable between releases.

## Automated Behavior

### Deploy workflow

`.github/workflows/deploy.yml` deploys only two branches:

- `staging`
- `release`

For each branch the workflow resolves:

- Cloudflare Pages project
- REST API base URL
- UI embed URL
- WebSocket URL

The workflow fails fast if the branch is unsupported or if the required variables are missing.

### Core dependency sync

`.github/workflows/sync-core-dependency.yml` listens for the `microboard_published` repository dispatch event and, by default, updates `staging`.

The sync workflow:

1. Updates the declared core package version in `package.json`
2. Refreshes `bun.lock`
3. Validates the build
4. Pushes the dependency bump to `staging`
5. Dispatches the deploy workflow for `staging`

## Required GitHub Configuration

### Repository variables

Required:

- `CLOUDFLARE_PAGES_PROJECT_STAGING`
  - Cloudflare Pages project for the staging UI deployment.
- `CLOUDFLARE_PAGES_PROJECT_RELEASE`
  - Cloudflare Pages project for the production UI deployment.
- `UI_API_URL_STAGING`
  - Staging backend API base URL, for example `https://staging-api.example.com/api/v1`.
- `UI_API_URL_RELEASE`
  - Production backend API base URL.
- `UI_EMBED_URL_STAGING`
  - Public staging UI origin, for example `https://staging-app.example.com`.
- `UI_EMBED_URL_RELEASE`
  - Public production UI origin.

Optional:

- `UI_WS_URL_STAGING`
  - Explicit WebSocket endpoint for staging. If omitted, the deploy workflow derives it from `UI_API_URL_STAGING` by removing a trailing `/api/vN`, converting the scheme, and appending `/ws`.
- `UI_WS_URL_RELEASE`
  - Explicit WebSocket endpoint for release. If omitted, the deploy workflow derives it from `UI_API_URL_RELEASE` the same way.
- `CORE_SYNC_BRANCH`
  - Branch that receives automatic core dependency updates.
  - Default: `staging`

### Repository secrets

Required:

- `CLOUDFLARE_API_TOKEN`
  - Token with permission to deploy Cloudflare Pages projects.
- `CLOUDFLARE_ACCOUNT_ID`
  - Cloudflare account identifier used by Wrangler.

Required in the core repository:

- `UI_REPOSITORY_DISPATCH_TOKEN`
  - Token used by the core repository to call `repository_dispatch` on this repository.

### Core repository variable

Required in the core repository:

- `UI_REPOSITORY`
  - Repository name in `owner/repository` format.

## Cloudflare Pages Configuration

Create or verify two Pages projects:

- one project for staging
- one project for release

Relevant configuration:

- Production branch for the staging Pages project: `staging`
- Production branch for the release Pages project: `release`
- Build command: not used by Pages when deploying through Wrangler from GitHub Actions
- Build output directory: not used by Pages when deploying through Wrangler from GitHub Actions
- Preview deployments: optional, independent from this branch model

Because deployment is performed with `wrangler pages deploy dist`, the branch-specific GitHub variables are the source of truth for backend wiring.

## Backend Wiring

Backend selection is injected at build time into `dist/env.js`.

- `staging` builds with the staging API and staging WebSocket endpoint
- `release` builds with the production API and production WebSocket endpoint

`src/Config.ts` now honors the injected runtime config instead of forcing production API traffic.
