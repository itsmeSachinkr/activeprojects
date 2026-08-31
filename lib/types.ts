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

// Sub-sectors are free-text (auto-classified from project descriptions), not a closed
// enum — this is the reference list of values currently used per sector, for filter UIs.
export const SUB_SECTORS_BY_SECTOR: Record<Sector, string[]> = {
  'Roads & Highways': ['Expressway', 'National Highway', 'Ring Road / Bypass', 'State Highway', 'Rural Road', 'General Road Corridor'],
  'Bridges': ['Sea Link / Coastal Bridge', 'River Bridge', 'Tunnel', 'Flyover / ROB', 'General Bridge Structure'],
  'Metro & Rail': ['High-Speed Rail (Bullet Train)', 'Freight Corridor / Rail Line', 'Railway Station Redevelopment', 'Suburban Rail', 'Metro Rail', 'General Rail Infrastructure'],
  'Housing & Urban Development': ['Government/Institutional Campus', 'Slum Redevelopment', 'Urban Infrastructure'],
  'Industrial & Economic Corridors': ['Steel', 'Cement', 'Chemicals & Petrochemicals', 'Pharma & Life Sciences', 'Auto & EV', 'Semiconductor & Electronics', 'Textiles & Apparel', 'Food Processing & FMCG', 'Industrial Park / Multi-Sector'],
  'Power & Energy': ['Refining & Petrochemicals', 'Green Hydrogen', 'Renewable Energy (Solar/Wind)', 'Hydro Power', 'Transmission & Grid', 'Thermal Power', 'General Power Infrastructure'],
  'Water & Irrigation': ['Dam', 'Sewage & Sanitation', 'Urban Water Supply (AMRUT)', 'Lift Irrigation', 'Irrigation Canal / Network', 'General Water Infrastructure'],
  'Ports & Airports': ['Airport Terminal', 'Port Connectivity', 'Port Terminal', 'General Port/Airport Infrastructure'],
  'Smart City': ['Urban Mobility', 'ICT Infrastructure', 'Public Realm & Utilities'],
  'Commercial & Institutional Buildings': ['Educational Institute', 'Sports & Public Infrastructure', 'Office / IT Park', 'Government Building', 'General Commercial/Institutional Building'],
  'Residential Real Estate': ['Affordable Housing', 'Premium / Luxury Housing', 'Integrated Township', 'Mid-Segment Housing'],
  'Data Centers': ['Hyperscale Data Center', 'Enterprise Data Center'],
  'Warehousing & Logistics': ['Multi-Modal Logistics Park (MMLP)', 'Cold Chain / Logistics Hub', 'Warehousing Park'],
  'Healthcare': ['Medical College', 'Government Hospital', 'Private Hospital'],
};
