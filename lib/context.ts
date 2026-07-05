export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type OpenAIMessage = { role: "system" | "user" | "assistant"; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string"
  );
}

// Validates and normalizes the raw `messages` array from the request body.
export function normalizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isChatMessage).map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

// Builds the final message array sent to the model:
//   [persona system prompt]  <- re-anchored fresh every request
//   [conversation history]   <- sent as-is (lightweight demo, no compression)
export function buildConversation(
  systemPrompt: string,
  messages: ChatMessage[],
): OpenAIMessage[] {
  return [{ role: "system", content: systemPrompt }, ...messages];
}
