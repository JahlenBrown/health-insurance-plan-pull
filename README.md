# Health Insurance Plan Pull

A web-audit tool that checks a health plan's public website against its own
governing plan documents (deductibles, copays, coverage, appeal windows,
etc.), citing a page a human can verify for every finding.

## Relationship to `call-center-audit`

This is a sibling project to
[`call-center-audit`](https://github.com/heschel6/call-center-audit), which
audits the same plans by phone. Both tools test the same underlying
question — does reality match what the plan booklet says — from different
angles: a phone rep vs. a public website.

**Separate repos, shared data only:**

- No shared application code. A web scanner (fetch, parse, diff) and a
  telephony pipeline (calls, transcripts, grading) don't overlap.
- No shared compliance surface. This tool has none of the other project's
  guardrails (no call attestation, no recording consent, no TCPA exposure)
  because reading a public website isn't placing a call — keep it that way
  by not pulling that code or those constraints in.
- The only coupling is the **plan-data contract**: the plan profile
  (`data/plans/<plan>.json`) and the slot registry that names its facts.
  Sync is one-directional and manual — see [`docs/SYNC.md`](docs/SYNC.md).
  `call-center-audit` is never edited from here.

Read [`docs/SLOT-NAMESPACE.md`](docs/SLOT-NAMESPACE.md) before writing any
extraction or comparison code — it explains a live naming mismatch between
the two data files synced into this repo and which one to trust.

## Hard rules

These came out of real time lost on the sibling project and apply here too:

1. Use the sibling project's slot names exactly. Never invent one — request
   it instead (see `docs/SLOT-NAMESPACE.md` → `docs/NEEDED-SLOTS.md`).
2. Every finding cites the governing document with a page a human can turn
   to and verify.
3. Detect the page-numbering scheme before citing anything — some plan PDFs
   bundle sub-documents that each restart at "page 1" (`page_zones` in the
   plan profile's `_sources`).
4. Never assume a regulatory regime (ERISA, Medicare Part D, etc.) — read
   `regulatory_regime` off the plan profile. The wrong regime produces
   confident, citable, wrong findings.
5. When the plan's own documents contradict each other, that's a finding
   against the documents, not against the website.
6. **Never authenticate to anything, ever — no exceptions.** This tool
   does not log into member portals, does not handle credentials, and
   does not get reconsidered on this even if asked directly. If a document
   is only reachable behind a login, that's a manual hand-off — see
   [`docs/MEMBER-PORTAL-DOCUMENTS.md`](docs/MEMBER-PORTAL-DOCUMENTS.md).

This tool carries less risk than the phone-audit sibling — no attestation,
no consent regime — specifically *because* it stays off authenticated
portals. Also: respect `robots.txt` and rate-limit requests on the public
side.

## Structure

```
data/
  plans/<plan>.json              synced from call-center-audit, read-only here
  schemas/README.md              their data-contract doc, synced, read-only here
  schemas/web-audit-output.md    OUR OWN output contract -- not synced, this repo's
  answer-key/plan-profile.template.json   the (currently stale) slot template, synced
  web-audits/<plan>-<date>.json  machine-readable audit runs, one file per run
  member-uploads/<plan>/         GITIGNORED -- docs YOU download from a member portal, never us
docs/
  SYNC.md                        what's synced, from where, when to re-sync
  SLOT-NAMESPACE.md              which slot vocabulary to trust right now
  NEEDED-SLOTS.md                facts found on-site with no registry slot yet
  MEMBER-PORTAL-DOCUMENTS.md     the manual hand-off workflow for authenticated content
  audits/<plan>-<date>.md        human-readable rendering of a data/web-audits/ run
  triangulation/                 phone-transcript vs web-audit vs document cross-checks
.claude/agents/
  web-plan-auditor.md            the audit subagent — start here
```

## Getting started

Point the `web-plan-auditor` subagent at a plan (e.g. `data/plans/hushp-2026.json`)
and the carrier's public site. It reads the plan profile, crawls the
relevant public pages, and writes a `data/web-audits/*.json` artifact
(schema: `data/schemas/web-audit-output.md`) plus a human-readable
`docs/audits/*.md` rendering of the same findings.

The JSON is the integration point with `call-center-audit`: its
`citation`/`severity` shapes intentionally mirror their `scorecard.flags[]`,
so a downstream step can line up findings by `slot` and produce a true
three-way comparison (rep says X, website says Y, document says Z) — see
`docs/triangulation/` for a hand-done example of what that comparison looks
like, done before this JSON contract existed.

To pull a fresher copy of the shared plan data, see `docs/SYNC.md`.

**Have a document behind a member-portal login?** This tool won't fetch it
— see [`docs/MEMBER-PORTAL-DOCUMENTS.md`](docs/MEMBER-PORTAL-DOCUMENTS.md).
Short version: log in yourself, download it, drop it in
`data/member-uploads/<plan_id>/`, then ask the agent to run again — it
picks the file up from there and processes it exactly like a public PDF.
