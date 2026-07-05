# Context Management

This document describes how PersonaGPT keeps conversations coherent — isolating each persona's history, re-anchoring the system prompt on switch, and handling long threads without overflowing the context window.

The strategy is split across two layers: the **client** (`app/page.tsx`) owns per-persona history isolation, and the **server** (`app/api/chat/route.ts` + `lib/context.ts`) owns re-anchoring and long-thread compression.

## 1. Per-persona history isolation (client)

The chat UI stores conversations in a per-persona map, not a single flat array:

```ts
type Histories = Record<PersonaId, Message[]>;
const emptyHistories = { hitesh: [], piyush: [] };
```

- Each persona has its own independent thread.
- Switching persona swaps which thread is displayed and sent; it never merges the two.
- This guarantees Hitesh's voice/history can't bleed into a Piyush conversation or vice versa.

There is also a subtle correctness guard: when a message is sent, the UI **snapshots the persona the request belongs to** (`personaAtSend`) and writes the eventual reply back into *that* persona's thread. So even if the user switches personas while a response is still in flight, the reply can never land in the wrong conversation.

## 2. Clean re-anchoring on persona switch (server)

The persona system prompt is **not** patched into the middle of an ongoing conversation. Instead, `app/api/chat/route.ts` rebuilds the message list from scratch on every request:

```
[ system: persona prompt for `persona` ]   <- selected fresh each request
[ ...the conversation for that persona ]
```

Because the client already keeps histories separate and the server always re-selects the system prompt from the incoming `persona` field, a persona switch is a clean re-anchor to a new system prompt rather than an instruction spliced mid-thread. There is no "you are now someone else" message injected into an existing conversation.

## 3. Long-conversation handling: summarize, don't silently drop (server)

Sending an unbounded, ever-growing message array on every turn eventually overflows the context window and quietly degrades — the model starts "forgetting" the beginning. We handle this in `lib/context.ts` with a **keep-recent + summarize-older** strategy rather than blind truncation.

Constants (tunable in `lib/context.ts`):

```ts
export const RECENT_MESSAGES_TO_KEEP = 12; // always sent verbatim
export const SUMMARY_TRIGGER = 16;         // summarize only past this length
```

`buildConversation(systemPrompt, messages)` does:

1. **Short threads** (`messages.length <= SUMMARY_TRIGGER`): send everything verbatim — no overhead.
2. **Long threads**: keep the last `RECENT_MESSAGES_TO_KEEP` messages verbatim, and compress everything older into a single summary via a separate LLM call. The final payload becomes:

```
[ system: persona prompt ]
[ system: "Summary of the earlier conversation (for context only, keep your persona voice): …" ]
[ ...the last 12 messages verbatim ]
```

Key design points:

- **The earlier context is preserved as a summary, not dropped.** The user's stated facts, decisions already made, and open threads survive into the summary.
- **The summary is a separate, clearly-labeled `system` message placed *after* the persona prompt.** This keeps "how you talk" (persona) cleanly separated from "what was said earlier" (facts), and instructs the model to treat the summary as context only while holding its persona voice.
- **The summarizer is voice-neutral.** It's told to write a terse third-person briefing (< ~150 words) and explicitly *not* to adopt any persona — so summarization never corrupts the persona itself.
- **Fail-safe.** If the summarization call fails, we fall back to sending just the recent window rather than crashing the request. The user still gets a coherent answer to the latest turns.

### Trade-off / assumption

The summary is recomputed per request once a thread crosses the trigger, which keeps the server **stateless** (no session storage, no DB) at the cost of an extra model call on long threads. For an assignment-scale app this is the right trade — simple, no infrastructure, and easy to reason about. If this were scaled up, the natural next step would be to cache/persist the rolling summary per conversation so it isn't recomputed each turn.

## 4. Input validation

Before any of the above runs, the server validates the request in `lib/context.ts` / the route:

- `persona` must be a known key (`hitesh` | `piyush`) → otherwise `400`.
- `messages` is filtered to well-formed `{ role: "user" | "assistant", content: string }` entries; an empty result → `400`.

This keeps malformed or malicious payloads from ever reaching the model call.
