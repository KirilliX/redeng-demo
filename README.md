# denis workspace

This repository is a small workspace that currently contains the RED Engineering demo project.

## Structure

- `redeng/` — main application with landing hub, landing pages, CRM demo, backend API, and deployment config.

## Working with the app

```bash
cd redeng
npm install
npm run dev
```

## Production-oriented commands

```bash
cd redeng
npm run lint
npm run typecheck
npm run build
```

## Notes

- Application-specific ignore rules live in `redeng/.gitignore`.
- Workspace-level local artifacts are ignored by the root `.gitignore`.
