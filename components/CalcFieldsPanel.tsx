'use client';

import { useState } from 'react';
import { Plus, X, Calculator, AlertCircle } from 'lucide-react';
import { CALC_FIELD_VARIABLES, compileFormula } from '@/lib/calc';
import type { CalcField } from '@/lib/calc';

export default function CalcFieldsPanel({
  calcFields,
  setCalcFields,
}: {
  calcFields: CalcField[];
  setCalcFields: (fields: CalcField[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [formula, setFormula] = useState('');
  const [err, setErr] = useState<string | null>(null);

  function addField() {
    if (!name.trim()) {
      setErr('Give the field a name.');
      return;
    }
    try {
      compileFormula(formula);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Invalid formula');
      return;
    }
    setCalcFields([...calcFields, { id: `calc_${Date.now()}`, name: name.trim(), formula: formula.trim() }]);
    setName('');
    setFormula('');
    setErr(null);
  }

  function removeField(id: string) {
    setCalcFields(calcFields.filter((f) => f.id !== id));
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold text-ink-800"
      >
        <span className="flex items-center gap-1.5">
          <Calculator size={15} className="text-brand-600" /> Calculated fields
          {calcFields.length > 0 && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">{calcFields.length}</span>
          )}
        </span>
        <span className="text-xs font-normal text-ink-500">{open ? 'Hide' : 'Add / manage'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-ink-500">
            Define a custom column computed from a formula (Tableau-style), e.g. an estimated steel cost or a
            value-per-month metric. Applies only in this browser and is included in table columns and exports.
            Available fields: {CALC_FIELD_VARIABLES.map((v) => v.key).join(', ')}.
          </p>

          {calcFields.length > 0 && (
            <ul className="space-y-1.5">
              {calcFields.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2 rounded-md bg-ink-50 px-3 py-1.5 text-sm">
                  <span>
                    <span className="font-medium text-ink-800">{f.name}</span>{' '}
                    <span className="text-ink-500">= {f.formula}</span>
                  </span>
                  <button type="button" onClick={() => removeField(f.id)} className="rounded p-0.5 text-ink-400 hover:bg-ink-200 hover:text-ink-700">
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
            <input
              type="text"
              placeholder="Field name, e.g. Est. Steel Cost"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-700 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <input
              type="text"
              placeholder="Formula, e.g. projectValueCr * 0.06"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-700 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <button
              type="button"
              onClick={addField}
              className="flex items-center justify-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {err && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={12} /> {err}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
