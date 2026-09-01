import type { Project } from './types';

export function formatCr(value: number | null): string {
  if (value === null || value === undefined) return 'Not disclosed';
  return `₹${value.toLocaleString('en-IN')} Cr`;
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTonnes(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return `${value.toLocaleString('en-IN')} MT`;
}

export function startYear(project: Project): number | null {
  if (!project.startDate) return null;
  const y = new Date(project.startDate).getFullYear();
  return isNaN(y) ? null : y;
}

export function formatDuration(months: number | null): string {
  return months === null || months === undefined ? '—' : `${months} mo`;
}

export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export function totalValueCr(projects: Project[]): number {
  return projects.reduce((sum, p) => sum + (p.projectValueCr ?? 0), 0);
}

export function countWithDisclosedValue(projects: Project[]): number {
  return projects.filter((p) => p.projectValueCr !== null).length;
}

export function totalSteelTonnes(projects: Project[]): number {
  return projects.reduce((sum, p) => sum + (p.steelRequirementTonnes ?? 0), 0);
}

export function totalCementTonnes(projects: Project[]): number {
  return projects.reduce((sum, p) => sum + (p.cementRequirementTonnes ?? 0), 0);
}

export interface ContractorSummary {
  name: string;
  projectCount: number;
  totalValueCr: number;
  totalSteelTonnes: number;
  totalCementTonnes: number;
  states: string[];
  sectors: string[];
  activeProjects: number;
}

export function summarizeContractors(projects: Project[]): ContractorSummary[] {
  const map = new Map<string, ContractorSummary>();
  for (const p of projects) {
    if (!p.contractor) continue;
    const key = p.contractor;
    if (!map.has(key)) {
      map.set(key, {
        name: key,
        projectCount: 0,
        totalValueCr: 0,
        totalSteelTonnes: 0,
        totalCementTonnes: 0,
        states: [],
        sectors: [],
        activeProjects: 0,
      });
    }
    const entry = map.get(key)!;
    entry.projectCount += 1;
    entry.totalValueCr += p.projectValueCr ?? 0;
    entry.totalSteelTonnes += p.steelRequirementTonnes ?? 0;
    entry.totalCementTonnes += p.cementRequirementTonnes ?? 0;
    if (!entry.states.includes(p.state)) entry.states.push(p.state);
    if (!entry.sectors.includes(p.sector)) entry.sectors.push(p.sector);
    if (p.status === 'Under Construction' || p.status === 'Awarded' || p.status === 'Nearing Completion') {
      entry.activeProjects += 1;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalValueCr - a.totalValueCr);
}

export function projectsToCsv(projects: Project[]): string {
  const headers = [
    'id', 'name', 'sector', 'subSector', 'segmentC', 'ownerType', 'state', 'city', 'contractor', 'client',
    'projectValueCr', 'steelRequirementTonnes', 'cementRequirementTonnes',
    'startDate', 'endDate', 'durationMonths', 'status', 'completionPercent', 'completionBasis', 'fundingSource',
    'tenderDate', 'contactPerson', 'contactPhone', 'contactEmail', 'pitchStatus', 'notes',
  ];
  const escape = (val: unknown) => {
    const s = val === null || val === undefined ? '' : String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const rows = projects.map((p) => headers.map((h) => escape((p as unknown as Record<string, unknown>)[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}
