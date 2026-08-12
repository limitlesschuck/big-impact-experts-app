"use client";

import { useState } from "react";
import type { ResponsiveSize } from "@/lib/registerPageConfig";

// Shared field/section primitives for the admin Settings page -- pulled
// out of app/admin/(protected)/settings/page.tsx once a third consumer
// (SalesPageSettings, HomePageSettings) needed the same TextField/Section
// components the Register Page settings already used.

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 mt-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">{children}</div>}
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded border border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
        />
      </div>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
        />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function SizeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="1rem"
        className="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
      />
    </div>
  );
}

export function ResponsiveSizeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ResponsiveSize;
  onChange: (v: ResponsiveSize) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1.5">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="block text-[10px] text-gray-400 mb-0.5">Mobile</span>
          <input
            type="text"
            value={value.base}
            onChange={(e) => onChange({ ...value, base: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
          />
        </div>
        <div>
          <span className="block text-[10px] text-gray-400 mb-0.5">Tablet</span>
          <input
            type="text"
            value={value.sm}
            onChange={(e) => onChange({ ...value, sm: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
          />
        </div>
        <div>
          <span className="block text-[10px] text-gray-400 mb-0.5">Desktop</span>
          <input
            type="text"
            value={value.lg}
            onChange={(e) => onChange({ ...value, lg: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
