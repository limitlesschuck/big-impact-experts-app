"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
  score?: number;
  color?: string;
}

interface Question {
  id: string;
  type: "category" | "options" | "urgency" | "email";
  text: string;
  subtext?: string;
  options?: QuestionOption[];
  storeAs?: string;
}

interface AssessmentConfig {
  questions?: Question[];
}

const COLOR_MAP: Record<string, { idle: string; selected: string }> = {
  red:    { idle: "border-red-300 hover:border-red-500",    selected: "bg-red-50 border-red-500" },
  amber:  { idle: "border-amber-300 hover:border-amber-500", selected: "bg-amber-50 border-amber-500" },
  blue:   { idle: "border-blue-300 hover:border-blue-500",   selected: "bg-blue-50 border-blue-500" },
  green:  { idle: "border-green-300 hover:border-green-500", selected: "bg-green-50 border-green-500" },
  purple: { idle: "border-purple-300 hover:border-purple-500", selected: "bg-purple-50 border-purple-500" },
};

function AssessmentFunnel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCategory = searchParams.get("category") ?? "";

  const [config, setConfig] = useState<AssessmentConfig>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    crisisCategory: prefillCategory,
    crisisDuration: "",
    urgency: "",
    firstName: "",
    email: "",
  });

  useEffect(() => {
    fetch("/api/assessment/config")
      .then((r) => r.json())
      .then((cfg: AssessmentConfig) => {
        setConfig(cfg);
        if (prefillCategory && cfg.questions) {
          const categoryIndex = cfg.questions.findIndex((q) => q.type === "category");
          setStep(categoryIndex >= 0 ? categoryIndex + 1 : 0);
        }
      })
      .catch(() => {});
  }, []);

  const questions = config.questions ?? [];
  const totalSteps = questions.length;
  const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;
  const currentQuestion = questions[step];

  function handleOptionSelect(question: Question, value: string) {
    const key = question.storeAs ?? question.id;
    setAnswers((a) => ({ ...a, [key]: value }));
    if (step < totalSteps - 1) setStep((s) => s + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      router.push(`/assessment/result?type=${data.resultType}&category=${data.crisisCategory}&urgency=${data.urgency}`);
    } else {
      setSubmitting(false);
      alert("Something went wrong. Please try again.");
    }
  }

  if (!currentQuestion) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 text-sm">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-purple">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">
            Limitless <span className="text-brand-gold">Living</span>
          </Link>
          <span className="text-gray-300 text-sm">Free assessment</span>
        </div>
      </div>

      <div className="h-1 bg-gray-100">
        <div className="h-1 bg-brand-gold transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-brand-gold text-sm font-semibold uppercase tracking-widest mb-2">
          Question {step + 1} of {totalSteps}
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          {currentQuestion.text}
        </h1>
        {currentQuestion.subtext && (
          <p className="text-gray-500 text-sm mb-8">{currentQuestion.subtext}</p>
        )}

        {currentQuestion.type === "category" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(currentQuestion.options ?? []).map((opt) => (
              <button key={opt.value} onClick={() => handleOptionSelect(currentQuestion, opt.value)}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-brand-purple hover:bg-purple-50 text-left transition-all group">
                {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                <span className="text-sm font-medium text-gray-800 group-hover:text-brand-purple">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === "options" && (
          <div className="space-y-3">
            {(currentQuestion.options ?? []).map((opt) => (
              <button key={opt.value} onClick={() => handleOptionSelect(currentQuestion, opt.value)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-brand-purple hover:bg-purple-50 text-left transition-all">
                <span className="text-sm font-medium text-gray-800">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === "urgency" && (
          <div className="space-y-3">
            {(currentQuestion.options ?? []).map((opt) => {
              const colors = COLOR_MAP[opt.color ?? "purple"] ?? COLOR_MAP.purple;
              const selected = answers[currentQuestion.storeAs ?? currentQuestion.id] === opt.value;
              return (
                <button key={opt.value} onClick={() => handleOptionSelect(currentQuestion, opt.value)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selected ? colors.selected : colors.idle}`}>
                  <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === "email" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input type="text" value={answers.firstName ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, firstName: e.target.value }))}
                className="input" placeholder="Your first name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address <span className="text-red-400">*</span>
              </label>
              <input type="email" value={answers.email ?? ""} required
                onChange={(e) => setAnswers((a) => ({ ...a, email: e.target.value }))}
                className="input" placeholder="you@example.com" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full text-center disabled:opacity-50">
              {submitting ? "Finding your path..." : "Show me my results →"}
            </button>
            <p className="text-xs text-gray-400 text-center">
              By continuing you agree to receive emails from the Limitless Living Show. Unsubscribe any time.
            </p>
          </form>
        )}

        {step > 0 && currentQuestion.type !== "email" && (
          <button onClick={() => setStep((s) => s - 1)}
            className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Back
          </button>
        )}
        {step > 0 && currentQuestion.type === "email" && (
          <button onClick={() => setStep((s) => s - 1)}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 text-sm">Loading...</div></div>}>
      <AssessmentFunnel />
    </Suspense>
  );
}
