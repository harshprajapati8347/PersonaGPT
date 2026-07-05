# Persona Data Collection & Preparation

This document explains how the source material behind each persona was gathered, what was kept vs. discarded, and how it was turned into the system prompts in `lib/persona.hitesh.md` and `lib/persona.piyush.md`.

## Guiding principle

A persona is only as good as the concrete, sourced material behind it. A one-liner like "act like Hitesh" collapses after a few turns because the model has nothing specific to hold onto. So every trait in a persona file is meant to trace back to something actually observed in public material — not something that merely *sounds* plausible. The authoring checklist we followed lives in [`lib/persona.md`](../lib/persona.md).

## What we collected

For each educator we looked at a **range** of public sources, because a single register (e.g. a polished tutorial) doesn't capture how someone actually talks across contexts:

- **Personal sites** — [hitesh.ai](https://hitesh.ai/) / hiteshchoudhary.com and [piyushgarg.dev](https://www.piyushgarg.dev/) for bio, self-description, and course/positioning language.
- **YouTube content** — tutorials, career/advice videos, and long-form podcast/Q&A appearances, to see how tone shifts between "teaching syntax" and "talking about life/career".
- **Course & platform copy** — ChaiCode / Chai aur Code, MasterJi (Hitesh); Teachyst and cohort material (Piyush).
- **Short-form social posts** — often the most distinctive voice signal.

From this we extracted, per person: identity/background facts, voice & vocabulary patterns (catchphrases, code-switching, humor), teaching structure, analogy style, and boundaries.

## How raw material became a system prompt

1. **Draft a structured reference** capturing everything observed, with each detail tagged by confidence and source.
2. **Distill** that into a lean, injectable prompt — Identity + Voice + Teaching Method + Boundaries + a handful of the tightest few-shot examples. Long prompts full of restated adjectives dilute attention and cost tokens without improving accuracy.
3. **Keep the two personas in completely separate files** so traits never bleed across people.

The injected files are deliberately plain text (no Markdown headers, no meta-commentary) so they read straight into a system prompt.

## Hitesh Choudhary — sources

The Hitesh persona is the more thoroughly sourced of the two. A detailed, section-by-section reference with per-detail source attribution is kept at [`docs/persona-hitesh-reference.md`](./persona-hitesh-reference.md). In summary, its details are drawn from:

- Portfolio structure & tagline — hiteshchoudhary.com / hitesh.ai
- Career background, country count, subscriber scale — Udemy instructor bio
- Course catalog & mission framing — chaicode.com / docs.chaicode.com / notes.chaicode.com
- App positioning & async work style — masterji.co listings + his own posts
- Channel tone/style — Chai aur Code and HiteshCodeLab "about" sections
- Personality, teaching analogies (boat/ocean, Swiggy/Zomato), catchphrases — a TRS (Ranveer Show) Hindi podcast appearance
- Productivity / time-management framework and verbatim phrases — a TED talk transcript

Confidence flags in the reference file: identity, background, teaching method, and the productivity playbook are well-sourced; the phrase-level voice data and the boundaries section are thinner and flagged for further validation.

## Piyush Garg — sources and honesty about gaps

The Piyush persona is built from his **genuinely public teaching profile**: the [piyushgarg.dev](https://www.piyushgarg.dev/) site and courses, his YouTube channel, his Teachyst platform, and his collaborations with other Indian educators on full-stack / GenAI cohorts. His observable style is **project-first and build-along**, heavy on backend, full-stack, DevOps (Docker), system design, and "how it's done in industry".

Because reliable, quotable transcript-level data for Piyush was thinner than for Hitesh at authoring time, we followed a strict no-fabrication rule:

- Where we were **not confident** about a specific biographical fact (exact past employers/titles) or a specific signature catchphrase, we wrote the surrounding instruction **generically** rather than inventing detail.
- Those spots are marked with inline `<!-- TODO: verify against real transcript -->` comments directly in `lib/persona.piyush.md`.

### Later verified from real videos (project-owner supplied)

A follow-up pass added details verified by the project owner directly from the creators' actual videos:

- **Piyush** — his signature video opener ("All right — hey everyone, welcome back to another exciting video! And in this video, ab hum baat karne waale hain about <topic>…"), his good-humoured, self-aware "self-obsessed" running bit, and that he is Punjabi and lives in Punjab, India.
- **Hitesh** — his video openers ("All right, swagat hai sabhi ka Chai aur Code pe…", "Hanji! Swagat hai aap sabhi ka…") and his hot-topic hook pattern (repeating the topic name three times, promising "100% guarantee samajh aayega", admitting the video will run long "but maza aayega", plus the mid-intro subscribe line), sourced from a real video transcript.

Both persona files instruct the model to use these openers only for greetings, from-scratch topic kickoffs, or explicit "explain it like your videos" requests — not in every chat reply.

### Open TODOs in the Piyush persona (need human verification)

1. **Specific past employers / job titles** — currently written generically as "working full-stack / backend engineer"; verify against a real bio/interview before stating specifics.
2. **Recurring sign-offs** — how he typically closes a video is still unverified; confirm against real transcripts.

The few-shot examples in the Piyush file are **style-matched constructions**, not verbatim quotes — the same approach used for Hitesh. They demonstrate register and structure, not attributed speech.
