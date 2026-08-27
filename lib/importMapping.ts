import { SECTORS, STATUSES, OWNER_TYPES, FUNDING_SOURCES } from './types';

export interface SchemaFieldDef {
  key: string;
  label: string;
  required: boolean;
  synonyms: string[];
}

export const SCHEMA_FIELDS: SchemaFieldDef[] = [
  { key: 'name', label: 'Project Name', required: true, synonyms: ['project name', 'name', 'title', 'project'] },
  { key: 'description', label: 'Description', required: false, synonyms: ['description', 'scope', 'details', 'remarks'] },
  { key: 'sector', label: 'Sector', required: false, synonyms: ['sector', 'industry', 'category', 'segment'] },
  { key: 'ownerType', label: 'Owner Type', required: false, synonyms: ['owner type', 'ownership', 'client type', 'sector type'] },
  { key: 'state', label: 'State', required: true, synonyms: ['state'] },
  { key: 'city', label: 'City / District', required: false, synonyms: ['city', 'district', 'location', 'place', 'town'] },
  { key: 'contractor', label: 'Contractor / Bidder / L1', required: true, synonyms: ['contractor', 'bidder', 'l1', 'l-1', 'awardee', 'epc', 'vendor', 'agency'] },
  { key: 'client', label: 'Client / Authority', required: false, synonyms: ['client', 'authority', 'owner', 'employer', 'department'] },
  { key: 'projectValueCr', label: 'Project Value (₹ Cr)', required: false, synonyms: ['value', 'cost', 'amount', 'project cost', 'contract value', 'crore', 'tender value'] },
  { key: 'status', label: 'Status', required: false, synonyms: ['status', 'stage', 'project status'] },
  { key: 'fundingSource', label: 'Funding Source', required: false, synonyms: ['funding', 'finance', 'funding source'] },
  { key: 'startDate', label: 'Start Date', required: false, synonyms: ['start date', 'commencement', 'commencement date'] },
  { key: 'endDate', label: 'End Date', required: false, synonyms: ['end date', 'completion date', 'scheduled completion', 'completion'] },
  { key: 'durationMonths', label: 'Duration (months)', required: false, synonyms: ['duration', 'tenure', 'period', 'months'] },
  { key: 'tenderDate', label: 'Tender / LOA / Award Date', required: false, synonyms: ['tender date', 'loa date', 'award date', 'noa date', 'l1 date'] },
  { key: 'sourceUrl', label: 'Source URL', required: false, synonyms: ['source', 'link', 'url', 'reference', 'reference link'] },
  { key: 'contactPerson', label: 'Contact Person', required: false, synonyms: ['contact person', 'contact name', 'contact'] },
  { key: 'contactPhone', label: 'Contact Phone', required: false, synonyms: ['phone', 'mobile', 'contact no', 'contact number'] },
  { key: 'contactEmail', label: 'Contact Email', required: false, synonyms: ['email', 'e-mail'] },
];

export function guessMapping(headers: string[]): Record<string, string | null> {
  const mapping: Record<string, string | null> = {};
  const normalizedHeaders = headers.map((h) => ({ raw: h, norm: h.toLowerCase().trim() }));
  const used = new Set<string>();

  for (const field of SCHEMA_FIELDS) {
    let match: string | null = null;
    // Prefer an exact normalized match first.
    const exact = normalizedHeaders.find((h) => !used.has(h.raw) && h.norm === field.key.toLowerCase());
    if (exact) match = exact.raw;
    if (!match) {
      for (const syn of field.synonyms) {
        const found = normalizedHeaders.find((h) => !used.has(h.raw) && h.norm.includes(syn));
        if (found) { match = found.raw; break; }
      }
    }
    mapping[field.key] = match;
    if (match) used.add(match);
  }
  return mapping;
}

function normalizeEnum(value: string, allowed: readonly string[]): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const exact = allowed.find((a) => a.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  const lower = trimmed.toLowerCase();
  const aliasMap: Record<string, string> = {
    govt: 'Government', government: 'Government', 'central govt': 'Government', 'state govt': 'Government',
    psu: 'PSU', 'public sector': 'PSU',
    private: 'Private', pvt: 'Private',
    ppp: 'PPP', 'public private partnership': 'PPP',
    tendering: 'Tendering', 'tender stage': 'Tendering', 'under tender': 'Tendering',
    awarded: 'Awarded', 'l1 declared': 'Awarded', 'loa issued': 'Awarded',
    'under construction': 'Under Construction', 'in progress': 'Under Construction', ongoing: 'Under Construction', wip: 'Under Construction',
    'nearing completion': 'Nearing Completion', 'near completion': 'Nearing Completion',
    completed: 'Completed', complete: 'Completed', commissioned: 'Completed',
    delayed: 'Delayed', stalled: 'Delayed',
    central: 'Central', state: 'State', multilateral: 'Multilateral',
  };
  if (aliasMap[lower] && (allowed as string[]).includes(aliasMap[lower])) return aliasMap[lower];
  return trimmed; // Unmapped — kept as-is; the UI shows it with a neutral color rather than crashing.
}

export interface MappedRow {
  data: Record<string, unknown>;
  warnings: string[];
}

export function applyMapping(
  rawRows: Record<string, unknown>[],
  mapping: Record<string, string | null>
): MappedRow[] {
  return rawRows.map((raw) => {
    const warnings: string[] = [];
    const get = (key: string): string => {
      const col = mapping[key];
      if (!col) return '';
      const v = raw[col];
      return v === null || v === undefined ? '' : String(v).trim();
    };

    const sector = get('sector');
    const ownerType = get('ownerType');
    const status = get('status');
    const fundingSource = get('fundingSource');

    const normSector = sector ? normalizeEnum(sector, SECTORS) : '';
    const normOwner = ownerType ? normalizeEnum(ownerType, OWNER_TYPES) : '';
    const normStatus = status ? normalizeEnum(status, STATUSES) : '';
    const normFunding = fundingSource ? normalizeEnum(fundingSource, FUNDING_SOURCES) : '';

    if (sector && !(SECTORS as readonly string[]).includes(normSector)) warnings.push(`Unrecognized sector "${sector}"`);
    if (status && !(STATUSES as readonly string[]).includes(normStatus)) warnings.push(`Unrecognized status "${status}"`);

    const valueStr = get('projectValueCr').replace(/[^0-9.]/g, '');
    const durationStr = get('durationMonths').replace(/[^0-9.]/g, '');

    return {
      data: {
        name: get('name'),
        description: get('description'),
        sector: normSector || undefined,
        ownerType: normOwner || undefined,
        state: get('state'),
        city: get('city'),
        contractor: get('contractor'),
        client: get('client'),
        projectValueCr: valueStr ? Number(valueStr) : null,
        startDate: get('startDate') || null,
        endDate: get('endDate') || null,
        durationMonths: durationStr ? Number(durationStr) : null,
        status: normStatus || undefined,
        fundingSource: normFunding || undefined,
        tenderDate: get('tenderDate') || null,
        contactPerson: get('contactPerson') || null,
        contactPhone: get('contactPhone') || null,
        contactEmail: get('contactEmail') || null,
        sourceUrl: get('sourceUrl') || null,
      },
      warnings,
    };
  });
}
