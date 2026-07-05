import { NextRequest, NextResponse } from "next/server";

import { openai, MODEL, MAX_COMPLETION_TOKENS } from "@/lib/openai";
import { personas, type PersonaKey } from "@/lib/personas";
import { buildConversation, normalizeMessages } from "@/lib/context";

function isPersonaKey(value: unknown): value is PersonaKey {
  return typeof value === "string" && value in personas;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const { persona } = body as { persona?: unknown };

    if (!isPersonaKey(persona)) {
      return NextResponse.json(
        { message: "Unknown persona." },
        { status: 400 },
      );
    }

    const messages = normalizeMessages(
      (body as { messages?: unknown }).messages,
    );

    if (messages.length === 0) {
      return NextResponse.json(
        { message: "No messages provided." },
        { status: 400 },
      );
    }

    // Re-anchor the persona's system prompt on every request; history is sent
    // as-is (no summarization/compression — this is a lightweight demo).
    const conversation = buildConversation(personas[persona], messages);

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: conversation,
      // Cap output to keep replies short and token usage low; brevity is also
      // enforced in the persona prompts.
      max_completion_tokens: MAX_COMPLETION_TOKENS,
    });

    const message = response.choices[0]?.message?.content;

    if (!message) {
      return NextResponse.json(
        { message: "The model returned an empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[/api/chat]", error);

    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
