"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  lastLoginAt: string | null;
}

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [editing, setEditing] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", expiresAt: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [confirmingDisable, setConfirmingDisable] = useState<Member | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const [deleting, setDeleting] = useState<Member | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingInFlight, setDeletingInFlight] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
      body: JSON.stringify({ email, firstName, lastName }),
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
        setFirstName("");
        setLastName("");
        loadMembers();
      }
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to create member" });
    }
    setAdding(false);
  }

  function openEdit(member: Member) {
    setEditing(member);
    setEditError("");
    setEditForm({
      firstName: member.firstName ?? "",
      lastName: member.lastName ?? "",
      email: member.email,
      expiresAt: toDateInputValue(member.expiresAt),
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setEditError("");

    const res = await fetch(`/api/admin/members/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        expiresAt: editForm.expiresAt || null,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      setEditing(null);
      loadMembers();
    } else {
      setEditError(data.error ?? "Failed to save changes");
    }
    setSavingEdit(false);
  }

  async function handleToggleStatus() {
    if (!confirmingDisable) return;
    setTogglingStatus(true);
    const nextStatus = confirmingDisable.status === "disabled" ? "active" : "disabled";

    const res = await fetch(`/api/admin/members/${confirmingDisable.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.ok) {
      setConfirmingDisable(null);
      loadMembers();
    }
    setTogglingStatus(false);
  }

  function openDelete(member: Member) {
    setDeleting(member);
    setDeleteConfirmText("");
    setDeleteError("");
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeletingInFlight(true);
    setDeleteError("");

    const res = await fetch(`/api/admin/members/${deleting.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmEmail: deleteConfirmText }),
    });
    const data = await res.json();

    if (res.ok) {
      setDeleting(null);
      loadMembers();
    } else {
      setDeleteError(data.error ?? "Failed to delete member");
    }
    setDeletingInFlight(false);
  }

  return (
    <div className="max-w-5xl">
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
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="member@example.com"
            className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">First Name</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Last Name</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Created</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Expires</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Last Login</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2 text-gray-900">{m.firstName || "—"}</td>
                    <td className="px-4 py-2 text-gray-900">{m.lastName || "—"}</td>
                    <td className="px-4 py-2 text-gray-900">{m.email}</td>
                    <td className="px-4 py-2 text-gray-500">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-2 text-gray-500">{formatDate(m.expiresAt)}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {m.lastLoginAt ? formatDate(m.lastLoginAt) : "Never"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.status === "disabled"
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEdit(m)}
                          className="text-xs font-medium text-brand-purple hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmingDisable(m)}
                          className="text-xs font-medium text-gray-600 hover:underline"
                        >
                          {m.status === "disabled" ? "Enable" : "Disable"}
                        </button>
                        <button
                          onClick={() => openDelete(m)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={() => setEditing(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit member</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    First name
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Expiry date
                </label>
                <input
                  type="date"
                  value={editForm.expiresAt}
                  onChange={(e) => setEditForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              {editError && <p className="text-sm text-red-600">{editError}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {savingEdit ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmingDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmingDisable.status === "disabled" ? "Enable" : "Disable"} member
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {confirmingDisable.status === "disabled"
                ? `${confirmingDisable.email} will be able to log in again.`
                : `${confirmingDisable.email} will be blocked from logging in, even with the correct password. Their data is kept.`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleToggleStatus}
                disabled={togglingStatus}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {togglingStatus
                  ? "Saving..."
                  : confirmingDisable.status === "disabled"
                    ? "Enable"
                    : "Disable"}
              </button>
              <button
                onClick={() => setConfirmingDisable(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete member</h2>
            <p className="text-sm text-gray-600 mb-1">
              This permanently deletes <span className="font-medium">{deleting.email}</span> and
              all associated data. This cannot be undone.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Type the email address to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={deleting.email}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            />
            {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== deleting.email || deletingInFlight}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deletingInFlight ? "Deleting..." : "Delete permanently"}
              </button>
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
