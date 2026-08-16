# Triangulation: Phone Rep vs Website vs Plan Document — HUSHP Rx Costs

This is the cross-tool check the project split was built for: a
`call-center-audit` call transcript (supplied by the user, not pulled from
that repo — nothing there was read or written for this file) checked
against this repo's web audit of the same plan
(`docs/audits/hushp-2026-08-16.md`) and the governing plan document
(`data/plans/hushp-2026.json`).

## Input transcript

```
Company: Hello this is Acme Corporation. How can I help you?
AI Agent: Hello. I have a question regarding my plan benefits.
Company: Ok great. Can I please have your member ID number?
AI Agent: My ID Number is 1234567890
Company: Great, thank you for verifying. How can I help?
AI Agent: I want to know how much prescriptions cost on my plan.
Company: Ok one moment.
Company: Prescriptions typically cost $17 for a 30-day supply for tier 1 drugs. For tier 2 drugs they cost $35 and for tier 3 they cost $55.
AI Agent: Ok, thank you for the help.
```

Note: the transcript identifies the answering party as "Acme Corporation," not Blue Cross Blue Shield of Massachusetts (the actual administrator per the plan profile, and the name on `dial_policy.target_label`). Treated here as a placeholder for the exercise, not a finding — flagged only for completeness.

## Claims extracted from the call

| Slot | Rep said |
|---|---|
| `rx_tier_1_retail` | $17, 30-day supply |
| `rx_tier_2_retail` | $35 |
| `rx_tier_3_retail` | $55 |

## Triangulated comparison

| Slot | Rep said | Website says (this repo's 2026-08-16 audit) | Document says | Verdict | Citation |
|---|---|---|---|---|---|
| `rx_tier_1_retail` | $17 | $17 | $17 copayment, Tier 1, retail, per 30-day supply | **pass** — all three agree | BD SoB p.6 |
| `rx_tier_2_retail` | **$35** | $40 | $40 copayment, Tier 2, retail, per 30-day supply | **critical** — rep understated the cost by $5; website and document independently agree with each other and disagree with the rep | BD SoB p.6 |
| `rx_tier_3_retail` | $55 | $55 | $55 copayment, Tier 3, retail, per 30-day supply | **pass** — all three agree | BD SoB p.6 |

## The one real finding

The rep's Tier 2 figure ($35) doesn't match either independent source
(website: $40, document: $40) — and $35 isn't a random number: it's this
plan's **medical office-visit copay** (`pcp_cost_share` / `specialist_cost_share`,
also BD SoB p.5), not a pharmacy figure at all. The likely failure mode is
the rep conflating the flat $35 medical copay that appears elsewhere in the
same Schedule of Benefits with the Tier 2 drug copay, rather than a random
transcription slip — worth noting in a real audit, since it suggests a
training gap (mixing up cost-share categories) rather than a one-off
misstatement.

This is exactly the finding neither tool produces alone: a web audit run by
itself has no rep answer to check against, and a call audit run by itself
has no independent confirmation that $40 (not $35) is actually correct in
two places outside the rep's own claim.

## What's out of scope here

The rep's answer only covered the flat per-tier copay; it didn't mention
the retail 30-day supply limit for Tiers 2/3 (implied but not restated),
mail-order pricing, the separate Rx out-of-pocket max, or the Tier
1/brand contraceptive $0 waiver. The question asked was narrow ("how much
do prescriptions cost"), so this is a completeness note, not a finding —
call-center-audit's own rubric would be the place to grade completeness,
not this repo.
