# Member Portal Documents — manual intake only

BCBSMA's member portal (`member.bluecrossma.com`) sits behind a login. This
tool never authenticates, and it never will — entering a password on your
behalf, even automated, is a hard line, not a configurable setting. See
`.claude/agents/web-plan-auditor.md` → Scope and Safety, and the project
split briefing this repo started from: an authenticated portal is "the
analog of the member-ID question" on the phone-audit side, and crossing it
turns a clean public-web audit into a real data-handling problem.

What this tool *can* do with portal content: process a document you
download yourself, exactly like it processes the public HUSHP PDFs.

## Workflow

1. **You** log into `member.bluecrossma.com` and download whatever benefits
   document you want checked (Evidence of Coverage, benefits booklet,
   whatever it's labeled there).
2. Save it to `data/member-uploads/<plan_id>/` — e.g.
   `data/member-uploads/hushp-ship-2026/`. This directory is gitignored
   (see `.gitignore`): nothing dropped here is ever committed, since it may
   carry account-specific headers, member numbers, or watermarks even if
   the underlying plan content is the same standardized document everyone
   on the plan gets.
3. Point the `web-plan-auditor` agent at the file. It runs the same
   extraction technique used on the public PDFs (`data/schemas/web-audit-output.md`
   → "Fetching PDFs" — local extraction, page-zone-aware) and produces
   findings the same shape as everything else in `data/web-audits/`.

## What the agent does with it

First checks whether the downloaded document is the **same** document
already known from the public site (same title/edition/date as `_sources`
in the plan profile, or as already fetched in a prior run) — if so, that's
itself a finding worth one line ("member portal serves the identical PDF,
no new content") rather than re-deriving facts from scratch.

If it's **different** — a newer edition, a personalized Evidence of
Coverage, something not mirrored publicly — treat it as a new document
source. Give it its own `doc` key in findings' citations (e.g. `"EOC"`),
and note in the finding why it differs from the publicly-known BD/SMB
(new edition date, member-specific rider, etc.) rather than silently
treating it as equivalent.

## What never happens here

- No login automation, no credential storage, no session cookies handled
  by this tool.
- No scripted download from the portal — the file arrives because you put
  it there.
- If a document turns out to require re-downloading periodically (e.g. it
  expires or gets replaced each plan year), that re-download is still
  yours to do by hand, every time.
