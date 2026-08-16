# Data Sync Log

This repo does not depend on `call-center-audit` at the code level. The only
coupling is the data contract below, copied by hand — no submodule, no
package. Re-copy the three files whenever the source repo changes them.

## Source of truth

`https://github.com/heschel6/call-center-audit` (private/team repo). Sync is
**one-directional**: that repo owns plan data and the slot registry; this
repo only reads.

## Files tracked

| File here | Source path | Last synced from commit |
|---|---|---|
| `data/plans/hushp-2026.json` | `data/plans/hushp-2026.json` | `4a397d86` (2026-08-16, "Group C merge: 8 new HUSHP facts, 180-day treatment-date trap, BD page zones, hard dial deny-list, not_covered markers") |
| `data/schemas/README.md` | `data/schemas/README.md` | `4a397d86` |
| `data/answer-key/plan-profile.template.json` | `data/answer-key/plan-profile.template.json` | `4a397d86` |

## How to re-sync

```bash
git clone --depth 1 https://github.com/heschel6/call-center-audit.git /tmp/cca-ref
cp /tmp/cca-ref/data/plans/*.json data/plans/
cp /tmp/cca-ref/data/schemas/README.md data/schemas/README.md
cp /tmp/cca-ref/data/answer-key/plan-profile.template.json data/answer-key/plan-profile.template.json
```

Update the commit hash in the table above after every sync. If a synced file
changes in a way that renames or removes a slot you depend on, treat that as
a breaking change — check `docs/SLOT-NAMESPACE.md` and update findings code
accordingly before merging.

**Never push to `call-center-audit`.** This repo is read-only with respect
to that one; if you need a new slot, that's a conversation with whoever owns
the registry, not a local edit here.
