'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import { PITCH_STATUSES } from '@/lib/types';
import { formatCr, formatDate, formatTonnes, formatDuration } from '@/lib/utils';
import { StatusBadge, OwnerBadge, PitchBadge } from '@/components/Badge';
import { ArrowLeft, Building2, Calendar, MapPin, Landmark, Save, Trash2, ExternalLink } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pitchStatus, setPitchStatus] = useState('Not Contacted');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data: Project) => {
        setProject(data);
        setPitchStatus(data.pitchStatus);
        setNotes(data.notes);
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/projects/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pitchStatus, notes }),
    });
    const updated = await res.json();
    setProject(updated);
    setSaving(false);
    setSavedAt(Date.now());
  }

  async function remove() {
    if (!confirm('Remove this project from the dashboard? This cannot be undone.')) return;
    await fetch(`/api/projects/${params.id}`, { method: 'DELETE' });
    router.push('/projects');
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">
        Project not found.{' '}
        <Link href="/projects" className="font-medium text-brand-700 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return <p className="p-8 text-center text-sm text-ink-500">Loading project…</p>;
  }

  return (
    <div className="space-y-5">
      <Link href="/projects" className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-700">
        <ArrowLeft size={14} /> Back to projects
      </Link>

      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <OwnerBadge ownerType={project.ownerType} />
              <span className="text-xs text-ink-500">{project.sector}</span>
            </div>
            <h1 className="text-xl font-bold text-ink-900">{project.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
              <MapPin size={13} /> {project.city ? `${project.city}, ` : ''}{project.state}
            </p>
          </div>
          <p className="text-2xl font-bold text-brand-700">{formatCr(project.projectValueCr)}</p>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-700">{project.description}</p>

        {project.sourceUrl && (
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline"
          >
            <ExternalLink size={12} /> View source
          </a>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info icon={Building2} label="Contractor / EPC" value={project.contractor} />
          <Info icon={Landmark} label="Client / Authority" value={project.client} />
          <Info icon={Calendar} label="Timeline" value={`${formatDate(project.startDate)} → ${formatDate(project.endDate)}`} sub={`${formatDuration(project.durationMonths)}${project.durationMonths ? ' duration' : ''}`} />
          <Info icon={Building2} label="Funding Source" value={project.fundingSource} />
          <Info icon={Calendar} label="Tender Date" value={formatDate(project.tenderDate)} />
          <Info icon={Calendar} label="Last Updated" value={formatDate(project.lastUpdated)} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-ink-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">Est. Steel (TMT/MS) Requirement</p>
            <p className="mt-1 text-lg font-bold text-ink-900">{formatTonnes(project.steelRequirementTonnes)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">Est. Cement Requirement</p>
            <p className="mt-1 text-lg font-bold text-ink-900">{formatTonnes(project.cementRequirementTonnes)}</p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-ink-400">
          Material requirements aren&apos;t disclosed in public sources for most projects — estimate from project scope and confirm with the contractor before quoting.
        </p>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-800">Your pitch tracker</p>
          <PitchBadge pitchStatus={project.pitchStatus} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block sm:col-span-1">
            <span className="mb-1 block text-xs font-medium text-ink-600">Pitch status</span>
            <select
              value={pitchStatus}
              onChange={(e) => setPitchStatus(e.target.value)}
              className="w-full rounded-md border border-ink-200 px-2.5 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            >
              {PITCH_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-ink-600">Notes (contact made, quote given, next follow-up...)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-ink-200 px-2.5 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <Save size={14} /> {saving ? 'Saving…' : 'Save'}
          </button>
          {savedAt && <span className="text-xs text-ink-500">Saved</span>}
          <button
            type="button"
            onClick={remove}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-500">
        <Icon size={12} /> {label}
      </p>
      <p className="mt-1 text-sm font-medium text-ink-800">{value}</p>
      {sub && <p className="text-xs text-ink-500">{sub}</p>}
    </div>
  );
}
