"use client";

// Generic add/remove/edit editor for a flat list of plain strings --
// simpler than FaqListEditor since there's no question/answer pairing,
// just one text input per row. Used for the Sales Page's topic pills and
// AI Expert Match challenge pills.
export default function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel: string;
}) {
  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="text-xs text-red-600 hover:underline flex-shrink-0"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        + {addLabel}
      </button>
    </div>
  );
}
