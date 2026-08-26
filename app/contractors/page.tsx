'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useProjects } from '@/lib/useProjects';
import { summarizeContractors, formatCr, formatTonnes } from '@/lib/utils';
import { Building2, Search } from 'lucide-react';

export default function ContractorsPage() {
  const { projects, error } = useProjects();
  const [search, setSearch] = useState('');

  const contractors = useMemo(() => summarizeContractors(projects ?? []), [projects]);
  const filtered = useMemo(
    () => contractors.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [contractors, search]
  );

  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  if (!projects) {
    return <p className="p-8 text-center text-sm text-ink-500">Loading contractors…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Contractors &amp; Developers</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          {filtered.length} contractors / EPC firms / developers, ranked by total project value — your highest-leverage accounts to pitch.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          placeholder="Search contractor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm text-ink-700 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <Link
            key={c.name}
            href={`/projects?contractor=${encodeURIComponent(c.name)}`}
            className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Building2 size={17} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{c.name}</p>
                <p className="text-xs text-ink-500">
                  {c.projectCount} project{c.projectCount !== 1 ? 's' : ''} · {c.activeProjects} active
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-ink-50 px-2.5 py-2">
                <p className="text-ink-500">Total Value</p>
                <p className="font-semibold text-ink-800">{formatCr(c.totalValueCr)}</p>
              </div>
              <div className="rounded-md bg-ink-50 px-2.5 py-2">
                <p className="text-ink-500">Steel Demand</p>
                <p className="font-semibold text-ink-800">{formatTonnes(c.totalSteelTonnes)}</p>
              </div>
              <div className="rounded-md bg-ink-50 px-2.5 py-2">
                <p className="text-ink-500">Cement Demand</p>
                <p className="font-semibold text-ink-800">{formatTonnes(c.totalCementTonnes)}</p>
              </div>
              <div className="rounded-md bg-ink-50 px-2.5 py-2">
                <p className="text-ink-500">States Active</p>
                <p className="font-semibold text-ink-800">{c.states.length}</p>
              </div>
            </div>

            <p className="mt-2.5 truncate text-[11px] text-ink-400">{c.sectors.join(' · ')}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
