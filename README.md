# PersonaGPT

An AI-powered chat app that simulates conversations with two well-known Indian coding educators — **Hitesh Choudhary** and **Piyush Garg** — reproducing each person's communication style, teaching approach, and personality. You pick a persona, ask questions, and get answers in that person's voice. You can switch personas at any time; each persona keeps its own separate conversation.

> This is a stylistic simulation for an educational project. It is **not** the real Hitesh or Piyush, and it does not claim to be.

## Features

- **Two personas** — Hitesh Choudhary and Piyush Garg, each driven by a dedicated, hand-written system prompt.
- **One-click persona switch** — a segmented control in the header with a clear active state.
- **Isolated conversations per persona** — switching does not bleed one person's voice or history into the other's thread.
- **Long-conversation context management** — older turns are summarized rather than silently dropped, so the persona stays coherent over long chats without blowing the context window.
- **Clean response rendering** — Markdown and code blocks render properly, and every reply is attributed to the active persona.
- **Dark / light theme** — follows the system preference by default, with a manual toggle in the header (persisted across visits).

## Tech stack

- **Next.js 16** (App Router, Route Handlers) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn**-style UI components (built on `@base-ui/react`)
- **OpenAI** SDK (`openai`) for the chat completions API
- **react-markdown** + **remark-gfm** for rendering responses

## Project structure

```
app/
  api/chat/route.ts   API route: validates input, applies context strategy, calls the LLM
  layout.tsx          Root layout + metadata
  page.tsx            Chat UI (persona switch, per-persona histories, markdown rendering)
lib/
  openai.ts           OpenAI client + shared MODEL constant
  personas.ts         Loads persona system prompts from disk (fs.readFileSync)
  persona.hitesh.md   Hitesh system prompt (ready to inject)
  persona.piyush.md   Piyush system prompt (ready to inject)
  persona-meta.ts     Client-safe display metadata (names, initials) — no fs
  context.ts          Context strategy: validation, summarization of older turns
  persona.md          Reference guide on how to author a persona file
docs/                 Persona data collection, prompt engineering, context mgmt, sample chats
```

### Data flow

```
page.tsx (client, per-persona history)
   → POST /api/chat  { persona, messages }
      → validate persona + messages          (lib/context.ts)
      → load persona system prompt           (lib/personas.ts → persona.*.md)
      → build conversation (summarize old)   (lib/context.ts)
      → openai.chat.completions.create()     (lib/openai.ts)
   ← { message }
```

## Getting started

### Prerequisites

- Node.js 20+ (developed on Node 24)
- An OpenAI API key

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env and set OPENAI_API_KEY=sk-...

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script          | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start the dev server           |
| `npm run build` | Production build               |
| `npm start`     | Run the production build       |
| `npm run lint`  | Lint the project               |

## Environment variables

| Variable         | Required | Description                                      |
| ---------------- | -------- | ------------------------------------------------ |
| `OPENAI_API_KEY` | Yes      | OpenAI API key used by the chat route to call the model. |

See [`.env.example`](./.env.example). The model is set centrally in [`lib/openai.ts`](./lib/openai.ts).

## Deployment

The app deploys cleanly to **Vercel** (or any Node host).

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Set `OPENAI_API_KEY` in the Vercel project's Environment Variables.
4. Deploy.

**File tracing note:** the chat route reads `lib/persona.*.md` at runtime via `fs.readFileSync` with a computed path. Vercel's build-time file tracing can miss dynamically-constructed paths, so [`next.config.ts`](./next.config.ts) explicitly includes those files for the `/api/chat` route via `outputFileTracingIncludes`. This is verified in the emitted trace (`.next/server/app/api/chat/route.js.nft.json`) after a build.

## Documentation

- [Persona data collection](./docs/persona-data-collection.md) — how source material was gathered and prepared.
- [Prompt engineering strategy](./docs/prompt-engineering-strategy.md) — the lean-system-prompt + few-shot + domain-override approach.
- [Context management](./docs/context-management.md) — how long conversations and persona switching are handled.
- [Sample conversations](./docs/sample-conversations.md) — real exchanges captured from this app.
