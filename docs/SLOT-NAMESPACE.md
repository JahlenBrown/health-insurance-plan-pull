# Slot Namespace — read this before writing any extraction code

The single most expensive mistake on the sibling project was two agents
independently inventing slot names for the same fact (`deductible_individual`
vs `deductible_individual_in_network`) — 53 names declared, 36 defined, 6
matched, everything else silently resolved to nothing. Don't repeat it here.

## Current state (as of sync commit `4a397d86`, 2026-08-16)

There are **two** slot vocabularies in the synced data right now, and they
disagree:

- `data/answer-key/plan-profile.template.json` — the file `call-center-audit`
  designates canonical in its own `docs/DECISIONS.md`. Uses short names:
  `deductible_individual`, `oop_max_individual`, `rx_tier_1`.
- `data/plans/hushp-2026.json` — the actual, real plan profile with page
  citations. Uses longer names: `deductible_individual_in_network`,
  `oop_max_medical_in_network`, `rx_tier_1_retail`.

This is a **known, open issue on their side** — `call-center-audit`'s
`docs/DECISIONS.md` records a slot-rename pass that's deferred until their
Phase 1 workflow lands, specifically to avoid a write collision. It is not
something to fix here, and not something to wait on either.

## Rule for this repo

**Match against `data/plans/<plan>.json` `facts` keys, not the template.**
That file is what a real plan actually contains, it's what you're diffing
website content against, and per the project split's own briefing the
in_network/out_of_network-suffixed, retail/mail-split style used there is
meant to become canonical once the rename lands. The template is a preview
of a future shape, not the current contract.

Concretely:

- If you need a fact and a `facts` key for it already exists in the plan
  profile — e.g. `pcp_cost_share`, `internal_appeal_window` — cite it by that
  exact key, character for character.
- If you need a fact that has **no** key in the plan profile, do not coin
  one. Add it to `docs/NEEDED-SLOTS.md` in this repo (create if absent) and
  flag it back to whoever owns `call-center-audit` — the same rule the
  briefing states: request a slot, don't invent it locally.
- If/when the upstream rename lands and the template and profile converge,
  re-sync (`docs/SYNC.md`) and delete this note's "current state" section —
  the mismatch it describes will no longer exist.

## Why this matters for cross-referencing

The whole point of sharing the namespace is that a finding like "the rep
said $250, the website says $250, the booklet says $0 in-network" only
works if both tools cite `deductible_individual_out_of_network` — not one
tool's `deductible_individual` and another's `deductible_out_of_network`
that happen to mean almost but not quite the same thing.
