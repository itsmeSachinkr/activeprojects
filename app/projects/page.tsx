'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProjects } from '@/lib/useProjects';
import { EMPTY_FILTERS, applyFilters } from '@/lib/filters';
import type { Filters } from '@/lib/filters';
import { uniqueSorted, projectsToCsv } from '@/lib/utils';
import { SECTORS, STATUSES, OWNER_TYPES, SEGMENTS_C } from '@/lib/types';
import FilterBar from '@/components/FilterBar';
import ProjectTable from '@/components/ProjectTable';
import { Download, X } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-ink-500">Loading projects…</p>}>
      <ProjectsPageInner />
    </Suspense>
  );
}

function ProjectsPageInner() {
  const { projects, error } = useProjects();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  useEffect(() => {
    const contractor = searchParams.get('contractor');
    if (contractor) {
      setFilters((f) => ({ ...f, contractor }));
    }
  }, [searchParams]);

  const stateOptions = useMemo(() => uniqueSorted((projects ?? []).map((p) => p.state)), [projects]);
  const subSectorOptions = useMemo(() => uniqueSorted((projects ?? []).map((p) => p.subSector)), [projects]);
  const filtered = useMemo(() => applyFilters(projects ?? [], filters), [projects, filters]);

  function exportCsv() {
    const csv = projectsToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  if (!projects) {
    return <p className="p-8 text-center text-sm text-ink-500">Loading projects…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">All Projects</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            {filtered.length} of {projects.length} projects match your filters.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {filters.contractor && (
        <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-800">
          Filtering by contractor: <span className="font-semibold">{filters.contractor}</span>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, contractor: '' })}
            className="ml-1 rounded p-0.5 hover:bg-brand-100"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        stateOptions={stateOptions}
        sectorOptions={SECTORS}
        subSectorOptions={subSectorOptions}
        segmentOptions={SEGMENTS_C}
        ownerOptions={OWNER_TYPES}
        statusOptions={STATUSES}
      />

      <ProjectTable projects={filtered} />
    </div>
  );
}
