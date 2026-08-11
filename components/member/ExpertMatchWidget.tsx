"use client";

import { useState } from "react";
import Link from "next/link";

interface Recommendation {
  name: string;
  summary: string;
  href: string;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  recommendations?: Recommendation[];
}

const CLIENT_TIMEOUT_MS = 60_000;

export default function ExpertMatchWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/expert-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: data.message, recommendations: data.recommendations },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: data.error ?? "Something went wrong — please try again." },
        ]);
      }
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: timedOut
            ? "That took too long — please try again."
            : "Something went wrong — please try again.",
        },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-96 max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-brand-navy flex items-center justify-between flex-shrink-0">
            <p className="text-sm font-semibold text-white">Find an Expert</p>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500">
                Describe a problem or question, and I&rsquo;ll point you to the expert(s) whose
                sessions actually address it.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <div
                  className={`inline-block max-w-[85%] px-3 py-2 rounded-lg text-sm text-left ${
                    m.role === "user" ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text}
                </div>
                {m.recommendations && m.recommendations.length > 0 && (
                  <div className="mt-2 space-y-2 text-left">
                    {m.recommendations.map((r, j) => (
                      <Link
                        key={j}
                        href={r.href}
                        className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-brand-orange transition-colors"
                      >
                        <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{r.summary}</p>
                        <p className="text-xs text-brand-orange mt-1">View their page →</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="text-sm text-gray-400">Thinking...</p>}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-gray-200 flex-shrink-0 flex gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Ask
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-brand-orange text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity text-2xl"
        aria-label={open ? "Close expert match chat" : "Open expert match chat"}
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}
