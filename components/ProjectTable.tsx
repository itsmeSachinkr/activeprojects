'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/types';
import { formatCr, formatDate, formatDuration } from '@/lib/utils';
import { StatusBadge, OwnerBadge, PitchBadge } from './Badge';
import { ArrowUpDown } from 'lucide-react';

type SortKey = 'name' | 'state' | 'projectValueCr' | 'durationMonths' | 'startDate' | 'status';

export default function ProjectTable({ projects }: { projects: Project[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const copy = [...projects];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name' || sortKey === 'state' || sortKey === 'status') {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      } else if (sortKey === 'startDate') {
        // Nulls sort last regardless of direction.
        if (a.startDate === null && b.startDate === null) cmp = 0;
        else if (a.startDate === null) return 1;
        else if (b.startDate === null) return -1;
        else cmp = a.startDate.localeCompare(b.startDate);
      } else {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av === null && bv === null) cmp = 0;
        else if (av === null) return 1;
        else if (bv === null) return -1;
        else cmp = av - bv;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [projects, sortKey, sortDir]);

  function headerClick(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Project' },
    { key: 'state', label: 'State' },
    { key: 'status', label: 'Status' },
    { key: 'projectValueCr', label: 'Value' },
    { key: 'durationMonths', label: 'Duration' },
    { key: 'startDate', label: 'Start' },
  ];

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">
        No projects match the current filters. Try widening your filters or reset them.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-sm">
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
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Owner</th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Contractor</th>
            <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Pitch</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {sorted.map((p) => (
            <tr key={p.id} className="hover:bg-brand-50/40">
              <td className="max-w-xs px-4 py-3">
                <Link href={`/projects/${p.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                  {p.name}
                </Link>
                <p className="mt-0.5 text-xs text-ink-500">{p.sector}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-600">
                {p.city}, {p.state}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={p.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-800">{formatCr(p.projectValueCr)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-600">{formatDuration(p.durationMonths)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-600">{formatDate(p.startDate)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <OwnerBadge ownerType={p.ownerType} />
              </td>
              <td className="max-w-[10rem] truncate px-4 py-3 text-ink-600" title={p.contractor}>
                {p.contractor}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <PitchBadge pitchStatus={p.pitchStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
