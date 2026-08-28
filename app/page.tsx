'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useProjects } from '@/lib/useProjects';
import { EMPTY_FILTERS, applyFilters } from '@/lib/filters';
import type { Filters } from '@/lib/filters';
import { uniqueSorted, totalValueCr, totalSteelTonnes, totalCementTonnes, formatCr, formatTonnes, countWithDisclosedValue } from '@/lib/utils';
import { SECTORS, STATUSES, OWNER_TYPES } from '@/lib/types';
import FilterBar from '@/components/FilterBar';
import StatCard from '@/components/StatCard';
import { StateBarChart, SectorBarChart, OwnerPieChart, TopContractorsChart, TimelineChart } from '@/components/DashboardCharts';
import { Building2, IndianRupee, Layers, MapPin, Weight, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { projects, error } = useProjects();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const stateOptions = useMemo(() => uniqueSorted((projects ?? []).map((p) => p.state)), [projects]);
  const filtered = useMemo(() => applyFilters(projects ?? [], filters), [projects, filters]);

  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  if (!projects) {
    return <p className="p-8 text-center text-sm text-ink-500">Loading dashboard…</p>;
  }

  const contractorCount = new Set(filtered.map((p) => p.contractor).filter((c): c is string => Boolean(c))).size;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Project Intelligence Dashboard</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Government, PSU and private construction projects across India — filter to find contractors worth pitching TMT, MS &amp; Cement to.
          </p>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Browse all projects <ArrowRight size={14} />
        </Link>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
        Data compiled from public sources (NHAI, metro rail corporations, port/power authorities, company disclosures, news) as of Aug 2026 — not every field is disclosed for every project, and figures can move. Check the source link on each project before pitching. Add your own verified pipeline anytime via{' '}
        <Link href="/import" className="font-semibold underline">
          Import Data
        </Link>
        .
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        stateOptions={stateOptions}
        sectorOptions={SECTORS}
        ownerOptions={OWNER_TYPES}
        statusOptions={STATUSES}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Layers} label="Projects" value={String(filtered.length)} sub={`of ${projects.length} total`} />
        <StatCard icon={IndianRupee} label="Total Value" value={formatCr(totalValueCr(filtered))} sub={`${countWithDisclosedValue(filtered)} of ${filtered.length} disclose a value`} />
        <StatCard icon={Weight} label="Est. Steel Demand" value={formatTonnes(totalSteelTonnes(filtered))} sub="TMT/MS opportunity" />
        <StatCard icon={Weight} label="Est. Cement Demand" value={formatTonnes(totalCementTonnes(filtered))} sub="Cement opportunity" />
        <StatCard icon={Building2} label="Contractors" value={String(contractorCount)} sub="Unique EPCs / developers" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StateBarChart projects={filtered} />
        <OwnerPieChart projects={filtered} />
        <SectorBarChart projects={filtered} />
        <TopContractorsChart projects={filtered} />
        <div className="lg:col-span-2">
          <TimelineChart projects={filtered} />
        </div>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-800">Largest opportunities right now</p>
          <Link href="/projects" className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-ink-100">
          {[...filtered]
            .filter((p) => p.projectValueCr !== null)
            .sort((a, b) => (b.projectValueCr as number) - (a.projectValueCr as number))
            .slice(0, 5)
            .map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-brand-50/40">
                <div>
                  <p className="text-sm font-medium text-ink-900">{p.name}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-500">
                    <MapPin size={11} /> {p.city}, {p.state} · {p.contractor ?? 'Not yet awarded'}
                  </p>
                </div>
                <p className="whitespace-nowrap text-sm font-semibold text-ink-800">{formatCr(p.projectValueCr)}</p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
