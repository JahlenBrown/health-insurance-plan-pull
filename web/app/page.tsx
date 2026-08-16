import Link from "next/link";
import { listAudits } from "@/lib/audits";

export default function HomePage() {
  const audits = listAudits();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Runs</h1>
        <p className="mt-2 text-black/60 dark:text-white/60 max-w-2xl">
          Each run checks a health plan&apos;s public website (and any linked
          PDFs) against its governing plan documents, citing a page a human
          can verify for every finding.
        </p>
      </div>

      {audits.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          No audit runs found in <code>data/web-audits/</code> yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {audits.map(({ file, run, planName }) => (
            <Link
              key={file}
              href={`/audit/${file}`}
              className="block rounded-lg border border-black/10 dark:border-white/10 p-5 hover:border-black/25 dark:hover:border-white/25 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h2 className="font-medium">{planName ?? run.plan_id}</h2>
                <span className="text-xs text-black/50 dark:text-white/50">
                  {new Date(run.audited_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {run.site}
              </p>
              <div className="mt-3 flex gap-4 text-sm">
                <Stat label="match" value={run.summary.match} tone="emerald" />
                <Stat
                  label="mismatch"
                  value={run.summary.mismatch}
                  tone="red"
                />
                <Stat
                  label="conflict"
                  value={run.summary.document_conflict}
                  tone="amber"
                />
                <Stat
                  label="not findable"
                  value={run.summary.not_findable}
                  tone="gray"
                />
                <Stat
                  label="needs slot"
                  value={run.summary.needs_slot}
                  tone="gray"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "red" | "amber" | "gray";
}) {
  const toneClass = {
    emerald: "text-emerald-700 dark:text-emerald-400",
    red: "text-red-700 dark:text-red-400",
    amber: "text-amber-700 dark:text-amber-400",
    gray: "text-black/50 dark:text-white/50",
  }[tone];
  return (
    <span className="flex items-baseline gap-1">
      <span className={`font-semibold ${toneClass}`}>{value}</span>
      <span className="text-black/50 dark:text-white/50">{label}</span>
    </span>
  );
}
