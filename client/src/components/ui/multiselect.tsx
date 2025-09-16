import { useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ label, options, value, onChange, placeholder }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="relative min-w-[180px]">
      {label && <label className="block text-xs font-medium mb-1 text-slate-600">{label}</label>}
      <button
        type="button"
        className="w-full border rounded px-3 py-2 bg-white text-left flex flex-wrap gap-1 items-center min-h-[38px]"
        onClick={() => setOpen((o) => !o)}
      >
        {value.length === 0 ? (
          <span className="text-slate-400 text-sm">{placeholder || 'Select...'}</span>
        ) : (
          value.map((val) => {
            const opt = options.find((o) => o.value === val);
            return (
              <span key={val} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs mr-1 mb-1">
                {opt?.label || val}
              </span>
            );
          })
        )}
        <span className="ml-auto text-slate-400">▼</span>
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white border rounded shadow-lg max-h-56 overflow-y-auto">
          {options.length === 0 && (
            <div className="p-2 text-slate-400 text-sm">No options</div>
          )}
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer">
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
                className="mr-2 accent-blue-600"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
} 