"use client";

import type { FaqItem } from "@/lib/salesPageConfig";

// Not a fixed set of fields -- admins can add, remove, and reorder-by-edit
// entries. Ids are only used as React keys / to locate an entry to
// update or remove; they're never shown or referenced anywhere else.
function newFaqId(): string {
  return `faq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function FaqListEditor({
  items,
  onChange,
}: {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}) {
  function updateItem(id: string, patch: Partial<FaqItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onChange([...items, { id: newFaqId(), question: "", answer: "" }]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Question {i + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            value={item.question}
            onChange={(e) => updateItem(item.id, { question: e.target.value })}
            placeholder="Question"
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
          />
          <textarea
            value={item.answer}
            onChange={(e) => updateItem(item.id, { answer: e.target.value })}
            placeholder="Answer"
            rows={2}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        + Add question
      </button>
      <p className="text-xs text-gray-400">
        Use <code>{"{price}"}</code> anywhere in an answer to insert the current membership price
        automatically.
      </p>
    </div>
  );
}
