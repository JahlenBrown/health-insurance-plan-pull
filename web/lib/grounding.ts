import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { listAudits } from "./audits";

const PLANS_DIR = join(process.cwd(), "public", "data", "plans");

export interface PlanOption {
  id: string;
  plan_name: string;
}

export function listPlans(): PlanOption[] {
  if (!existsSync(PLANS_DIR)) return [];
  return readdirSync(PLANS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const p = JSON.parse(readFileSync(join(PLANS_DIR, f), "utf-8"));
      return { id: p.id as string, plan_name: p.plan_name as string };
    });
}

/**
 * Builds the exact text handed to the model as ground truth. Nothing in
 * the system prompt may be answered from outside this block -- see the
 * system prompt in app/api/ask/route.ts for the enforcement rules.
 */
export function buildGroundingContext(planId: string): string | null {
  if (!existsSync(PLANS_DIR)) return null;
  const file = readdirSync(PLANS_DIR)
    .filter((f) => f.endsWith(".json"))
    .find((f) => {
      const p = JSON.parse(readFileSync(join(PLANS_DIR, f), "utf-8"));
      return p.id === planId;
    });
  if (!file) return null;

  const profile = JSON.parse(readFileSync(join(PLANS_DIR, file), "utf-8"));
  const audits = listAudits().filter((a) => a.run.plan_id === planId);

  const parts: string[] = [];

  parts.push(`PLAN: ${profile.plan_name}`);
  parts.push(`SPONSOR: ${profile.sponsor}`);
  parts.push(`ADMINISTRATOR: ${profile.administrator}`);
  parts.push(`FUNDING / REGULATORY REGIME: ${profile.funding}`);
  if (profile.regulatory_regime?.summary) {
    parts.push(`REGIME NOTES: ${profile.regulatory_regime.summary}`);
  }
  if (profile.regulatory_regime?.not_applicable?.length) {
    parts.push(
      "REGIMES THAT DO NOT APPLY (never answer as if these govern this plan): " +
        profile.regulatory_regime.not_applicable
          .map((r: { regime: string }) => r.regime)
          .join("; ")
    );
  }

  parts.push("\nFACTS (slot: value [source]):");
  for (const [slot, fact] of Object.entries(
    profile.facts as Record<string, { value: unknown; doc?: string; page?: string }>
  )) {
    parts.push(`- ${slot}: ${JSON.stringify(fact.value)} [${fact.doc ?? "?"} ${fact.page ?? "?"}]`);
  }

  if (profile.not_covered) {
    parts.push("\nFACTS EXPLICITLY NOT FOUND IN THE PLAN DOCUMENTS (say so if asked, don't guess):");
    for (const [slot, note] of Object.entries(
      profile.not_covered as Record<string, string>
    )) {
      if (slot === "_rule") continue;
      parts.push(`- ${slot}: ${note}`);
    }
  }

  if (profile.audit_guidance) {
    parts.push("\nKNOWN TRAPS / CRITICAL FAILURE PATTERNS FOR THIS PLAN:");
    for (const f of profile.audit_guidance.critical_failures ?? []) {
      parts.push(`- CRITICAL if stated: ${f}`);
    }
    for (const f of profile.audit_guidance.warning_failures ?? []) {
      parts.push(`- WARNING if stated: ${f}`);
    }
  }

  for (const { run } of audits) {
    const mismatches = run.findings.filter(
      (f) => f.verdict === "mismatch" || f.verdict === "document_conflict"
    );
    if (mismatches.length) {
      parts.push(
        `\nKNOWN DISCREPANCIES between ${run.site} and the plan documents (mention if relevant to the question):`
      );
      for (const f of mismatches) {
        parts.push(
          `- ${f.slot} (${f.verdict}): website says "${f.website_value}"; document says "${f.document_value}"`
        );
      }
    }
  }

  return parts.join("\n");
}
