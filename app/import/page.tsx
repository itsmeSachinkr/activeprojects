'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { useRouter } from 'next/navigation';
import { Upload, Download, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { SCHEMA_FIELDS, guessMapping, applyMapping } from '@/lib/importMapping';

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

type Step = 'upload' | 'map' | 'done';

async function parseCsv(file: File): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => resolve({ headers: res.meta.fields ?? [], rows: res.data }),
      error: reject,
    });
  });
}

async function parseExcel(file: File): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return { headers: [], rows: [] };

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? '').trim();
  });

  const rows: Record<string, unknown>[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, unknown> = {};
    let hasValue = false;
    headers.forEach((h, i) => {
      if (!h) return;
      const cell = row.getCell(i + 1);
      let value: unknown = cell.value;
      if (value && typeof value === 'object' && 'text' in (value as object)) value = (value as { text: unknown }).text;
      if (value instanceof Date) value = value.toISOString().slice(0, 10);
      record[h] = value ?? '';
      if (value !== '' && value !== null && value !== undefined) hasValue = true;
    });
    if (hasValue) rows.push(record);
  });

  return { headers: headers.filter(Boolean), rows };
}

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
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

  async function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    setLoadError(null);
    try {
      const isExcel = /\.xlsx?$/i.test(file.name);
      const { headers: h, rows } = isExcel ? await parseExcel(file) : await parseCsv(file);
      if (!h.length || !rows.length) {
        setLoadError('No rows found — check the file has a header row and at least one data row.');
        return;
      }
      setHeaders(h);
      setRawRows(rows);
      setMapping(guessMapping(h));
      setStep('map');
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not read this file.');
    }
  }

  const mappedPreview = applyMapping(rawRows.slice(0, 8), mapping);
  const requiredMissing = SCHEMA_FIELDS.filter((f) => f.required && !mapping[f.key]);
  const allWarnings = Array.from(
    new Set(applyMapping(rawRows, mapping).flatMap((r) => r.warnings))
  );

  async function submitImport() {
    setSubmitting(true);
    const mappedAll = applyMapping(rawRows, mapping);
    const payload = mappedAll.map((r) => r.data).filter((d) => d.name && d.state && d.contractor);

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
    setSubmitting(false);
    setStep('done');
  }

  function reset() {
    setStep('upload');
    setFileName('');
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setLoadError(null);
    setResult(null);
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Import Real Project Data</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Import a CSV or Excel export from any source — ProjectsToday, GeM, state PWD/CPWD tender portals, RERA filings, or your own market
          research. Upload it and map its columns to InfraPulse&apos;s fields; you don&apos;t need to match our exact headers.
        </p>
      </div>

      {step === 'upload' && (
        <>
          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-300 bg-ink-50 px-6 py-10 text-center hover:border-brand-400">
              <Upload size={22} className="text-ink-400" />
              <span className="text-sm text-ink-600">{fileName || 'Click to choose a .csv, .xlsx or .xls file, or drag it here'}</span>
              <span className="text-xs text-ink-400">Works with any column layout — you&apos;ll map columns on the next step</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
            {loadError && (
              <div className="mt-3 flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs text-red-700">
                <AlertTriangle size={13} /> {loadError}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-800">Prefer a ready-made template instead?</p>
                <p className="text-xs text-ink-500">Download a CSV with InfraPulse&apos;s exact column names, fill it in, then upload it above.</p>
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
        </>
      )}

      {step === 'map' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-800">Map your columns — {rawRows.length} row(s) found in {fileName}</p>
              <button type="button" onClick={reset} className="flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-800">
                <ArrowLeft size={12} /> Choose a different file
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SCHEMA_FIELDS.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-1 flex items-center gap-1 text-xs font-medium text-ink-600">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </span>
                  <select
                    value={mapping[field.key] ?? ''}
                    onChange={(e) => setMapping((m) => ({ ...m, [field.key]: e.target.value || null }))}
                    className="w-full rounded-md border border-ink-200 px-2.5 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                  >
                    <option value="">— Not in file —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          {requiredMissing.length > 0 && (
            <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
              <p className="flex items-center gap-1 font-medium">
                <AlertTriangle size={13} /> Map these required fields before importing: {requiredMissing.map((f) => f.label).join(', ')}
              </p>
            </div>
          )}

          {allWarnings.length > 0 && (
            <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
              <p className="mb-1 flex items-center gap-1 font-medium">
                <AlertTriangle size={13} /> {allWarnings.length} value(s) didn&apos;t match InfraPulse&apos;s categories — they&apos;ll import as
                free text and still display, just without the standard color-coded badge.
              </p>
              <ul className="list-disc space-y-0.5 pl-4">
                {allWarnings.slice(0, 8).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
            <p className="mb-2 text-xs font-medium text-ink-600">Preview — first {mappedPreview.length} of {rawRows.length} row(s)</p>
            <div className="max-h-72 overflow-auto rounded-md border border-ink-200">
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
                  {mappedPreview.map((r, i) => (
                    <tr key={i}>
                      <td className="max-w-[16rem] truncate px-3 py-1.5">{String(r.data.name ?? '')}</td>
                      <td className="px-3 py-1.5">{String(r.data.state ?? '')}</td>
                      <td className="max-w-[12rem] truncate px-3 py-1.5">{String(r.data.contractor ?? '')}</td>
                      <td className="px-3 py-1.5">{r.data.projectValueCr != null ? String(r.data.projectValueCr) : '—'}</td>
                      <td className="px-3 py-1.5">{String(r.data.status ?? '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={submitImport}
              disabled={submitting || requiredMissing.length > 0}
              className="mt-3 flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Importing…' : (
                <>
                  Import {rawRows.length} project(s) <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 size={16} />
            Imported: {result.created} new project(s) added, {result.updated} updated.
          </div>
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={() => router.push('/projects')} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              View projects
            </button>
            <button type="button" onClick={reset} className="rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
              Import another file
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-ink-200 bg-white p-5 text-xs text-ink-500 shadow-sm">
        <p className="mb-1 font-semibold text-ink-700">Field notes</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">Contractor / Bidder / L1</span> maps to whichever column names the winning contractor — e.g. a
            ProjectsToday export&apos;s &quot;L1&quot; or &quot;Awardee&quot; column.
          </li>
          <li>
            <span className="font-medium">ownerType</span>: Government, PSU, Private, or PPP — other wording (e.g. &quot;Govt&quot;, &quot;Pvt&quot;) is recognized automatically.
          </li>
          <li>
            <span className="font-medium">status</span>: Tendering, Awarded, Under Construction, Nearing Completion, Completed, or Delayed — common
            variants (&quot;L1 Declared&quot;, &quot;In Progress&quot;, &quot;WIP&quot;) map automatically.
          </li>
          <li>Dates should be in YYYY-MM-DD format where possible. Rows matching an existing project id are updated instead of duplicated.</li>
          <li>Values that don&apos;t match a known category still import as plain text — nothing is dropped or blocked.</li>
        </ul>
      </div>
    </div>
  );
}
