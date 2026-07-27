"use client";

import { useState } from "react";
import Link from "next/link";

interface RegistrationFormProps {
  eventId: string;
  buttonLabel: string;
  surveyUrl: string | null;
}

export default function RegistrationForm({ eventId, buttonLabel, surveyUrl }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong — please try again.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-10 text-center">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          Thank You For Registering!
        </h3>
        <p className="text-gray-600 mb-8">
          Your confirmation email with your access link has been sent to your inbox
        </p>

        {surveyUrl && (
          <>
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 sm:p-8">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                One quick favor — it takes less than 60 seconds
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                Please complete this short pre-training survey. Your answers will help me
                customize the content so this training is as relevant and valuable as possible
                for you personally.
              </p>
              <a
                href={surveyUrl}
                className="inline-block px-8 py-3 rp-bg-navy text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Complete The Pre-Event Survey
              </a>
              <p className="text-xs text-gray-500 mt-4">
                Less than 1 minute · Makes a big difference
              </p>
            </div>

            <Link
              href="/register/thank-you"
              className="inline-block text-sm text-blue-700 underline mt-6"
            >
              No thanks, I don&rsquo;t want to do the survey.
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reg-name" className="sr-only">
          Name
        </label>
        <input
          id="reg-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="rp-form-input w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="sr-only">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="rp-form-input w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rp-button-text w-full py-4 rp-bg-orange text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? "Registering..." : buttonLabel}
      </button>
    </form>
  );
}
