import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import type { AuditRun, PlanProfile } from "./types";

const AUDITS_DIR = join(process.cwd(), "public", "data", "web-audits");
const PLANS_DIR = join(process.cwd(), "public", "data", "plans");

export interface AuditListEntry {
  file: string; // filename without .json -- used as the route slug
  run: AuditRun;
  planName: string | null;
}

export function listAudits(): AuditListEntry[] {
  if (!existsSync(AUDITS_DIR)) return [];
  const files = readdirSync(AUDITS_DIR).filter((f) => f.endsWith(".json"));
  return files
    .map((f) => {
      const run = JSON.parse(readFileSync(join(AUDITS_DIR, f), "utf-8")) as AuditRun;
      return { file: f.replace(/\.json$/, ""), run, planName: lookupPlanName(run.plan_id) };
    })
    .sort((a, b) => (a.run.audited_at < b.run.audited_at ? 1 : -1));
}

export function loadAudit(file: string): AuditListEntry | null {
  const path = join(AUDITS_DIR, `${file}.json`);
  if (!existsSync(path)) return null;
  const run = JSON.parse(readFileSync(path, "utf-8")) as AuditRun;
  return { file, run, planName: lookupPlanName(run.plan_id) };
}

function lookupPlanName(planId: string): string | null {
  if (!existsSync(PLANS_DIR)) return null;
  const files = readdirSync(PLANS_DIR).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    const profile = JSON.parse(readFileSync(join(PLANS_DIR, f), "utf-8")) as PlanProfile;
    if (profile.id === planId) return profile.plan_name;
  }
  return null;
}
