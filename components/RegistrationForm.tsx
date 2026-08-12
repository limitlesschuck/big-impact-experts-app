"use client";

import { useState } from "react";
import Link from "next/link";
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
  // Set on a successful submit from an email that already matches a
  // Member -- there's nothing to upsell them into, so they get a plain
  // inline message instead of the VIP offer redirect. No dedicated route
  // for this; it's one sentence and a login link, not worth a URL.
  const [alreadyMember, setAlreadyMember] = useState(false);

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
      const data = await res.json().catch(() => ({}));
      if (data.alreadyMember) {
        setAlreadyMember(true);
        setSubmitting(false);
        return;
      }
      // The VIP offer page shows immediately -- while intent is
      // highest -- then forwards the same survey param on to
      // /confirmation once the visitor accepts or declines it, so the
      // existing pre-event survey step still happens, just one step
      // later than before.
      const vipOfferUrl = surveyUrl
        ? `/vip-offer?survey=${encodeURIComponent(surveyUrl)}`
        : "/vip-offer";
      router.push(vipOfferUrl);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong — please try again.");
      setSubmitting(false);
    }
  }

  if (alreadyMember) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-center">
        <p className="text-lg font-bold text-gray-900 mb-2">Welcome back!</p>
        <p className="text-sm text-gray-600 mb-6">
          Looks like you&rsquo;re already a member — log in to access your membership.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 rp-bg-navy text-white font-bold rounded-full hover:opacity-90 transition-opacity"
        >
          Log In
        </Link>
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
        className="rp-button-text w-full py-4 rp-bg-orange text-white font-bold rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? "Registering..." : buttonLabel}
      </button>
    </form>
  );
}
