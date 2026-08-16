"use client";

import { useState } from "react";
import type { PlanOption } from "@/lib/grounding";

interface Turn {
  question: string;
  answer?: string;
  error?: string;
}

export function AskChat({ plans }: { plans: PlanOption[] }) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setQuestion("");
    setLoading(true);
    const index = turns.length;
    setTurns((t) => [...t, { question: q }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, planId }),
      });
      const data = await res.json();
      setTurns((t) => {
        const copy = [...t];
        copy[index] = res.ok
          ? { question: q, answer: data.answer }
          : { question: q, error: data.error ?? "Something went wrong." };
        return copy;
      });
    } catch {
      setTurns((t) => {
        const copy = [...t];
        copy[index] = { question: q, error: "Network error -- couldn't reach the API." };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {plans.length > 1 && (
        <div>
          <label className="text-sm text-black/60 dark:text-white/60 mr-2">
            Plan
          </label>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="rounded-md border border-black/10 dark:border-white/10 bg-transparent px-2 py-1 text-sm"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.plan_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-4">
        {turns.length === 0 && (
          <p className="text-black/50 dark:text-white/50 text-sm">
            Ask something like &quot;How much do prescriptions cost on my
            plan?&quot; or &quot;Do I need a referral to see a
            specialist?&quot; Answers are grounded only in the extracted
            plan facts -- if something isn&apos;t in there, it'll say so
            rather than guess.
          </p>
        )}
        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            <div className="rounded-lg bg-black/5 dark:bg-white/5 px-4 py-2 text-sm inline-block max-w-full">
              <span className="font-medium">You: </span>
              {t.question}
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 px-4 py-3 text-sm">
              {t.error ? (
                <span className="text-red-700 dark:text-red-400">
                  {t.error}
                </span>
              ) : t.answer ? (
                <span className="whitespace-pre-wrap">{t.answer}</span>
              ) : (
                <span className="text-black/40 dark:text-white/40 italic">
                  thinking…
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={ask} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a coverage question…"
          className="flex-1 rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
          disabled={loading || !planId}
        />
        <button
          type="submit"
          disabled={loading || !planId || !question.trim()}
          className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          {loading ? "Asking…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
