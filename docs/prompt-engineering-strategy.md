# Prompt Engineering Strategy

This document explains how the persona prompts are designed and why. The goal is **persona accuracy that holds over a long conversation**, using the smallest prompt that reliably does the job.

## 1. Lean system prompt, loaded from disk

Each persona is a single plain-text file (`lib/persona.hitesh.md`, `lib/persona.piyush.md`) that is read at runtime and injected verbatim as the `system` message:

```
[system] = contents of lib/persona.<key>.md
[...conversation turns]
```

Keeping the prompt in a dedicated file (rather than inline in code) means the *voice* can be iterated on without touching application logic, and it keeps the two personas as fully separate documents so their traits never blend.

The files are intentionally **lean**. We inject only the parts that change model behavior:

- **Identity** — who is speaking, grounded in real facts.
- **Voice & vocabulary** — concrete patterns (code-switching, catchphrases, rhythm), not vague adjectives.
- **Teaching method** — the *structure* of an explanation, e.g. Hitesh's "problem → why → mental model → code → common mistakes", Piyush's "real problem → build a working thing → understand why it scales".
- **Boundaries** — what keeps the persona from drifting or hallucinating.
- **A few tightly-chosen few-shot examples.**

We deliberately avoid stuffing the prompt with restated adjectives ("be friendly, be energetic, be helpful, be clear…"). Past a point, extra description doesn't improve fidelity — it dilutes the model's attention and burns tokens. The richer, fully-sourced research lives in `docs/` and `lib/persona.md`, **not** in the injected prompt.

## 2. Few-shot examples to anchor tone

Description tells the model what to *be*; examples show it. Each persona file ends with 3–4 short exchanges chosen for **variety of context** rather than volume:

- a technical explanation,
- a career / "should I bother" question,
- a "why should I learn this" question,
- a gentle correction of a misconception.

Four well-chosen examples anchor tone far better than ten similar ones. They are written in the persona's real register but are **style-matched constructions, not verbatim quotes** — we don't put invented words in a real person's mouth (see [persona data collection](./persona-data-collection.md)).

## 3. Domain-specific override pattern (Hitesh / productivity)

Some topics have a *specific, non-generic* stance that a base persona description won't reliably reproduce. Hitesh's take on productivity and time management is the clearest example: left to defaults, an LLM will happily dispense generic self-help ("wake up at 5am", "do a digital detox"), which is exactly *not* how Hitesh talks about it.

So the Hitesh prompt contains a **strict domain override**: a hard rule that triggers on any productivity / burnout / time-management / work-life-balance question and replaces generic advice with his actual framework:

- "Time management is a myth — you manage people and expectations, not time."
- The **Two Circles** rule (one thing you want to do, one thing others need from you; everything else is filler).
- Curate your feed instead of detoxing — "modern problems require modern solutions".
- Treat a bad day like a system failure — "restart works", no guilt, resume tomorrow.
- Plus a small set of signature lines to use verbatim in this domain only.

**Why a targeted override instead of more general description?** General persona instructions govern *style*; they don't reliably override the model's strong prior for a specific *topic*. Pinning the exact stance and phrasing for that one domain is what makes the persona feel genuinely like the person on the topic they're known for, without bloating the rest of the prompt. This override pattern is reusable — any persona can get a scoped "on topic X, here's the exact take" block where a generic answer would break character.

## 4. Boundaries as part of the prompt

Both prompts include explicit boundaries: never break character or claim to be an AI; no medical / legal / specific financial advice (deflect in-voice to a real professional); don't invent unverified personal facts; redirect out-of-lane questions back toward tech/career. Piyush additionally never badmouths other creators (he's collaborative). These are verified live in [sample conversations](./sample-conversations.md) — e.g. Piyush declining to give stock picks while staying fully in character.

## 5. Re-anchoring on every request

The system prompt is prepended **fresh on every request** based on the `persona` field (see `app/api/chat/route.ts`). Persona switching is therefore a clean re-anchor to a new system prompt, never a mid-thread patch. This is covered in detail in [context management](./context-management.md).
