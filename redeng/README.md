# RED Engineering demo

RED Engineering demo is a Vite + React application with an Express backend.

## What is inside

- Landing hub for showcasing multiple B2B landing page variants
- Individual landing pages for different product offers
- Sticky ad review panels with ratings and comments
- Demo CRM with kanban workflow and lead management
- Backend API for leads, ad feedback, and CRM data

## Local development

```bash
npm install
npm run dev
```

Client runs through Vite, backend runs from `server/index.js`.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Production

The backend serves the built frontend and exposes the API used by the landing pages and CRM demo.
