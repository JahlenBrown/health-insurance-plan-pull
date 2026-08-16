# Needed Slots

Facts this repo's audits have found on a carrier/plan website with no
matching key in the shared slot registry (`data/answer-key/plan-profile.template.json`
or a plan's own `data/plans/<plan>.json` `facts`). Per the project-split
rule, we don't invent slot names locally — these get proposed upstream to
whoever owns `call-center-audit`'s registry.

Remove an entry once a real slot exists for it and update the citing audit
report to use the real name.

## Open requests

| Proposed name | What it captures | Document backing | First seen | Source |
|---|---|---|---|---|
| `rx_pbm_subcontractor` | Name of the PBM handling out-of-network pharmacy claims (e.g. "CVS Caremark") | **None** — checked BD pp.51-54 directly, no PBM named anywhere; confirms `rx_administrator`'s own caveat that this is undocumented | 2026-08-16 audit | hushp.harvard.edu prescription-drug-benefits page |
| `rx_antimalarial_cost_share` | 50% coinsurance for antimalarial drugs (distinct tier structure from standard Rx tiers) | **Confirmed** — BD SoB p.6 states it verbatim | 2026-08-16 audit | hushp.harvard.edu prescription-drug-benefits page |
| `rx_contraceptive_waiver_scope` | Which contraceptive products get the $0 waiver | **Confirmed, website is accurate** — BD p.53: generic waived, brand-name waived too when generic isn't available/appropriate. Website's "generic or brand name" holds up; it just omits the medical-necessity condition on brand | 2026-08-16 audit | hushp.harvard.edu prescription-drug-benefits page |
| `mental_health_visit_limit` | Whether there's a cap on number of mental health visits (separate dimension from the existing `mental_health_outpatient` cost-share fact) | **Silent** — neither BD nor SMB states a cap either way; doesn't contradict the website's "no limit" claim | 2026-08-16 audit | hushp.harvard.edu mental-health-coverage page |
| `vision_eyewear_coverage` | Eyewear (glasses/contacts) coverage — pediatric coinsurance tiers, adult exclusion, LASIK exclusion. No existing slot covers eyewear, only exams | **Confirmed exact match** — BD SoB p.7: pediatric 35%/55%, adult not covered | 2026-08-16 audit | hushp.harvard.edu vision-care page |

See `docs/audits/hushp-2026-08-16.md` for full context on each.
