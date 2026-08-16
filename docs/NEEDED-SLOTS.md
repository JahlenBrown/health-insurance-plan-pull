# Needed Slots

Facts this repo's audits have found on a carrier/plan website with no
matching key in the shared slot registry (`data/answer-key/plan-profile.template.json`
or a plan's own `data/plans/<plan>.json` `facts`). Per the project-split
rule, we don't invent slot names locally — these get proposed upstream to
whoever owns `call-center-audit`'s registry.

Remove an entry once a real slot exists for it and update the citing audit
report to use the real name.

## Open requests

| Proposed name | What it captures | First seen | Source |
|---|---|---|---|
| `rx_pbm_subcontractor` | Name of the PBM handling out-of-network pharmacy claims (e.g. "CVS Caremark") — the plan profile's `rx_administrator` fact explicitly notes this isn't stated in any plan document | 2026-08-16 audit | hushp.harvard.edu prescription-drug-benefits page |
| `rx_antimalarial_cost_share` | Coinsurance rate for antimalarial drugs (distinct tier structure from standard Rx tiers) | 2026-08-16 audit | hushp.harvard.edu prescription-drug-benefits page |
| `rx_contraceptive_waiver_scope` | Which contraceptive products get the $0 waiver — profile's existing note only documents Tier-1/generic; website says "generic or brand name" | 2026-08-16 audit | hushp.harvard.edu prescription-drug-benefits page |
| `mental_health_visit_limit` | Whether there's a cap on number of mental health visits (separate dimension from the existing `mental_health_outpatient` cost-share fact) | 2026-08-16 audit | hushp.harvard.edu mental-health-coverage page |
| `vision_eyewear_coverage` | Eyewear (glasses/contacts) coverage — pediatric coinsurance tiers, adult exclusion, LASIK exclusion. No existing slot covers eyewear, only exams | 2026-08-16 audit | hushp.harvard.edu vision-care page |

See `docs/audits/hushp-2026-08-16.md` for full context on each.
