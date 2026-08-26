'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-w-[9rem] items-center justify-between gap-2 rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 hover:border-ink-300"
      >
        <span>
          {label}
          {selected.length > 0 && (
            <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {selected.length}
            </span>
          )}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1 max-h-72 w-64 overflow-y-auto rounded-lg border border-ink-200 bg-white p-2 shadow-lg">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mb-1 flex w-full items-center gap-1 rounded px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              <X size={12} /> Clear {label.toLowerCase()}
            </button>
          )}
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="h-3.5 w-3.5 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
