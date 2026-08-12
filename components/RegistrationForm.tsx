"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegistrationFormProps {
  eventId: string;
  buttonLabel: string;
  surveyUrl: string | null;
}

export default function RegistrationForm({ eventId, buttonLabel, surveyUrl }: RegistrationFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      const confirmationUrl = surveyUrl
        ? `/confirmation?survey=${encodeURIComponent(surveyUrl)}`
        : "/confirmation";
      router.push(confirmationUrl);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong — please try again.");
      setSubmitting(false);
    }
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
        className="rp-button-text w-full py-4 rp-bg-orange text-white font-bold rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? "Registering..." : buttonLabel}
      </button>
    </form>
  );
}
