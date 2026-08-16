# Health Insurance Plan Pull — Web Dashboard

A static Next.js viewer for the audit runs in `../data/web-audits/`. Reads
the JSON at build time (see `scripts/sync-data.mjs`) and renders each run's
findings, needs-slot requests, and source provenance (including whether a
document came from the public site or a user-provided member-portal
download — see `../docs/MEMBER-PORTAL-DOCUMENTS.md`).

## Why a static export

Everything here is build-time data — new audit runs mean a new JSON file
in `../data/web-audits/`, not a live API. `next.config.ts` sets
`output: "export"` so the whole app ships as plain static files: no
serverless functions, no server-side data fetching at request time,
trivial to deploy anywhere that serves static files.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000, data re-synced automatically
```

`npm run dev` / `npm run build` both run `scripts/sync-data.mjs` first
(via `predev`/`prebuild`), which copies `../data/web-audits/` and
`../data/plans/` into `public/data/` so the app is self-contained at build
time — no dependency on Vercel's "include files outside the root
directory" setting for a monorepo-style subdirectory deploy.

## Deploying

From this directory:

```bash
npm run build          # writes the static site to out/
vercel deploy --temporary --yes   # no login needed; expires in 60 min unless claimed
```

For a permanent deployment, `vercel login` first, then `vercel deploy
--prod` (or connect the GitHub repo in the Vercel dashboard with **Root
Directory** set to `web`).

## Adding a new audit run

Nothing to do here — write a new `data/web-audits/<plan>-<date>.json`
(schema: `../data/schemas/web-audit-output.md`) at the repo root, then
rebuild/redeploy this app. It'll show up on the home page automatically.
