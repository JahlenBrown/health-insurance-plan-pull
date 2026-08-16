import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildGroundingContext, listPlans } from "@/lib/grounding";

export const runtime = "nodejs";
// Explicit cap so a stuck request dies cleanly server-side rather than
// running indefinitely -- the client also times out on its own (see
// REQUEST_TIMEOUT_MS in components/AskChat.tsx) but this is the backstop.
export const maxDuration = 60;

const SYSTEM_PROMPT_TEMPLATE = (facts: string) => `You are a coverage-question assistant for a specific health insurance plan. You answer ONLY using the FACTS block below, extracted from the plan's own governing documents with page citations.

Rules -- breaking any of these is a critical failure, not a style preference:

1. Never state a number, rule, or coverage detail that is not explicitly present in the FACTS block. If something isn't in there, say plainly it's not in the available plan facts and that the member should check with the plan administrator directly -- never estimate, infer, or fall back on general insurance knowledge to fill the gap.
2. Every factual claim ends with a bracketed citation copied exactly from the FACTS block, e.g. [BD SoB p.6]. No citation, no claim.
3. Never apply a regulatory framework (ERISA, Medicare Part D, etc.) unless REGIME NOTES explicitly says it applies to this plan. If the question assumes something listed under REGIMES THAT DO NOT APPLY, say plainly that regime doesn't govern this plan.
4. If KNOWN DISCREPANCIES lists a conflict relevant to the question, surface both the website's and the document's version rather than silently picking one as correct.
5. If the question's premise is factually wrong for this specific plan, correct the premise rather than answering as if it were true.
6. Keep answers to a couple of sentences -- this is a phone-rep-style answer, not a document dump.
7. Plain text only -- no markdown (no **bold**, no bullet lists, no headers). This renders in a plain chat bubble that doesn't interpret markdown, so formatting characters would show up literally.

FACTS:
${facts}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set. Add it as an environment variable in your Vercel project settings (or web/.env.local for local dev) -- see web/README.md.",
      },
      { status: 500 }
    );
  }

  let body: { question?: string; planId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  const planId = body.planId ?? listPlans()[0]?.id;
  if (!planId) {
    return NextResponse.json({ error: "No plan available" }, { status: 404 });
  }

  const facts = buildGroundingContext(planId);
  if (!facts) {
    return NextResponse.json(
      { error: `No plan profile found for plan_id "${planId}"` },
      { status: 404 }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      // Was 512 -- a real answer with multiple facts plus a document-conflict
      // caveat can run past that and get cut off mid-citation. 1024 gives
      // headroom; stop_reason below still surfaces it if it ever recurs
      // rather than silently truncating.
      max_tokens: 1024,
      system: SYSTEM_PROMPT_TEMPLATE(facts),
      messages: [{ role: "user", content: question }],
    });

    const answer = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n");

    const truncated = message.stop_reason === "max_tokens";

    return NextResponse.json({ answer, planId, truncated });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Anthropic API request failed: ${detail}` },
      { status: 502 }
    );
  }
}
