'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Project, ProjectStatus, PitchStatus } from '@/lib/types';
import { STATUSES, PITCH_STATUSES } from '@/lib/types';
import { formatCr, formatDate, formatDuration } from '@/lib/utils';
import { StatusBadge, OwnerBadge, PitchBadge, SegmentBadge } from './Badge';
import { compileFormula } from '@/lib/calc';
import type { CalcField } from '@/lib/calc';
import { ArrowUpDown, Pencil } from 'lucide-react';

type FixedSortKey = 'name' | 'state' | 'projectValueCr' | 'durationMonths' | 'startDate' | 'status' | 'completionPercent';
type SortKey = FixedSortKey | `calc:${string}`;

export default function ProjectTable({
  projects,
  editable = false,
  onToggleEditable,
  onUpdate,
  calcFields = [],
}: {
  projects: Project[];
  editable?: boolean;
  onToggleEditable?: () => void;
  onUpdate?: (id: string, patch: Partial<Project>) => void;
  calcFields?: CalcField[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const compiledCalc = useMemo(
    () =>
      calcFields.map((f) => {
        let fn: ((p: Project) => number | null) | null = null;
        try {
          fn = compileFormula(f.formula);
        } catch {
          fn = null;
        }
        return { ...f, fn };
      }),
    [calcFields]
  );

  function calcValue(key: string, p: Project): number | null {
    const field = compiledCalc.find((f) => f.id === key);
    if (!field || !field.fn) return null;
    try {
      return field.fn(p);
    } catch {
      return null;
    }
  }

  const sorted = useMemo(() => {
    const copy = [...projects];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey.startsWith('calc:')) {
        const id = sortKey.slice(5);
        const av = calcValue(id, a);
        const bv = calcValue(id, b);
        if (av === null && bv === null) cmp = 0;
        else if (av === null) return 1;
        else if (bv === null) return -1;
        else cmp = av - bv;
      } else if (sortKey === 'name' || sortKey === 'state' || sortKey === 'status') {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      } else if (sortKey === 'startDate') {
        if (a.startDate === null && b.startDate === null) cmp = 0;
        else if (a.startDate === null) return 1;
        else if (b.startDate === null) return -1;
        else cmp = a.startDate.localeCompare(b.startDate);
      } else {
        const key = sortKey as 'projectValueCr' | 'durationMonths' | 'completionPercent';
        const av = a[key];
        const bv = b[key];
        if (av === null && bv === null) cmp = 0;
        else if (av === null) return 1;
        else if (bv === null) return -1;
        else cmp = av - bv;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, sortKey, sortDir, compiledCalc]);

  function headerClick(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const columns: { key: FixedSortKey; label: string }[] = [
    { key: 'name', label: 'Project' },
    { key: 'state', label: 'State' },
    { key: 'status', label: 'Status' },
    { key: 'projectValueCr', label: 'Value' },
    { key: 'completionPercent', label: 'Completion' },
    { key: 'durationMonths', label: 'Duration' },
    { key: 'startDate', label: 'Start' },
  ];

  function commit(id: string, patch: Partial<Project>) {
    onUpdate?.(id, patch);
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">
        No projects match the current filters. Try widening your filters or reset them.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-sm">
      {onToggleEditable && (
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2">
          <p className="text-xs text-ink-500">{editable ? 'Edit mode: click a highlighted cell to change it. Changes save automatically.' : 'Turn on edit mode to update contractor, value, status or pitch inline.'}</p>
          <button
            type="button"
            onClick={onToggleEditable}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              editable ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-ink-200 text-ink-700 hover:bg-ink-50'
            }`}
          >
            <Pencil size={12} /> {editable ? 'Editing on' : 'Edit'}
          </button>
        </div>
      )}
      <table className="min-w-full divide-y divide-ink-200 text-sm">
        <thead className="bg-ink-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => headerClick(col.key)}
                className="cursor-pointer select-none whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 hover:text-ink-800"
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  <ArrowUpDown size={11} className={sortKey === col.key ? 'text-brand-600' : 'text-ink-300'} />
                </span>
              </th>
            ))}
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Segment</th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Owner</th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Contractor</th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Client</th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Pitch</th>
            {compiledCalc.map((f) => (
              <th
                key={f.id}
                onClick={() => headerClick(`calc:${f.id}`)}
                className="cursor-pointer select-none whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-600 hover:text-brand-800"
                title={f.formula}
              >
                <span className="flex items-center gap-1">
                  {f.name}
                  <ArrowUpDown size={11} className={sortKey === `calc:${f.id}` ? 'text-brand-600' : 'text-ink-300'} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {sorted.map((p) => (
            <tr key={p.id} className="hover:bg-brand-50/40">
              <td className="max-w-xs px-4 py-3">
                <Link href={`/projects/${p.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                  {p.name}
                </Link>
                <p className="mt-0.5 text-xs text-ink-500">{p.sector} · {p.subSector}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-600">
                {p.city ? `${p.city}, ` : ''}{p.state}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                {editable ? (
                  <select
                    value={p.status}
                    onChange={(e) => commit(p.id, { status: e.target.value as ProjectStatus })}
                    className="rounded border border-brand-300 bg-brand-50/50 px-1.5 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={p.status} />
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-800">
                {editable ? (
                  <EditableNumber value={p.projectValueCr} onCommit={(v) => commit(p.id, { projectValueCr: v })} />
                ) : (
                  formatCr(p.projectValueCr)
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-2" title={p.completionBasis === 'disclosed' ? 'Disclosed by source' : p.completionBasis === 'calculated' ? 'Estimated from disclosed timeline' : 'Estimated from project status'}>
                  <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.completionPercent}%` }} />
                  </div>
                  <span className="text-xs tabular-nums text-ink-600">{p.completionPercent}%</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-600">{formatDuration(p.durationMonths)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-600">{formatDate(p.startDate)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <SegmentBadge segment={p.segmentC} />
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <OwnerBadge ownerType={p.ownerType} />
              </td>
              <td className="max-w-[10rem] px-4 py-3 text-ink-600">
                {editable ? (
                  <EditableText value={p.contractor ?? ''} placeholder="Not yet awarded" onCommit={(v) => commit(p.id, { contractor: v || null })} />
                ) : (
                  <span className="block truncate" title={p.contractor ?? 'Not yet awarded'}>
                    {p.contractor ?? <span className="text-ink-400">Not yet awarded</span>}
                  </span>
                )}
              </td>
              <td className="max-w-[10rem] px-4 py-3 text-ink-600">
                {editable ? (
                  <EditableText value={p.client ?? ''} onCommit={(v) => commit(p.id, { client: v })} />
                ) : (
                  <span className="block truncate" title={p.client}>{p.client}</span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                {editable ? (
                  <select
                    value={p.pitchStatus}
                    onChange={(e) => commit(p.id, { pitchStatus: e.target.value as PitchStatus })}
                    className="rounded border border-brand-300 bg-brand-50/50 px-1.5 py-1 text-xs"
                  >
                    {PITCH_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <PitchBadge pitchStatus={p.pitchStatus} />
                )}
              </td>
              {compiledCalc.map((f) => {
                const v = f.fn ? f.fn(p) : null;
                return (
                  <td key={f.id} className="whitespace-nowrap px-4 py-3 text-ink-700">
                    {v === null ? <span className="text-ink-400">—</span> : v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditableText({ value, onCommit, placeholder }: { value: string; onCommit: (v: string) => void; placeholder?: string }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <input
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== value) onCommit(draft);
      }}
      className="w-full rounded border border-brand-300 bg-brand-50/50 px-1.5 py-1 text-sm"
    />
  );
}

function EditableNumber({ value, onCommit }: { value: number | null; onCommit: (v: number | null) => void }) {
  const [draft, setDraft] = useState(value === null ? '' : String(value));
  useEffect(() => setDraft(value === null ? '' : String(value)), [value]);
  return (
    <input
      type="number"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const num = draft === '' ? null : Number(draft);
        if (num !== value && !(num !== null && isNaN(num))) onCommit(num);
      }}
      className="w-24 rounded border border-brand-300 bg-brand-50/50 px-1.5 py-1 text-sm"
    />
  );
}
