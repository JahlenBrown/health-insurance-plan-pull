import Link from "next/link";
import { listPlans } from "@/lib/grounding";
import { AskChat } from "@/components/AskChat";

export default function AskPage() {
  const plans = listPlans();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-black/50 dark:text-white/50 hover:underline"
        >
          ← All audits
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Ask About Coverage
        </h1>
        <p className="mt-2 text-black/60 dark:text-white/60 max-w-2xl">
          Answers are grounded in this plan&apos;s extracted facts and their
          page citations -- the same data behind the audit findings, not a
          general-knowledge chatbot.
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          No plan profiles found in <code>data/plans/</code>.
        </p>
      ) : (
        <AskChat plans={plans} />
      )}
    </div>
  );
}
