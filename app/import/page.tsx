'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import { Upload, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Project } from '@/lib/types';

const TEMPLATE_HEADERS = [
  'name', 'description', 'sector', 'ownerType', 'state', 'city', 'contractor', 'client',
  'projectValueCr', 'steelRequirementTonnes', 'cementRequirementTonnes',
  'startDate', 'endDate', 'durationMonths', 'status', 'fundingSource',
  'tenderDate', 'contactPerson', 'contactPhone', 'contactEmail', 'sourceUrl',
];

const TEMPLATE_EXAMPLE = [
  'Example Highway Widening Project', 'Widening of NH-XX from 4 to 6 lanes', 'Roads & Highways', 'Government',
  'Maharashtra', 'Nashik', 'ABC Infra Ltd', 'National Highways Authority of India (NHAI)',
  '850', '18000', '70000', '2025-01-01', '2027-01-01', '24', 'Tendering', 'Central',
  '2024-10-01', '', '', '', '',
];

export default function ImportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [result, setResult] = useState<{ created: number; updated: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function downloadTemplate() {
    const csv = [TEMPLATE_HEADERS.join(','), TEMPLATE_EXAMPLE.map((v) => (v.includes(',') ? `"${v}"` : v)).join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infrapulse-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const errors = res.errors.map((e) => `Row ${e.row ?? '?'}: ${e.message}`);
        const missingRequired = res.data.filter((r) => !r.name || !r.state || !r.contractor);
        if (missingRequired.length) {
          errors.push(`${missingRequired.length} row(s) are missing required fields (name, state, contractor).`);
        }
        setParseErrors(errors);
        setRows(res.data);
      },
    });
  }

  async function submitImport() {
    setSubmitting(true);
    const payload: Partial<Project>[] = rows.map((r) => ({
      name: r.name,
      description: r.description ?? '',
      sector: (r.sector as Project['sector']) ?? 'Roads & Highways',
      ownerType: (r.ownerType as Project['ownerType']) ?? 'Government',
      state: r.state,
      city: r.city ?? '',
      contractor: r.contractor,
      client: r.client ?? '',
      projectValueCr: r.projectValueCr ? Number(r.projectValueCr) : null,
      steelRequirementTonnes: r.steelRequirementTonnes ? Number(r.steelRequirementTonnes) : null,
      cementRequirementTonnes: r.cementRequirementTonnes ? Number(r.cementRequirementTonnes) : null,
      startDate: r.startDate || null,
      endDate: r.endDate || null,
      durationMonths: r.durationMonths ? Number(r.durationMonths) : null,
      status: (r.status as Project['status']) ?? 'Tendering',
      fundingSource: (r.fundingSource as Project['fundingSource']) ?? 'State',
      tenderDate: r.tenderDate || null,
      contactPerson: r.contactPerson || null,
      contactPhone: r.contactPhone || null,
      contactEmail: r.contactEmail || null,
      sourceUrl: r.sourceUrl || null,
    }));

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
    setSubmitting(false);
    setRows([]);
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Import Real Project Data</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Replace or extend the sample dataset with your own verified pipeline — sourced from GeM, state PWD/CPWD tender portals, NIC Project
          Monitoring Group, RERA filings, or your own market research.
        </p>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink-800">Step 1 — Download the CSV template</p>
            <p className="text-xs text-ink-500">Fill it in Excel/Google Sheets, then upload it below.</p>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            <Download size={14} /> Download template
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-ink-800">Step 2 — Upload your CSV</p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-300 bg-ink-50 px-6 py-10 text-center hover:border-brand-400">
          <Upload size={22} className="text-ink-400" />
          <span className="text-sm text-ink-600">{fileName || 'Click to choose a .csv file, or drag it here'}</span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>

        {parseErrors.length > 0 && (
          <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
            <p className="mb-1 flex items-center gap-1 font-medium">
              <AlertTriangle size={13} /> {parseErrors.length} issue(s) found
            </p>
            <ul className="list-disc space-y-0.5 pl-4">
              {parseErrors.slice(0, 8).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-ink-600">Preview — {rows.length} row(s) parsed</p>
            <div className="max-h-64 overflow-auto rounded-md border border-ink-200">
              <table className="min-w-full text-xs">
                <thead className="bg-ink-50">
                  <tr>
                    {['name', 'state', 'contractor', 'projectValueCr', 'status'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-1.5 text-left font-semibold text-ink-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {rows.slice(0, 20).map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5">{r.name}</td>
                      <td className="px-3 py-1.5">{r.state}</td>
                      <td className="px-3 py-1.5">{r.contractor}</td>
                      <td className="px-3 py-1.5">{r.projectValueCr}</td>
                      <td className="px-3 py-1.5">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={submitImport}
              disabled={submitting}
              className="mt-3 flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Importing…' : `Import ${rows.length} project(s)`}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 size={16} />
            Imported: {result.created} new project(s) added, {result.updated} updated.{' '}
            <button type="button" onClick={() => router.push('/projects')} className="ml-1 font-semibold underline">
              View projects
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-5 text-xs text-ink-500 shadow-sm">
        <p className="mb-1 font-semibold text-ink-700">Field notes</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">ownerType</span>: Government, PSU, Private, or PPP
          </li>
          <li>
            <span className="font-medium">sector</span>: e.g. Roads &amp; Highways, Bridges, Metro &amp; Rail, Housing &amp; Urban Development,
            Industrial &amp; Economic Corridors, Residential Real Estate, Data Centers, Warehousing &amp; Logistics, Healthcare, etc.
          </li>
          <li>
            <span className="font-medium">status</span>: Tendering, Awarded, Under Construction, Nearing Completion, Completed, or Delayed
          </li>
          <li>Dates should be in YYYY-MM-DD format. Rows matching an existing project id are updated instead of duplicated.</li>
        </ul>
      </div>
    </div>
  );
}
