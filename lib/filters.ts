import type { Project } from './types';

export interface Filters {
  states: string[];
  sectors: string[];
  ownerTypes: string[];
  statuses: string[];
  contractor: string;
  search: string;
  yearFrom: number | null;
  yearTo: number | null;
  minDurationMonths: number | null;
  maxDurationMonths: number | null;
  minValueCr: number | null;
}

export const EMPTY_FILTERS: Filters = {
  states: [],
  sectors: [],
  ownerTypes: [],
  statuses: [],
  contractor: '',
  search: '',
  yearFrom: null,
  yearTo: null,
  minDurationMonths: null,
  maxDurationMonths: null,
  minValueCr: null,
};

export function applyFilters(projects: Project[], filters: Filters): Project[] {
  return projects.filter((p) => {
    if (filters.states.length && !filters.states.includes(p.state)) return false;
    if (filters.sectors.length && !filters.sectors.includes(p.sector)) return false;
    if (filters.ownerTypes.length && !filters.ownerTypes.includes(p.ownerType)) return false;
    if (filters.statuses.length && !filters.statuses.includes(p.status)) return false;
    if (filters.contractor && p.contractor !== filters.contractor) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${p.name} ${p.contractor} ${p.client} ${p.city} ${p.state}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    const year = new Date(p.startDate).getFullYear();
    if (filters.yearFrom !== null && year < filters.yearFrom) return false;
    if (filters.yearTo !== null && year > filters.yearTo) return false;
    if (filters.minDurationMonths !== null && p.durationMonths < filters.minDurationMonths) return false;
    if (filters.maxDurationMonths !== null && p.durationMonths > filters.maxDurationMonths) return false;
    if (filters.minValueCr !== null && p.projectValueCr < filters.minValueCr) return false;
    return true;
  });
}
