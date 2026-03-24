# Deployment Checklist

Use this checklist to finish the repository normalization and the external platform setup.

## Branch normalization

- [x] Verified that the deprecated default branch contains no commits missing from `staging`.
- [ ] Rename the remote production branch to `release`.
- [ ] Update repository default branch settings if they still point to a deprecated branch.
- [ ] Delete deprecated remote branches after rename and verification.
- [ ] Update branch protection rules so only `staging` and `release` remain protected as needed.

## GitHub repository variables

- [ ] Set `CLOUDFLARE_PAGES_PROJECT_STAGING`
- [ ] Set `CLOUDFLARE_PAGES_PROJECT_RELEASE`
- [ ] Set `UI_API_URL_STAGING`
- [ ] Set `UI_API_URL_RELEASE`
- [ ] Set `UI_EMBED_URL_STAGING`
- [ ] Set `UI_EMBED_URL_RELEASE`
- [ ] Optionally set `UI_WS_URL_STAGING`
- [ ] Optionally set `UI_WS_URL_RELEASE`
- [ ] Optionally set `CORE_SYNC_BRANCH` if the default `staging` target should ever change

## GitHub secrets

- [ ] Set `CLOUDFLARE_API_TOKEN`
- [ ] Set `CLOUDFLARE_ACCOUNT_ID`

In the core repository:

- [ ] Set `UI_REPOSITORY`
- [ ] Set `UI_REPOSITORY_DISPATCH_TOKEN`

## Cloudflare Pages

- [ ] Create or verify the staging Pages project and map its production branch to `staging`
- [ ] Create or verify the production Pages project and map its production branch to `release`
- [ ] Confirm both Pages projects are deployed only by GitHub Actions via Wrangler

## Validation

- [ ] Push a test commit to `staging` and confirm it deploys the staging UI
- [ ] Confirm the staging UI calls the staging backend and staging WebSocket endpoint
- [ ] Dispatch `sync-core-dependency.yml` manually and confirm it updates `staging` and redeploys staging
- [ ] Push a controlled test commit to `release` and confirm it deploys the production UI
- [ ] Confirm the release UI calls the production backend and production WebSocket endpoint
- [ ] Confirm repository search no longer finds operational references to deprecated branch names
