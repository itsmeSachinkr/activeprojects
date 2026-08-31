'use client';

import { Search, RotateCcw } from 'lucide-react';
import MultiSelect from './MultiSelect';
import type { Filters } from '@/lib/filters';
import { EMPTY_FILTERS } from '@/lib/filters';

export default function FilterBar({
  filters,
  setFilters,
  stateOptions,
  sectorOptions,
  subSectorOptions,
  ownerOptions,
  statusOptions,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  stateOptions: string[];
  sectorOptions: string[];
  subSectorOptions: string[];
  ownerOptions: string[];
  statusOptions: string[];
}) {
  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters({ ...filters, [key]: value });
  }

  const activeCount =
    filters.states.length +
    filters.sectors.length +
    filters.subSectors.length +
    filters.ownerTypes.length +
    filters.statuses.length +
    (filters.contractor ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.yearFrom !== null ? 1 : 0) +
    (filters.yearTo !== null ? 1 : 0) +
    (filters.minDurationMonths !== null ? 1 : 0) +
    (filters.maxDurationMonths !== null ? 1 : 0) +
    (filters.minValueCr !== null ? 1 : 0) +
    (filters.maxValueCr !== null ? 1 : 0);

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[14rem]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search project, contractor, client, city..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="w-full rounded-md border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm text-ink-700 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
        </div>
        <MultiSelect label="State" options={stateOptions} selected={filters.states} onChange={(v) => update('states', v)} />
        <MultiSelect label="Sector" options={sectorOptions} selected={filters.sectors} onChange={(v) => update('sectors', v)} />
        <MultiSelect label="Sub-Sector" options={subSectorOptions} selected={filters.subSectors} onChange={(v) => update('subSectors', v)} />
        <MultiSelect label="Owner Type" options={ownerOptions} selected={filters.ownerTypes} onChange={(v) => update('ownerTypes', v)} />
        <MultiSelect label="Status" options={statusOptions} selected={filters.statuses} onChange={(v) => update('statuses', v)} />
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="flex items-center gap-1 rounded-md border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <NumberField label="Start year from" value={filters.yearFrom} onChange={(v) => update('yearFrom', v)} placeholder="e.g. 2023" />
        <NumberField label="Start year to" value={filters.yearTo} onChange={(v) => update('yearTo', v)} placeholder="e.g. 2026" />
        <NumberField label="Min duration (months)" value={filters.minDurationMonths} onChange={(v) => update('minDurationMonths', v)} placeholder="0" />
        <NumberField label="Max duration (months)" value={filters.maxDurationMonths} onChange={(v) => update('maxDurationMonths', v)} placeholder="60" />
        <NumberField label="Min project value (₹ Cr)" value={filters.minValueCr} onChange={(v) => update('minValueCr', v)} placeholder="e.g. 0.01" />
        <NumberField label="Max project value (₹ Cr)" value={filters.maxValueCr} onChange={(v) => update('maxValueCr', v)} placeholder="e.g. 125000" />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">{label}</span>
      <input
        type="number"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-700 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
      />
    </label>
  );
}
