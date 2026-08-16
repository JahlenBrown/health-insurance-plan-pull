import type { Severity, Verdict } from "@/lib/types";

const verdictStyles: Record<Verdict, string> = {
  match: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  mismatch: "bg-red-500/15 text-red-700 dark:text-red-400",
  document_conflict: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  not_findable: "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60",
};

const severityStyles: Record<Severity, string> = {
  critical: "bg-red-500/15 text-red-700 dark:text-red-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  pass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  insufficient_evidence:
    "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${verdictStyles[verdict]}`}
    >
      {verdict.replace(/_/g, " ")}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityStyles[severity]}`}
    >
      {severity.replace(/_/g, " ")}
    </span>
  );
}
