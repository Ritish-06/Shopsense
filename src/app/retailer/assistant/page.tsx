"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  FileText,
  Clock,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BusinessAnalystResponse } from "@/lib/ai-analyst";

const sampleQuestions = [
  "Which products may run out of stock in 7 days?",
  "Which products generated the highest revenue this month?",
  "Which products have the lowest gross margins?",
  "What should I investigate before placing my next inventory order?",
];

interface ChatMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  data?: BusinessAnalystResponse;
}

export default function RetailerAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "AI",
      text: "Hello! I am your ShopSense AI Business Analyst for Apex Tech Direct. I analyze your live inventory records, daily sales velocity, supplier lead times, and margins to answer questions with zero hallucination. Ask me anything below!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "USER",
      text: questionText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/retailer/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText }),
      });

      const data: BusinessAnalystResponse = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "AI",
        text: data.answer,
        data,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "AI",
          text: "Sorry, I encountered an issue retrieving authoritative database records. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200 mb-2">
          <Bot className="h-3.5 w-3.5 text-blue-600" />
          <span>Controlled Analytical Engine</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          AI Business Analyst for Retailers
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Connected directly to your store&apos;s authoritative inventory movements, sales velocity, and margins.
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-zinc-400 font-semibold">Suggested Questions:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(q)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-700 hover:border-blue-400 hover:text-blue-600 transition shadow-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm min-h-[420px] flex flex-col justify-between space-y-4">
        <div className="space-y-6 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.sender === "USER" ? "justify-end" : "justify-start"
              }`}
            >
              {m.sender === "AI" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 max-w-2xl ${
                  m.sender === "USER"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-zinc-50 border border-zinc-200/80 text-zinc-800 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-line font-normal">{m.text}</div>

                {/* Analytical Metadata & Supporting Tools */}
                {m.data && (
                  <div className="mt-4 pt-3 border-t border-zinc-200/80 space-y-2 text-[11px] text-zinc-500">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded bg-blue-100 text-blue-800 font-mono px-1.5 py-0.5 font-semibold">
                        tool: {m.data.toolUsed}
                      </span>
                      <span>Range: {m.data.dateRange}</span>
                    </div>

                    <div className="text-[10px] text-zinc-400">
                      <strong>Formula:</strong> {m.data.calculationDefinition}
                    </div>

                    {m.data.assumptions?.length > 0 && (
                      <div className="text-[10px] text-zinc-400 italic">
                        * Note: {m.data.assumptions.join(" ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-zinc-500 animate-pulse">
                Analyzing inventory levels, lead times, and sales velocity...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
          className="pt-4 border-t border-zinc-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about inventory, velocity, margin bottlenecks, reorders..."
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl px-4 font-semibold text-xs shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
