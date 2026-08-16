import Link from "next/link";
import { notFound } from "next/navigation";
import { listAudits, loadAudit } from "@/lib/audits";
import { VerdictBadge, SeverityBadge } from "@/components/Badge";
import type { Citation } from "@/lib/types";

export function generateStaticParams() {
  return listAudits().map(({ file }) => ({ file }));
}

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ file: string }>;
}) {
  const { file } = await params;
  const entry = loadAudit(file);
  if (!entry) notFound();
  const { run, planName } = entry;

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/"
          className="text-sm text-black/50 dark:text-white/50 hover:underline"
        >
          ← All audits
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {planName ?? run.plan_id}
        </h1>
        <p className="mt-1 text-black/60 dark:text-white/60">
          vs {run.site} · audited {new Date(run.audited_at).toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-black/40 dark:text-white/40">
          plan profile: {run.plan_profile_source.file} @{" "}
          {run.plan_profile_source.commit} ({run.plan_profile_source.repo})
        </p>
        {run.revision && (
          <p className="mt-4 rounded-md bg-black/5 dark:bg-white/5 p-3 text-sm text-black/70 dark:text-white/70">
            {run.revision}
          </p>
        )}
      </div>

      <SummaryStrip summary={run.summary} />

      <Section title="Sources">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-black/60 dark:text-white/60 mb-2">
              Pages crawled
            </h3>
            <ul className="space-y-1 text-sm">
              {run.pages_crawled.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    className="text-blue-700 dark:text-blue-400 hover:underline break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-black/60 dark:text-white/60 mb-2">
              Documents fetched
            </h3>
            <ul className="space-y-3 text-sm">
              {(run.documents_fetched ?? []).map((doc, i) => (
                <li
                  key={i}
                  className="rounded-md border border-black/10 dark:border-white/10 p-3"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {doc.access === "member_portal_manual_download" ? (
                      <span className="inline-flex items-center rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 px-2 py-0.5 text-xs font-medium">
                        member portal (manual)
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-black/10 dark:bg-white/10 px-2 py-0.5 text-xs font-medium text-black/60 dark:text-white/60">
                        public
                      </span>
                    )}
                    {doc.method && (
                      <span className="text-xs text-black/40 dark:text-white/40">
                        {doc.method}
                      </span>
                    )}
                  </div>
                  {doc.url && (
                    <a
                      href={doc.url}
                      className="mt-1 block text-blue-700 dark:text-blue-400 hover:underline break-all"
                    >
                      {doc.url}
                    </a>
                  )}
                  {doc.local_path && (
                    <code className="mt-1 block text-xs break-all">
                      {doc.local_path}
                    </code>
                  )}
                  {doc.pages_extracted && (
                    <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                      pages: {doc.pages_extracted}
                    </p>
                  )}
                  {doc.sha256 && (
                    <p className="mt-1 text-xs text-black/40 dark:text-white/40 break-all">
                      sha256: {doc.sha256}
                    </p>
                  )}
                  {doc.note && (
                    <p className="mt-2 text-xs text-black/60 dark:text-white/60">
                      {doc.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title={`Findings (${run.findings.length})`}>
        <div className="space-y-3">
          {run.findings.map((f) => (
            <div
              key={f.slot}
              className="rounded-lg border border-black/10 dark:border-white/10 p-4"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <code className="text-sm font-medium">{f.slot}</code>
                <div className="flex gap-2">
                  <VerdictBadge verdict={f.verdict} />
                  <SeverityBadge severity={f.severity} />
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-black/40 dark:text-white/40 mb-1">
                    Website says
                  </div>
                  <p>
                    {f.website_value ?? (
                      <span className="text-black/40 dark:text-white/40 italic">
                        not stated on any crawled page
                      </span>
                    )}
                  </p>
                  {f.website_source && (
                    <a
                      href={f.website_source}
                      className="mt-1 block text-xs text-blue-700 dark:text-blue-400 hover:underline break-all"
                    >
                      {f.website_source}
                    </a>
                  )}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-black/40 dark:text-white/40 mb-1">
                    Document says
                  </div>
                  <p>{f.document_value}</p>
                  <CitationLine citation={f.citation} />
                </div>
              </div>
              {f.note && (
                <p className="mt-3 text-sm text-black/60 dark:text-white/60 border-t border-black/10 dark:border-white/10 pt-3">
                  {f.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title={`Needs New Slot (${run.needs_slot.length})`}>
        <div className="space-y-3">
          {run.needs_slot.map((n) => (
            <div
              key={n.proposed_name}
              className="rounded-lg border border-dashed border-black/20 dark:border-white/20 p-4"
            >
              <code className="text-sm font-medium">{n.proposed_name}</code>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-black/40 dark:text-white/40 mb-1">
                    Website says
                  </div>
                  <p>{n.website_value}</p>
                  {n.website_source && (
                    <a
                      href={n.website_source}
                      className="mt-1 block text-xs text-blue-700 dark:text-blue-400 hover:underline break-all"
                    >
                      {n.website_source}
                    </a>
                  )}
                </div>
                {n.document_value && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-black/40 dark:text-white/40 mb-1">
                      Document says
                    </div>
                    <p>{n.document_value}</p>
                    <CitationLine citation={n.citation} />
                  </div>
                )}
              </div>
              {n.note && (
                <p className="mt-3 text-sm text-black/60 dark:text-white/60 border-t border-black/10 dark:border-white/10 pt-3">
                  {n.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function CitationLine({ citation }: { citation?: Citation | Citation[] }) {
  if (!citation) return null;
  const cites = Array.isArray(citation) ? citation : [citation];
  return (
    <p className="mt-1 text-xs text-black/50 dark:text-white/50">
      {cites
        .map((c) => (c.doc && c.page ? `${c.doc} ${c.page}` : c.source ?? ""))
        .filter(Boolean)
        .join(" · ")}
    </p>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight mb-4">{title}</h2>
      {children}
    </section>
  );
}

function SummaryStrip({
  summary,
}: {
  summary: {
    match: number;
    mismatch: number;
    document_conflict: number;
    not_findable: number;
    needs_slot: number;
  };
}) {
  const items: [string, number, string][] = [
    ["match", summary.match, "text-emerald-700 dark:text-emerald-400"],
    ["mismatch", summary.mismatch, "text-red-700 dark:text-red-400"],
    [
      "document conflict",
      summary.document_conflict,
      "text-amber-700 dark:text-amber-400",
    ],
    [
      "not findable",
      summary.not_findable,
      "text-black/50 dark:text-white/50",
    ],
    ["needs slot", summary.needs_slot, "text-black/50 dark:text-white/50"],
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {items.map(([label, value, tone]) => (
        <div
          key={label}
          className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-center"
        >
          <div className={`text-2xl font-semibold ${tone}`}>{value}</div>
          <div className="mt-1 text-xs text-black/50 dark:text-white/50">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
