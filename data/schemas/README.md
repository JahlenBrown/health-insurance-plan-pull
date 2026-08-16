# Data Contracts — Single Source of Truth

Every agent producing or consuming audit artifacts uses these JSON shapes. The app is built against them; the design agents emit them. Change them only via a logged decision in `docs/DECISIONS.md`.

## plan-profile (`data/plans/<plan>.json`, demo: `data/demo/plan-profile.json`)

Per-plan facts. **Nothing plan-specific lives anywhere else.** (The plan-agnostic slot template lives at `data/answer-key/plan-profile.template.json`; real profiles live in `data/plans/`.)

```jsonc
{
  "id": "acme-ppo-2026",
  "plan_name": "…", "sponsor": "…", "administrator": "…",
  "funding": "self-funded-erisa | self-funded-non-erisa | insured | medicare-part-d | medicare-advantage",
  "plan_year": 2026,
  "document": { "filename": "…", "pages": 88 },
  "_sources": {                                    // REQUIRED when facts cite more than one document
    "bd-2026": { "file": "Benefit-Description-2026.pdf", "page_base": "printed" },
    "sob-2026": { "file": "…", "page_base": "pdf" }
  },
  "facts": {
    // slot_id → value + citation. Slot ids are referenced by question-bank plan_slots.
    // page is a STRING as printed ("34", "SoB p.2"); doc keys into _sources for multi-doc plans.
    "specialist_cost_share": { "value": "Deductible, then 20% coinsurance", "doc": "bd-2026", "page": "34" },
    "deductible_individual": { "value": 1500, "doc": "bd-2026", "page": "12" }
  }
}
```

**Page zones:** a single PDF may contain multiple separately-numbered documents (the HUSHP Benefit Description holds a Schedule of Benefits printed 1–9 AND a body printed 1–89). Such a source declares `page_zones` (prefix, printed range, pdf range, offset) and every fact cite MUST carry the zone prefix ("SoB p.2" vs "p.82") — a bare page number against a multi-zone document is an invalid citation.

