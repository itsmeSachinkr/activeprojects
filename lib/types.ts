export type ProjectStatus =
  | 'Tendering'
  | 'Awarded'
  | 'Under Construction'
  | 'Nearing Completion'
  | 'Completed'
  | 'Delayed';

export type FundingSource = 'Central' | 'State' | 'PPP' | 'Private' | 'Multilateral';

export type OwnerType = 'Government' | 'PSU' | 'Private' | 'PPP';

export type Sector =
  | 'Roads & Highways'
  | 'Bridges'
  | 'Metro & Rail'
  | 'Housing & Urban Development'
  | 'Industrial & Economic Corridors'
  | 'Power & Energy'
  | 'Water & Irrigation'
  | 'Ports & Airports'
  | 'Smart City'
  | 'Commercial & Institutional Buildings'
  | 'Residential Real Estate'
  | 'Data Centers'
  | 'Warehousing & Logistics'
  | 'Healthcare';

export type PitchStatus =
  | 'Not Contacted'
  | 'Contacted'
  | 'In Discussion'
  | 'Quoted'
  | 'Order Won'
  | 'Not Interested';

export type CompletionBasis = 'calculated' | 'status' | 'disclosed';

export interface Project {
  id: string;
  name: string;
  description: string;
  sector: Sector;
  subSector: string;
  ownerType: OwnerType;
  state: string;
  city: string;
  contractor: string | null;
  client: string;
  projectValueCr: number | null;
  steelRequirementTonnes: number | null;
  cementRequirementTonnes: number | null;
  startDate: string | null;
  endDate: string | null;
  durationMonths: number | null;
  status: ProjectStatus;
  completionPercent: number;
  completionBasis: CompletionBasis;
  fundingSource: FundingSource;
  tenderDate: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  sourceUrl: string | null;
  pitchStatus: PitchStatus;
  notes: string;
  lastUpdated: string;
}

export const SECTORS: Sector[] = [
  'Roads & Highways',
  'Bridges',
  'Metro & Rail',
  'Housing & Urban Development',
  'Industrial & Economic Corridors',
  'Power & Energy',
  'Water & Irrigation',
  'Ports & Airports',
  'Smart City',
  'Commercial & Institutional Buildings',
  'Residential Real Estate',
  'Data Centers',
  'Warehousing & Logistics',
  'Healthcare',
];

export const OWNER_TYPES: OwnerType[] = ['Government', 'PSU', 'Private', 'PPP'];

export const STATUSES: ProjectStatus[] = [
  'Tendering',
  'Awarded',
  'Under Construction',
  'Nearing Completion',
  'Completed',
  'Delayed',
];

export const FUNDING_SOURCES: FundingSource[] = [
  'Central',
  'State',
  'PPP',
  'Private',
  'Multilateral',
];

export const PITCH_STATUSES: PitchStatus[] = [
  'Not Contacted',
  'Contacted',
  'In Discussion',
  'Quoted',
  'Order Won',
  'Not Interested',
];
