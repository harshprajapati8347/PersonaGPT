# Persona.md — How to Design a Persona Configuration File

This document explains **how to design a persona.md file** for simulating a real person's voice with an LLM (e.g., a YouTube coding educator). It's a reference guide, not a filled-in example — use it to write your own `persona.hitesh.md`, `persona.piyush.md`, etc.

---

## 1. What a Persona.md File Actually Is

A persona.md file is a **structured spec** that gets turned into (part of) an LLM's system prompt. Its job is to constrain four things at once:

- **Who** is speaking (identity/background)
- **How** they sound (voice, vocabulary, rhythm)
- **How** they explain things (teaching method)
- **What** they won't do (boundaries)

A vague one-liner like "act like Hitesh Choudhary" fails after a few turns because the model has nothing concrete to hold onto. A well-designed persona.md gives it concrete, sourced material instead of an adjective.

---

## 2. Where the Content Comes From

Before writing any section below, gather real material for the person you're modeling:

- YouTube video transcripts — pick a *range*: a tutorial, a career/advice video, a podcast or live Q&A. One register isn't enough; you need to see how tone shifts across contexts.
- Personal portal / website copy (bio, "about," course descriptions).
- Public social posts (X/Twitter, LinkedIn) — short-form voice is often more distinctive than long-form video.
- Recurring patterns you notice: catchphrases, filler words, when they code-switch between English and Hindi, how they react to mistakes on screen, how they close a video.

Everything in the sections below should trace back to something you actually observed in this material — not something that merely sounds plausible.

---

## 3. Topics to Include in a Persona.md

Below is the full topic list, in the order they typically appear in a persona file, with guidance on what belongs in each.

### 3.1 Identity
The basic facts that ground the character.
- Name / handle
- Role (e.g., "backend & DevOps educator" vs. "full-stack & system design educator" — be specific, not just "software engineer")
- Platform(s) — channel name, personal site, course platforms
- A one-line self-description, ideally pulled from their own bio copy

### 3.2 Background & Motivation
Context that explains *why* they teach the way they do.
- Career background relevant to their teaching angle
- Stated mission or motivation (only include what's actually said in interviews/bios — don't invent a backstory)

### 3.3 Audience
Who they're actually talking to when they teach.
- Skill level they target (complete beginners? working devs? job seekers?)
- Any signature framing about their audience (e.g., "for people who can't afford expensive bootcamps")

### 3.4 Voice & Vocabulary
The most important section for persona *accuracy* — be concrete, not descriptive.
- Language mix: e.g., "mostly English, switches to Hindi for jokes, encouragement, or scolding about bad practices"
- Verified catchphrases / recurring openers or sign-offs
- Sentence rhythm: short and punchy vs. long and exploratory; how often they ask rhetorical questions
- Humor style: dry, self-deprecating, teasing, deadpan, none
- Anything they say when frustrated, excited, or correcting a mistake

Avoid vague adjectives ("energetic," "friendly") without a concrete example attached — adjectives alone don't transfer into consistent output.

### 3.5 Teaching Method / Philosophy
How they structure an explanation, not just how they sound.
- Default explanation structure (e.g., problem → why it matters → mental model → code → common pitfalls)
- Analogy style — what domains they pull analogies from
- How they narrate debugging or mistakes live (calm and methodical? energetic?)
- How they typically close a topic (a challenge, a recap, "try it yourself")

### 3.6 Boundaries
What keeps the persona from drifting or hallucinating.
- Topics outside their known expertise → how they'd deflect *in character* rather than giving a robotic refusal
- Explicit rule: never claim to be an AI/LLM, never invent biographical facts not found in source material
- What to do when you don't have real data on their reaction to something: default to a neutral, safe version of the voice instead of guessing wildly

### 3.7 Few-Shot Examples
The section that does the most work to anchor tone — description tells the model what to be, examples show it.
- Include 3–5 short exchanges: a technical explanation, a motivational/career question, a "why should I learn this" question, and one where they gently correct a misconception
- Each example should be modeled on the *style* of something you actually saw in the source material, not treated as a verbatim quote unless you're certain it's accurate
- Prioritize variety of context over volume — 4 well-chosen examples beat 10 similar ones

### 3.8 Notes on Sources
Not injected into the model — kept for your own reference and for anyone auditing the persona later.
- Which videos, pages, or posts each detail in this file was drawn from

---

## 4. General Guidance on Using the File

- Keep the *injected* portion (Identity + Voice + Teaching Method + Boundaries + a couple of tightest few-shot examples) reasonably lean — long system prompts full of restated adjectives don't add accuracy, they just dilute attention and cost tokens.
- If two people are being simulated (e.g., switching between personas), keep their persona.md files completely separate documents — never blend instructions for two people into one prompt.
- If you later add retrieved factual context (e.g., real course content, so the model doesn't invent details), keep that clearly separate from the voice/style instructions in the prompt — one block for "how they talk," a separate labeled block for "facts to ground this answer in."

---

## 5. Common Mistakes to Avoid

- **Vagueness:** "be enthusiastic, use some Hindi" won't survive more than a couple of turns — always pair a trait with a concrete example.
- **Over-loading:** stacking too many vocabulary quirks or catchphrases dilutes focus on the ones that are actually distinctive — pick the handful that matter most.
- **Fabricated quotes:** never write a "quote" you can't trace to a real source — it's both inaccurate and puts invented words in a real person's mouth.
- **Mixing personas:** blending two people's traits in one file causes tone bleed; keep files fully separate.
- **Treating persona as a substitute for correctness:** persona controls style, not technical accuracy — the underlying answers still need to be right.