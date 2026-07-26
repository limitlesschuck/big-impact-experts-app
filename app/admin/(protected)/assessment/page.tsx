"use client";

import { useEffect, useState } from "react";

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

interface ResultContent {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
}

interface AssessmentConfig {
  questions: Question[];
  thresholds: { coachReferral: number; resource: number };
  results: {
    coach_referral: ResultContent;
    resource: ResultContent;
    nurture: ResultContent;
  };
}

const RESULT_LABELS: Record<string, string> = {
  coach_referral: "Coach referral (high urgency)",
  resource: "Resource (mid urgency)",
  nurture: "Nurture (exploring)",
};

const COLOR_OPTIONS = ["red", "amber", "blue", "green", "purple"];
const TYPE_OPTIONS = ["category", "options", "urgency", "email"];

export default function AssessmentAdminPage() {
  const [config, setConfig] = useState<AssessmentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "scoring" | "results">("questions");

  async function load() {
    const res = await fetch("/api/admin/assessment");
    const data = await res.json();
    setConfig(data.config as AssessmentConfig);
    setLoading(false);
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/assessment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "Assessment config saved" });
    } else {
      setMessage({ type: "error", text: "Save failed" });
    }
    setSaving(false);
  }

  function updateQuestion(index: number, updates: Partial<Question>) {
    if (!config) return;
    const questions = [...config.questions];
    questions[index] = { ...questions[index], ...updates };
    setConfig({ ...config, questions });
  }

  function updateOption(qIndex: number, oIndex: number, updates: Partial<QuestionOption>) {
    if (!config) return;
    const questions = [...config.questions];
    const options = [...(questions[qIndex].options ?? [])];
    options[oIndex] = { ...options[oIndex], ...updates };
    questions[qIndex] = { ...questions[qIndex], options };
    setConfig({ ...config, questions });
  }

  function addOption(qIndex: number) {
    if (!config) return;
    const questions = [...config.questions];
    const options = [...(questions[qIndex].options ?? [])];
    const type = questions[qIndex].type;
    options.push({
      value: `option_${Date.now()}`,
      label: "New option",
      ...(type === "urgency" ? { score: 5, color: "blue" } : {}),
      ...(type === "category" ? { emoji: "⭐" } : {}),
    });
    questions[qIndex] = { ...questions[qIndex], options };
    setConfig({ ...config, questions });
  }

  function removeOption(qIndex: number, oIndex: number) {
    if (!config) return;
    const questions = [...config.questions];
    const options = [...(questions[qIndex].options ?? [])];
    options.splice(oIndex, 1);
    questions[qIndex] = { ...questions[qIndex], options };
    setConfig({ ...config, questions });
  }

  function addQuestion() {
    if (!config) return;
    const emailIndex = config.questions.findIndex((q) => q.type === "email");
    const questions = [...config.questions];
    const newQ: Question = {
      id: `question_${Date.now()}`,
      type: "options",
      text: "New question",
      subtext: "",
      options: [{ value: "option_1", label: "Option 1" }],
      storeAs: `answer_${Date.now()}`,
    };
    if (emailIndex >= 0) {
      questions.splice(emailIndex, 0, newQ);
    } else {
      questions.push(newQ);
    }
    setConfig({ ...config, questions });
  }

  function removeQuestion(index: number) {
    if (!config) return;
    const questions = [...config.questions];
    questions.splice(index, 1);
    setConfig({ ...config, questions });
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    if (!config) return;
    const questions = [...config.questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    [questions[index], questions[targetIndex]] = [questions[targetIndex], questions[index]];
    setConfig({ ...config, questions });
  }

  function updateResult(key: string, updates: Partial<ResultContent>) {
    if (!config) return;
    setConfig({
      ...config,
      results: {
        ...config.results,
        [key]: { ...config.results[key as keyof typeof config.results], ...updates },
      },
    });
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (!config) return <div className="text-sm text-gray-500">No config found.</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">Edit questions, scoring, and result content.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(["questions", "scoring", "results"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Questions tab */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {config.questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Question {qIndex + 1} — {q.type}
                  </span>
                  {q.type === "email" && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Always last</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => moveQuestion(qIndex, "up")} disabled={qIndex === 0}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30">↑</button>
                  <button onClick={() => moveQuestion(qIndex, "down")}
                    disabled={qIndex === config.questions.length - 1 || config.questions[qIndex + 1]?.type === "email"}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30">↓</button>
                  {q.type !== "email" && (
                    <button onClick={() => removeQuestion(qIndex)}
                      className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {q.type !== "email" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Question type</label>
                    <select value={q.type}
                      onChange={(e) => updateQuestion(qIndex, { type: e.target.value as Question["type"] })}
                      className="input text-sm">
                      {TYPE_OPTIONS.filter(t => t !== "email").map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Question text</label>
                  <input type="text" value={q.text}
                    onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                    className="input" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subtext</label>
                  <input type="text" value={q.subtext ?? ""}
                    onChange={(e) => updateQuestion(qIndex, { subtext: e.target.value })}
                    className="input" placeholder="Optional helper text below the question" />
                </div>

                {q.type !== "email" && q.storeAs !== undefined && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Store answer as</label>
                    <input type="text" value={q.storeAs}
                      onChange={(e) => updateQuestion(qIndex, { storeAs: e.target.value })}
                      className="input text-xs font-mono" placeholder="e.g. crisisCategory" />
                    <p className="text-xs text-gray-400 mt-1">The key used to store this answer in the lead record</p>
                  </div>
                )}

                {/* Options */}
                {q.type !== "email" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Options</label>
                    <div className="space-y-2">
                      {(q.options ?? []).map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                          {q.type === "category" && (
                            <input type="text" value={opt.emoji ?? ""} placeholder="emoji"
                              onChange={(e) => updateOption(qIndex, oIndex, { emoji: e.target.value })}
                              className="w-14 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white" />
                          )}
                          <input type="text" value={opt.label} placeholder="Label"
                            onChange={(e) => updateOption(qIndex, oIndex, { label: e.target.value })}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white" />
                          <input type="text" value={opt.value} placeholder="value"
                            onChange={(e) => updateOption(qIndex, oIndex, { value: e.target.value })}
                            className="w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono bg-white" />
                          {q.type === "urgency" && (
                            <>
                              <input type="number" value={opt.score ?? 5} placeholder="Score"
                                onChange={(e) => updateOption(qIndex, oIndex, { score: parseInt(e.target.value) })}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white text-center" />
                              <select value={opt.color ?? "blue"}
                                onChange={(e) => updateOption(qIndex, oIndex, { color: e.target.value })}
                                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white">
                                {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </>
                          )}
                          <button onClick={() => removeOption(qIndex, oIndex)}
                            className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addOption(qIndex)}
                      className="mt-2 text-sm text-brand-purple hover:text-brand-gold transition-colors">
                      + Add option
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button onClick={addQuestion}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-brand-purple hover:text-brand-purple transition-colors">
            + Add question
          </button>
        </div>
      )}

      {/* Scoring tab */}
      {activeTab === "scoring" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Score thresholds</h2>
          <p className="text-sm text-gray-500 mb-6">
            The urgency question assigns a score to each answer. These thresholds determine which result page the visitor sees.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Coach referral threshold (score ≥ this → coach referral result)
                </label>
                <input type="number" value={config.thresholds.coachReferral}
                  onChange={(e) => setConfig({ ...config, thresholds: { ...config.thresholds, coachReferral: parseInt(e.target.value) } })}
                  className="input w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Resource threshold (score ≥ this → resource result)
                </label>
                <input type="number" value={config.thresholds.resource}
                  onChange={(e) => setConfig({ ...config, thresholds: { ...config.thresholds, resource: parseInt(e.target.value) } })}
                  className="input w-24" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
              <p className="font-medium text-gray-700 mb-1">How scoring works:</p>
              <p>Score ≥ {config.thresholds.coachReferral} → Coach referral result</p>
              <p>Score ≥ {config.thresholds.resource} → Resource result</p>
              <p>Score &lt; {config.thresholds.resource} → Nurture result</p>
            </div>
          </div>
        </div>
      )}

      {/* Results tab */}
      {activeTab === "results" && (
        <div className="space-y-6">
          {Object.entries(config.results).map(([key, result]) => (
            <div key={key} className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                {RESULT_LABELS[key] ?? key}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Headline</label>
                  <input type="text" value={result.headline}
                    onChange={(e) => updateResult(key, { headline: e.target.value })}
                    className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subtext</label>
                  <textarea value={result.subtext} rows={3}
                    onChange={(e) => updateResult(key, { subtext: e.target.value })}
                    className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Primary CTA label</label>
                  <input type="text" value={result.ctaLabel}
                    onChange={(e) => updateResult(key, { ctaLabel: e.target.value })}
                    className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Primary CTA URL</label>
                  <input type="text" value={result.ctaHref}
                    onChange={(e) => updateResult(key, { ctaHref: e.target.value })}
                    className="input" placeholder="https://... or /episodes" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Secondary link label</label>
                  <input type="text" value={result.secondaryLabel}
                    onChange={(e) => updateResult(key, { secondaryLabel: e.target.value })}
                    className="input" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
