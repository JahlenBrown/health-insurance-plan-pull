# Web Audit Output — this repo's own contract

**Not synced from `call-center-audit`.** `data/schemas/README.md` in this
repo is their file, copied read-only (see `docs/SYNC.md`) — don't add to it.
This file is ours: the shape every `web-plan-auditor` run must emit so a
downstream step (ours or Josh's) can compare it against a
`call-center-audit` `scorecard` programmatically, not by hand like the
first triangulation pass in `docs/triangulation/`.

## Why it looks like their schema

`citation` and `severity` below are deliberately the same shape and enum
values as `call-center-audit`'s `scorecard.flags[].citation` /
`.severity` (`data/schemas/README.md`). The connecting idea: both tools
should be able to say "here's what I found for slot X, here's the
citation" in a shape the other side already knows how to read. Diverging
gratuitously would just recreate the slot-namespace fracture one level up,
in the output format instead of the fact names.

## `data/web-audits/<plan-id>-<date>.json`

```jsonc
{
  "schema_version": 1,
  "plan_id": "hushp-ship-2026",              // matches the plan profile's own "id"
  "site": "hushp.harvard.edu",
  "audited_at": "2026-08-16T18:00:00Z",       // ISO timestamp of the run
  "pages_crawled": ["https://…", "https://…"],
  "plan_profile_source": {                    // provenance — which synced snapshot this ran against
    "repo": "call-center-audit",
    "commit": "4a397d86",
    "file": "data/plans/hushp-2026.json"
  },
  "findings": [{
    "slot": "rx_tier_1_retail",               // MUST be an exact key from the plan profile's `facts`
                                                // (see docs/SLOT-NAMESPACE.md — never invent one here)
    "verdict": "match | mismatch | document_conflict | not_findable",
    "severity": "critical | warning | pass | insufficient_evidence",
    // same enum as call-center-audit's scorecard.flags[].severity — not_findable ALWAYS maps to
    // insufficient_evidence, never a graded failure, mirroring their own grading rule for unresolved slots.
    "website_value": "$17",                   // what the site states (omit for not_findable)
    "website_source": "https://hushp.harvard.edu/…/prescription-drug-benefits/",
    "document_value": "$17 copayment, Tier 1, retail, per 30-day supply",  // straight from the plan profile fact
    "citation": { "type": "plan_document", "doc": "BD", "page": "SoB p.6" },
    // same {type, doc, page} shape as their citation object; "doc" keys into the plan profile's _sources
    "note": "optional context"                 // e.g. why a mismatch might be a stale citation, not a real error
  }],
  "needs_slot": [{                             // facts found on-site with no matching registry slot —
                                                 // requests, not inventions (rule 1)
    "proposed_name": "rx_pbm_subcontractor",
    "website_value": "CVS Caremark",
    "website_source": "https://…",
    "note": "…"
  }],
  "summary": {
    "total_findings": 7,
    "match": 5,
    "mismatch": 1,
    "document_conflict": 1,
    "not_findable": 0,
    "needs_slot": 5
  }
}
```

## Rules

- One file per audit run, named `<plan_id>-<YYYY-MM-DD>.json`, written to
  `data/web-audits/`. Don't overwrite a prior run — each is a dated
  snapshot, same pattern as `docs/audits/`.
- `findings[].slot` must exist in the plan profile's `facts` — if it
  doesn't, the finding belongs in `needs_slot`, not `findings`, and gets
  no `citation` or `document_value` (there's nothing to cite yet).
- `document_conflict` findings cite *both* disagreeing documents: `citation`
  is normally a single `{type, doc, page}` object, but for
  `document_conflict` it's an **array** of two such objects instead — e.g.
  `[{"doc": "BD", "page": "SoB p.6"}, {"doc": "SMB", "page": "p.6"}]`. A
  reader can tell which shape to expect from `verdict` alone, so there's no
  separate flag for it.
- The prose report in `docs/audits/` is now a rendering of this JSON, not
  a separate source of truth — write the JSON first.
