"use client";

import { useMemo, useRef, useState } from "react";
import { useTwinStore } from "@/lib/store";
import { answerTwinQuestion, type ChatMessage } from "@/lib/twin-chat";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Tiết kiệm bao nhiêu?",
  "Tháng đỏ nào?",
  "Nên transfer không?",
  "Optimizer gợi ý gì?",
  "ROI và NPV?",
  "Container và case pool?",
];

export function TwinChat({ compact = false }: { compact?: boolean }) {
  const { result, params } = useTwinStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Twin Chat sẵn sàng. Hỏi về savings, tháng đỏ, transfer, stack, ROI, optimizer… — trả lời từ mô hình live.",
      at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      at: new Date().toISOString(),
    };
    const answer = answerTwinQuestion(text, result, params);
    const botMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: answer,
      at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg, botMsg].slice(-40));
    setInput("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-sm)]",
        compact ? "h-[380px]" : "h-[480px]"
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-[var(--line-soft)] px-4 py-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e4d6b] to-[#0b1220] text-[#d4b76a] ring-1 ring-white/10">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="panel-kicker">Twin Chat</div>
          <div className="text-sm font-bold text-[var(--ink)]">
            Hỏi đáp dữ liệu live
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-[var(--gold)]" />
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-[var(--line-soft)] px-3 py-2.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => ask(s)}
            className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)] transition hover:border-[color-mix(in_srgb,var(--gold)_40%,var(--line))] hover:text-[var(--ink)]"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-2",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {m.role === "assistant" && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] ring-1 ring-[var(--line)]">
                <Bot className="h-3 w-3 text-[var(--gold)]" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                m.role === "user"
                  ? "bg-[var(--chart-1)] text-white shadow-sm"
                  : "border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)]"
              )}
            >
              {m.text.split("**").map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i}>{part}</strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </div>
            {m.role === "user" && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] ring-1 ring-[var(--line)]">
                <User className="h-3 w-3 text-[var(--muted)]" />
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        className="flex gap-2 border-t border-[var(--line-soft)] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi Twin… vd. tiết kiệm bao nhiêu?"
          className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gold)_18%,transparent)]"
        />
        <button
          type="submit"
          className="btn-bank-gold flex h-10 w-10 items-center justify-center rounded-xl"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
