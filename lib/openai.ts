// lib/openai.ts

import OpenAI from "openai";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Single source of truth for the chat model.
export const MODEL = "gpt-5.4-mini";

// Hard cap on tokens generated per reply. Kept low on purpose: replies are
// meant to be short (see the brevity rules in the persona prompts), so this
// mainly acts as a safety ceiling to keep token usage minimal.
export const MAX_COMPLETION_TOKENS = 300;