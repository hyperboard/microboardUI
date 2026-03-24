# Microboard UI

This repository uses a two-environment branch model:

- `staging` deploys the staging UI and must target the staging backend.
- `release` deploys the production UI and must target the production backend.

When the core `microboard` package publishes a new version, this repository updates `staging` automatically and redeploys the staging UI.

Operational setup and manual configuration live in [docs/deployment-model.md](./docs/deployment-model.md) and [docs/deployment-checklist.md](./docs/deployment-checklist.md).

Local development:

```bash
bun install
bun run build
```
