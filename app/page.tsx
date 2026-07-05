"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [persona, setPersona] = useState("hitesh");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content: input } as Message,
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona,
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4 md:p-8">
      <Card className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl shadow-sm">
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Persona AI</h1>
            <p className="text-sm text-muted-foreground">
              Chat with your AI instructor
            </p>
          </div>

          <Select
            value={persona}
            onValueChange={(value) => {
              if (value) setPersona(value);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="hitesh">Hitesh Choudhary</SelectItem>
              <SelectItem value="piyush">Piyush Garg</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Messages */}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto flex max-w-3xl flex-col space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center py-24 text-center text-muted-foreground">
                Ask your first question 👋
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                    }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="rounded-2xl bg-muted px-4 py-3 w-fit">
                Thinking...
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
              placeholder={`Ask ${persona === "hitesh" ? "Hitesh" : "Piyush"
                } anything...`}
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
              disabled={loading}
              className="h-11 w-11 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}