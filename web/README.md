# Health Insurance Plan Pull — Web Dashboard

A Next.js app for the audit runs in `../data/web-audits/`: a findings
viewer plus a coverage Q&A chat, both grounded in the same extracted plan
facts (no separate source of truth).

- **`/` and `/audit/[file]`** — findings table, needs-slot requests, source
  provenance (public vs. user-provided member-portal download — see
  `../docs/MEMBER-PORTAL-DOCUMENTS.md`). Build-time data reads, no live
  API involved.
- **`/ask`** — natural-language coverage questions, answered by an LLM
  that's only allowed to cite the extracted plan facts. See "Coverage Q&A"
  below.

## Coverage Q&A (`/ask`, `/api/ask`)

Ask something like *"How much do prescriptions cost on my plan?"* and get
an answer with citations pulled from `data/plans/<plan>.json` — the same
facts, same page citations, that ground the audit findings. The system
prompt (`app/api/ask/route.ts`) enforces the same hard rules as the rest
of this repo:

- Never state a number or rule that isn't in the extracted facts —
  explicit "not in the available plan facts" rather than a guess.
- Every claim ends with a bracketed citation copied from the source data.
- Never apply a regulatory framework the plan's own `regulatory_regime`
  says doesn't govern it.
- Known website/document discrepancies (from `data/web-audits/`) get
  surfaced as both sides, not silently resolved one way.

**Requires your own Anthropic API key** — this tool doesn't ship with one
and I can't create one on your behalf:

- Local dev: create `web/.env.local` with `ANTHROPIC_API_KEY=sk-ant-...`
  (gitignored by default via `.env*` — never commit it).
- Vercel: add `ANTHROPIC_API_KEY` under Project Settings → Environment
  Variables.
- Optional: `ANTHROPIC_MODEL` to override the default (`claude-sonnet-5`).

Without the key set, `/ask` still renders — it returns a clear setup
error instead of failing silently.

## Why not a static export anymore

The findings pages (`/`, `/audit/[file]`) are still build-time-only reads
of `data/web-audits/*.json`, but `/api/ask` calls the Anthropic API at
request time, which needs a real serverless function — incompatible with
`output: "export"`. `next.config.ts` no longer sets it; Next.js statically
optimizes what it can (`/`, `/ask`) and only `/api/ask` (and, for
Windows-local-build reasons below, `/audit/[file]`) become real functions.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000, data re-synced automatically
```

`npm run dev` / `npm run build` both run `scripts/sync-data.mjs` first
(via `predev`/`prebuild`), which copies `../data/web-audits/` and
`../data/plans/` into `public/data/` so the app is self-contained at build
time.

## Deploying

**From a GitHub-connected Vercel project (recommended):** import this repo
in the Vercel dashboard with **Root Directory** set to `web`, add
`ANTHROPIC_API_KEY` under Environment Variables, done — auto-deploys on
every push, builds on Vercel's own (Linux) infrastructure.

**From the CLI, for a quick anonymous test link:**

```bash
npm run build
vercel deploy --temporary --yes   # no login needed; expires in 60 min unless claimed
```

⚠️ **On Windows**, `vercel deploy`'s local build step needs to create
symlinks, which fails with `EPERM: operation not permitted, symlink ...`
unless [Developer Mode](ms-settings:developers) is on or the terminal is
elevated (admin). This isn't a code issue — it's a Windows privilege
requirement for `CreateSymbolicLink`. Either enable Developer Mode once
(Settings → Privacy & Security → For Developers), or just use the
GitHub-connected path above, which builds remotely and never hits this.

This is also why `/audit/[file]` uses `export const dynamic =
"force-dynamic"` instead of `generateStaticParams`: the installed Vercel
CLI's Next.js 16 builder throws `Unable to find lambda for route` on that
specific SSG pattern. Forcing the route to render on-demand instead of
pre-rendering sidesteps it with no real cost (the underlying read is a
small local JSON file either way).

## Adding a new audit run

Nothing to do here — write a new `data/web-audits/<plan>-<date>.json`
(schema: `../data/schemas/web-audit-output.md`) at the repo root, then
rebuild/redeploy this app. It'll show up on the home page automatically,
and the plan becomes selectable on `/ask` if there's more than one.
