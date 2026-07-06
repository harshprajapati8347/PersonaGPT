"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordGate } from "@/components/password-gate";
import { ThemeToggle } from "@/components/theme-toggle";
import { Textarea } from "@/components/ui/textarea";
import { cn, pushToDataLayer } from "@/lib/utils";
import {
  PERSONA_META,
  PERSONA_ORDER,
  type PersonaId,
} from "@/lib/persona-meta";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Histories = Record<PersonaId, Message[]>;

const emptyHistories: Histories = { hitesh: [], piyush: [] };

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed [&_p]:whitespace-pre-wrap">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            />
          ),
          ul: (props) => <ul {...props} className="list-disc space-y-1 pl-5" />,
          ol: (props) => (
            <ol {...props} className="list-decimal space-y-1 pl-5" />
          ),
          pre: (props) => (
            <pre
              {...props}
              className="my-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100"
            />
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return (
                <code className={cn("font-mono", className)} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function Chat() {
  const [persona, setPersona] = useState<PersonaId>("hitesh");
  const [histories, setHistories] = useState<Histories>(emptyHistories);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(1);

  const active = PERSONA_META[persona];
  const messages = histories[persona];

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Snapshot the persona this request belongs to so a mid-flight switch
    // can never write a reply into the wrong thread.
    const personaAtSend = persona;
    const updatedMessages: Message[] = [
      ...histories[personaAtSend],
      { role: "user", content: input },
    ];

    setHistories((prev) => ({ ...prev, [personaAtSend]: updatedMessages }));
    setInput("");
    setLoading(true);
    setCount((prev) => prev + 1);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: personaAtSend,
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      setHistories((prev) => ({
        ...prev,
        [personaAtSend]: [
          ...updatedMessages,
          {
            role: "assistant",
            content: res.ok
              ? data.message
              : (data.message ?? "Something went wrong."),
          },
        ],
      }));
      pushToDataLayer("message_sent", {
        user_input: input,
        assistant_response: res.ok ? data.message : "Error",
        count,
      });
    } catch (err) {
      console.error(err);
      setHistories((prev) => ({
        ...prev,
        [personaAtSend]: [
          ...updatedMessages,
          {
            role: "assistant",
            content: "Network error — please try again.",
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4 md:p-8">
      <Card className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">PersonaGPT</h1>
            <p className="text-sm text-muted-foreground">
              Chatting with{" "}
              <span className="font-medium text-foreground">{active.name}</span>
              {" · "}
              {active.tagline}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Persona switch — one obvious segmented control */}
            <div
              role="tablist"
              aria-label="Choose persona"
              className="inline-flex rounded-xl border bg-muted/50 p-1"
            >
              {PERSONA_ORDER.map((id) => {
                const meta = PERSONA_META[id];
                const isActive = id === persona;
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={isActive}
                    disabled={loading}
                    onClick={() => setPersona(id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/20 text-muted-foreground",
                      )}
                    >
                      {meta.initials}
                    </span>
                    {meta.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>

            <ThemeToggle />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto flex max-w-3xl flex-col space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center py-24 text-center text-muted-foreground">
                Ask {active.name.split(" ")[0]} your first question 👋
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div className="max-w-[85%]">
                  {message.role === "assistant" && (
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-semibold text-primary-foreground">
                        {active.initials}
                      </span>
                      {active.name}
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground whitespace-pre-wrap"
                        : "bg-muted",
                    )}
                  >
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <MarkdownMessage content={message.content} />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                  {active.name.split(" ")[0]} is thinking…
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-3">
            <Textarea
              rows={2}
              value={input}
              placeholder={`Ask ${active.name.split(" ")[0]} anything...`}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <Button
              size="icon"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="h-11 w-11 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2 text-center text-xs text-muted-foreground">
          PersonaGPT — an AI demo mimicking the teaching styles of Hitesh
          Choudhary &amp; Piyush Garg. Not the real people.
        </div>
      </Card>
    </main>
  );
}

export default function Home() {
  return (
    <PasswordGate>
      <Chat />
    </PasswordGate>
  );
}
