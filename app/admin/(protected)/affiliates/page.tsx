"use client";

import { useEffect, useState } from "react";

interface AffiliateRoute {
  id: string;
  crisisCategory: string;
  urgencyLevel: string;
  affiliateName: string;
  affiliateUrl: string;
  priority: number;
  isActive: boolean;
  isDefault: boolean;
}

const URGENCY_LABELS: Record<string, string> = {
  crisis: "Crisis",
  struggling: "Struggling",
  healing: "Healing",
  exploring: "Exploring",
  any: "Any urgency",
};

const EMPTY_FORM = {
  crisisCategory: "grief",
  urgencyLevel: "crisis",
  affiliateName: "",
  affiliateUrl: "",
  priority: 1,
  isDefault: false,
};

export default function AffiliatesPage() {
  const [routes, setRoutes] = useState<AffiliateRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AffiliateRoute | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    const map = Object.fromEntries(
      (data.categories ?? []).map((c: { value: string; label: string }) => [c.value, c.label])
    );
    setCategoryLabels(map);
  }

  async function loadRoutes() {
    setLoading(true);
    const res = await fetch("/api/admin/affiliates");
    const data = await res.json();
    setRoutes(data);
    setLoading(false);
  }

  async function handleToggleActive(route: AffiliateRoute) {
    await fetch(`/api/admin/affiliates/${route.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !route.isActive }),
    });
    loadRoutes();
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/admin/affiliates/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliateName: editing.affiliateName,
        affiliateUrl: editing.affiliateUrl,
        priority: editing.priority,
        isDefault: editing.isDefault,
        crisisCategory: editing.crisisCategory,
        urgencyLevel: editing.urgencyLevel,
      }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "Route updated" });
      setEditing(null);
      loadRoutes();
    } else {
      setMessage({ type: "error", text: "Update failed" });
    }
    setSaving(false);
  }

  async function handleAdd() {
    setSaving(true);
    const res = await fetch("/api/admin/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "Route added" });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      loadRoutes();
    } else {
      setMessage({ type: "error", text: "Failed to add route" });
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this affiliate route?")) return;
    await fetch(`/api/admin/affiliates/${id}`, { method: "DELETE" });
    loadRoutes();
  }

  useEffect(() => { loadRoutes(); loadCategories(); }, []);

  const defaultRoutes = routes.filter((r) => r.isDefault);
  const categoryRoutes = routes.filter((r) => !r.isDefault);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Affiliate routes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage which affiliate offers are shown based on crisis category and urgency
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditing(null); }}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add route
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Add new route</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Crisis category</label>
              <select value={form.crisisCategory} onChange={(e) => setForm((f) => ({ ...f, crisisCategory: e.target.value }))} className="input">
                {Object.entries(categoryLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Urgency level</label>
              <select value={form.urgencyLevel} onChange={(e) => setForm((f) => ({ ...f, urgencyLevel: e.target.value }))} className="input">
                {Object.entries(URGENCY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Affiliate name</label>
              <input type="text" value={form.affiliateName} onChange={(e) => setForm((f) => ({ ...f, affiliateName: e.target.value }))} className="input" placeholder="e.g. BetterHelp" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Affiliate URL</label>
              <input type="url" value={form.affiliateUrl} onChange={(e) => setForm((f) => ({ ...f, affiliateUrl: e.target.value }))} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority (lower = higher priority)</label>
              <input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: parseInt(e.target.value) }))} className="input" min={1} />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
              <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default fallback route</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Add route"}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Default routes */}
          {defaultRoutes.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Default fallback</h2>
              <RouteTable routes={defaultRoutes} editing={editing} setEditing={setEditing} onToggle={handleToggleActive} onSave={handleSaveEdit} onDelete={handleDelete} saving={saving} categoryLabels={categoryLabels} />
            </div>
          )}

          {/* Category routes */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category routes</h2>
            <RouteTable routes={categoryRoutes} editing={editing} setEditing={setEditing} onToggle={handleToggleActive} onSave={handleSaveEdit} onDelete={handleDelete} saving={saving} categoryLabels={categoryLabels} />
          </div>
        </div>
      )}
    </div>
  );
}

function RouteTable({
  routes,
  editing,
  setEditing,
  onToggle,
  onSave,
  onDelete,
  saving,
  categoryLabels,
}: {
  routes: AffiliateRoute[];
  editing: AffiliateRoute | null;
  setEditing: (r: AffiliateRoute | null) => void;
  onToggle: (r: AffiliateRoute) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  saving: boolean;
  categoryLabels: Record<string, string>;
}) {
  const URGENCY_LABELS: Record<string, string> = {
    crisis: "Crisis",
    struggling: "Struggling",
    healing: "Healing",
    exploring: "Exploring",
    any: "Any",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Category</th>
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Urgency</th>
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Affiliate</th>
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">URL</th>
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Active</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {routes.map((route) =>
            editing?.id === route.id ? (
              <tr key={route.id} className="bg-gray-50">
                <td className="px-4 py-2">
                  <select value={editing.crisisCategory} onChange={(e) => setEditing({ ...editing, crisisCategory: e.target.value })} className="input text-xs py-1">
                    {Object.entries(categoryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select value={editing.urgencyLevel} onChange={(e) => setEditing({ ...editing, urgencyLevel: e.target.value })} className="input text-xs py-1">
                    {Object.entries(URGENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input type="text" value={editing.affiliateName} onChange={(e) => setEditing({ ...editing, affiliateName: e.target.value })} className="input text-xs py-1" />
                </td>
                <td className="px-4 py-2 hidden md:table-cell">
                  <input type="url" value={editing.affiliateUrl} onChange={(e) => setEditing({ ...editing, affiliateUrl: e.target.value })} className="input text-xs py-1" />
                </td>
                <td className="px-4 py-2">
                  <input type="checkbox" checked={editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={onSave} disabled={saving} className="text-xs font-medium text-white bg-gray-900 px-3 py-1 rounded-lg disabled:opacity-50">Save</button>
                    <button onClick={() => setEditing(null)} className="text-xs font-medium text-gray-500 hover:text-gray-700">Cancel</button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={route.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900">{categoryLabels[route.crisisCategory] ?? route.crisisCategory}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{URGENCY_LABELS[route.urgencyLevel] ?? route.urgencyLevel}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">{route.affiliateName}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <a href={route.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-purple hover:underline truncate block max-w-xs">
                    {route.affiliateUrl}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onToggle(route)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${route.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${route.isActive ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setEditing(route)} className="text-xs font-medium text-gray-600 hover:text-gray-900">Edit</button>
                    <button onClick={() => onDelete(route.id)} className="text-xs font-medium text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
