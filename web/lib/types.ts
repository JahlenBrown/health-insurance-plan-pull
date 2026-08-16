export type Verdict = "match" | "mismatch" | "document_conflict" | "not_findable";
export type Severity = "critical" | "warning" | "pass" | "insufficient_evidence";

export interface Citation {
  type: string;
  doc?: string;
  page?: string;
  source?: string;
}

export interface Finding {
  slot: string;
  verdict: Verdict;
  severity: Severity;
  website_value?: string | null;
  website_source?: string;
  document_value?: string;
  citation?: Citation | Citation[];
  note?: string;
}

export interface NeededSlot {
  proposed_name: string;
  website_value?: string;
  website_source?: string;
  document_value?: string;
  citation?: Citation | Citation[];
  note?: string;
}

export interface DocumentFetched {
  url?: string;
  local_path?: string;
  access?: "public" | "member_portal_manual_download";
  pages_extracted?: string;
  method?: string;
  page_zone_used?: string;
  sha256?: string;
  note?: string;
}

export interface AuditSummary {
  total_findings: number;
  match: number;
  mismatch: number;
  document_conflict: number;
  not_findable: number;
  needs_slot: number;
}

export interface AuditRun {
  schema_version: number;
  revision?: string;
  plan_id: string;
  site: string;
  audited_at: string;
  pages_crawled: string[];
  documents_fetched?: DocumentFetched[];
  plan_profile_source: {
    repo: string;
    commit: string;
    file: string;
  };
  findings: Finding[];
  needs_slot: NeededSlot[];
  summary: AuditSummary;
}

export interface PlanProfile {
  id: string;
  plan_name: string;
  sponsor: string;
  administrator: string;
  funding: string;
  plan_year: number;
  [key: string]: unknown;
}
