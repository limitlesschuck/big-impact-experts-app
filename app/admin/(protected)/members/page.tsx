"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadMembers() {
    setLoading(true);
    const res = await fetch("/api/admin/members");
    const data = await res.json();
    setMembers(data.members ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setMessage(null);

    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage(
        data.created
          ? { type: "success", text: `Member created — welcome email sent to ${email}` }
          : { type: "error", text: "A member with that email already exists" }
      );
      if (data.created) {
        setEmail("");
        loadMembers();
      }
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to create member" });
    }
    setAdding(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
        <p className="text-sm text-gray-500 mt-1">{members.length} total</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Add member</h2>
        <p className="text-xs text-gray-500 mb-4">
          Creates the member and immediately sends a welcome email with a link to set their
          password.
        </p>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="member@example.com"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {adding ? "Adding..." : "Add member"}
          </button>
        </form>
        {message && (
          <p className={`text-sm mt-3 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-sm text-gray-500 p-6">Loading...</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-500 p-6">No members yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 text-gray-900">{m.email}</td>
                  <td className="px-4 py-2 text-gray-600 capitalize">{m.status}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
