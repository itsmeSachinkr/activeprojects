import type { Project } from './types';
import { startYear } from './utils';

export interface Filters {
  states: string[];
  cities: string[];
  sectors: string[];
  subSectors: string[];
  segmentsC: string[];
  ownerTypes: string[];
  statuses: string[];
  fundingSources: string[];
  pitchStatuses: string[];
  contractor: string;
  search: string;
  yearFrom: number | null;
  yearTo: number | null;
  minDurationMonths: number | null;
  maxDurationMonths: number | null;
  minValueCr: number | null;
  maxValueCr: number | null;
  minCompletionPercent: number | null;
  maxCompletionPercent: number | null;
  hasContactInfo: boolean;
  hasSourceUrl: boolean;
}

export const EMPTY_FILTERS: Filters = {
  states: [],
  cities: [],
  sectors: [],
  subSectors: [],
  segmentsC: [],
  ownerTypes: [],
  statuses: [],
  fundingSources: [],
  pitchStatuses: [],
  contractor: '',
  search: '',
  yearFrom: null,
  yearTo: null,
  minDurationMonths: null,
  maxDurationMonths: null,
  minValueCr: null,
  maxValueCr: null,
  minCompletionPercent: null,
  maxCompletionPercent: null,
  hasContactInfo: false,
  hasSourceUrl: false,
};

export function applyFilters(projects: Project[], filters: Filters): Project[] {
  return projects.filter((p) => {
    if (filters.states.length && !filters.states.includes(p.state)) return false;
    if (filters.cities.length && !filters.cities.includes(p.city)) return false;
    if (filters.sectors.length && !filters.sectors.includes(p.sector)) return false;
    if (filters.subSectors.length && !filters.subSectors.includes(p.subSector)) return false;
    if (filters.segmentsC.length && !filters.segmentsC.includes(p.segmentC)) return false;
    if (filters.ownerTypes.length && !filters.ownerTypes.includes(p.ownerType)) return false;
    if (filters.statuses.length && !filters.statuses.includes(p.status)) return false;
    if (filters.fundingSources.length && !filters.fundingSources.includes(p.fundingSource)) return false;
    if (filters.pitchStatuses.length && !filters.pitchStatuses.includes(p.pitchStatus)) return false;
    if (filters.contractor && p.contractor !== filters.contractor) return false;
    if (filters.hasContactInfo && !(p.contactPerson || p.contactPhone || p.contactEmail)) return false;
    if (filters.hasSourceUrl && !p.sourceUrl) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${p.name} ${p.contractor} ${p.client} ${p.city} ${p.state} ${p.subSector} ${p.segmentC}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    const year = startYear(p);
    if (filters.yearFrom !== null && (year === null || year < filters.yearFrom)) return false;
    if (filters.yearTo !== null && (year === null || year > filters.yearTo)) return false;
    if (filters.minDurationMonths !== null && (p.durationMonths === null || p.durationMonths < filters.minDurationMonths)) return false;
    if (filters.maxDurationMonths !== null && (p.durationMonths === null || p.durationMonths > filters.maxDurationMonths)) return false;
    if (filters.minValueCr !== null && (p.projectValueCr === null || p.projectValueCr < filters.minValueCr)) return false;
    if (filters.maxValueCr !== null && (p.projectValueCr === null || p.projectValueCr > filters.maxValueCr)) return false;
    if (filters.minCompletionPercent !== null && p.completionPercent < filters.minCompletionPercent) return false;
    if (filters.maxCompletionPercent !== null && p.completionPercent > filters.maxCompletionPercent) return false;
    return true;
  });
}
