# AGENTS.md — Project context for AI agents (Codex, GPT, etc.)

> Same content as CLAUDE.md — read that file first.

## Project: RED Engineering (red-eng.ru)

B2B landing hub + CRM for an engineering company.

## Stack
- React 18 + Vite + Tailwind + Radix UI
- Node.js v22+ (required) + Express 5 + SQLite (node:sqlite built-in)
- GitHub Actions → VPS deploy on push to `main`

## Key rules
1. Always work on `main` branch — every push triggers deploy
2. Node.js v22+ required on server (node:sqlite)
3. Do not commit: `.env`, `server/storage/` (db + uploads)
4. Run `npm run build` before pushing to verify no build errors
5. No Base44 dependencies — project was migrated off Base44 platform

## File map
- `src/content/` — all landing page content (source of truth for routes)
- `src/pages/` — page components
- `src/lib/api.js` — CRM API client functions
- `server/index.js` — Express server entry
- `server/db.js` — database schema + seed

## Commit style
```
Short imperative description

https://claude.ai/code/...  (or agent reference)
```