**Dial policy (per plan):** a plan profile may declare `dial_policy`: a pinned `target` number plus a `deny_list` of numbers that must NEVER be dialed for this plan (each with a reason — e.g., the sponsor's own office is the client, not the audited party). Enforcement is server-side at call initiation: target must equal the pinned number (or carry an explicit logged override), deny-listed numbers are blocked outright, and no agent may substitute a number mid-run.

**Slot registry (canonical):** `data/answer-key/plan-profile.template.json` is the single authoritative slot namespace. Every `plan_slots` entry in the question bank MUST name a registry slot. A plan profile may leave registry slots undefined, but unresolved slots MUST surface loudly at campaign creation (question excluded or marked ungradable-on-plan-facts) — silent skips and bare uncited citations are forbidden. Grading rule: no resolved plan fact AND no regulation citation applicable to the plan's `regulatory_regime` ⇒ verdict `insufficient_evidence`, never a graded failure. Cross-regime fallback (e.g., quoting Part D clocks at a self-funded non-ERISA plan) is itself the error the audit exists to catch — graders never do it.

## question-bank (`data/question-bank.json`)

Plan-agnostic template; `plan_slots` resolve against a plan-profile at campaign time.

```jsonc
{
  "version": 1,
  "questions": [{
    "id": "PA-001",
    "category": "prior_authorization | formulary | claims | appeals_grievances | cost_sharing | eligibility | escalation | general",
    "difficulty": "basic | intermediate | edge_case",
    "type": "standard | premise_false",
    // premise_false: the question deliberately embeds a premise that is FALSE for the target plan's regime
    // (e.g. asking a self-funded student plan about "the Part D out-of-pocket threshold"). Grading INVERTS:
    // a rep who rejects the premise ("that doesn't apply to your plan") scores pass; a rep who plays along
    // and answers as if it applies scores critical. The grader must be told the premise and why it is false.
    "applies_to_regimes": ["medicare-part-d"],
    // regimes where this question is askable as standard. Omitted = all regimes. The campaign builder
    // filters by the plan's regulatory regime — regime-inapplicable standard questions NEVER enter a call plan.
    "core": true,                    // member of the always-asked screener set
    "question": "natural caller phrasing",
    "correct_answer": "what a correct rep answer must contain",
    "must_include": ["fact …"],
    "red_flags": ["statements that are critical failures if said"],
    "severity_if_wrong": "critical | warning",
    "scope": "FEDERAL | PLAN | MIXED",
    "plan_slots": ["specialist_cost_share"],
    "citations": [
      { "type": "regulation", "source": "42 CFR 423.568(b)" },
      { "type": "plan_document", "slot": "specialist_cost_share" }
    ]
  }]
}
```

## rubric (`data/rubric.json`)

```jsonc
{
  "version": 1,
  "dimensions": [{ "id": "accuracy", "name": "…", "weight": 0.35,
    "anchors": { "10": "…", "7": "…", "4": "…", "1": "…" } }],
  "grade_bands": [{ "grade": "A", "min": 90 }],
  "critical_cap": { "any_critical_max_score": 69, "rationale": "…" },
  "flag_definitions": { "critical": "…", "warning": "…", "pass": "…" }
}
```

Weights sum to 1.0. Sub-scores are 0–10; overall = Σ(sub × weight × 10), then caps applied.

## campaign (runtime; created by the wizard)

```jsonc
{
  "id": "…", "plan_profile_id": "…", "persona_id": "…",
  "question_ids": ["CS-001"],
  "target_number": "+1…",
  "attestation": {
    "basis": "own_call_center | documented_audit_rights | enrolled_member_own_plan",
    "name": "typed full name", "at": "ISO timestamp"
  },
  "disclosure_mode": "disclosed | undisclosed",   // AI-identity disclosure; default disclosed
  "recording_policy": {
    "mode": "adaptive | always | never",          // default adaptive — see agents.md guardrail #2
    "ask_if_silent": true                          // adaptive only: if callee never announces recording, ask naturally; false ⇒ transcript-only
  },
  "card": {                                        // insurance-card scan IS the campaign config (user spec 2026-08-16)
    "image_refs": ["sensitive-blob ids"],          // raw images live ONLY in the sensitive blob store — never the repo tree, never logs
    "extracted": {
      "member_id_masked": "****1234",             // raw member ID: sensitive store only; resolved by the voice layer at the moment a rep asks
      "group_number_masked": "****5678",
      "rx_bin": "…", "rx_pcn": "…", "rx_group": "…",   // routing codes, not PII — unmasked is fine
      "administrator": "…", "effective_date": "…",
      "member_services_number": "+1…",            // default call target — "the number on your ID card"
      "pharmacy_number": "+1…"
    },
    "manual_override": false                       // true when hand-entered because card absent/unreadable
  },
  "call_plan": {                                   // multi-call fan-out is core, not stretch
    "num_calls": 3,
    "max_questions_per_call": 6,                   // shard the bank; one call must never sound like a quiz
    "repeat_core_across_calls": true               // core screener repeats on every call → feeds consistency scoring
  }
}
```

**Sensitive-data handling (product rule, not env config):** card data is secured by *handling* — encrypted at rest in the storage abstraction, masked by default in every downstream surface (UI, transcripts, logs, scorecards), the grading LLM receives a redacted placeholder token (never the raw member ID), and only the telephony/voice layer resolves the real value at call time. No member PII in committed files, ever.

## campaign-scorecard (aggregate across a campaign's calls)

```jsonc
{
  "campaign_id": "…", "calls_completed": 3,
  "avg_score": 61, "grade": "D",
  "consistency": [{                                // CROSS-CALL CONSISTENCY — first-class audit finding (GAO methodology)
    "question_id": "CS-001",
    "n_asked": 3, "n_agreeing": 1,
    "answers": [{ "call_id": "…", "rep_answer_summary": "…", "correct": false }],
    "consistent": false,                           // did different reps give materially different answers?
    "divergence_type": "reps_disagree | document_conflict | single_outlier",
    // document_conflict: the plan's own materials contradict each other (e.g. 30- vs 60-day Rx supply) —
    // a rep quoting the plan's published Summary is NOT simply "wrong"; the finding indicts the documents.
    "truth": "governing-document answer, when one governs",
    "citation": { "type": "plan_document", "doc": "bd-2026", "page": "…" },
    "severity": "critical | warning | pass",       // divergence on a benefits fact is itself a finding, even if one rep was right
    "explanation": "…"
  }]
}
```

## transcript (`data/demo/transcript.json`, runtime: per-call)

```jsonc
{
  "call_id": "…", "campaign_id": "…", "persona": "…",
  "target_number_masked": "+1••••••1234",
  "placed_at": "2026-08-16T14:02:00Z",
  "metrics": { "time_to_human_seconds": 272, "transfers": 1, "total_seconds": 812 },
  "recording": {
    "disclosure_detected": true,                   // did THEIR side announce recording?
    "disclosure_quote": "This call may be recorded…",
    "disclosure_t": 0,
    "audio_recorded": true,
    "consent_basis": "their_announcement | asked_and_granted | not_recorded"
  },
  "turns": [{ "t": 0, "speaker": "auditor | rep | ivr", "text": "…", "question_id": "CS-001" }]
}
```

## scorecard (runtime output; demo: `data/demo/scorecard.json`)

```jsonc
{
  "call_id": "…", "overall_score": 58, "overall_grade": "D-",
  "capped_by_critical": true,
  "sub_scores": [{ "dimension": "accuracy", "score": 6, "weight": 0.35, "explanation": "…" }],
  "summary_60s": "plain-English paragraph a non-clinical manager reads in under a minute",
  "flags": [{
    "severity": "critical | warning | pass | insufficient_evidence",
    "question_id": "CS-001",
    "rep_said": "verbatim quote",
    "truth": "what the document/regulation says (omit for insufficient_evidence)",
    "citation": { "type": "plan_document", "doc": "bd-2026", "page": "34" },
    "note": "optional context — e.g. 'correct but incomplete; plan's own Summary conflicts'",
    "transcript_t": 305
  }]
}
```

The scorecard's `flags` array IS the demo: rep quote vs. document truth vs. page number, color-coded.
