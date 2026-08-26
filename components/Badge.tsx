const STATUS_COLORS: Record<string, string> = {
  Tendering: 'bg-amber-100 text-amber-800',
  Awarded: 'bg-sky-100 text-sky-800',
  'Under Construction': 'bg-blue-100 text-blue-800',
  'Nearing Completion': 'bg-teal-100 text-teal-800',
  Completed: 'bg-green-100 text-green-800',
  Delayed: 'bg-red-100 text-red-800',
};

const OWNER_COLORS: Record<string, string> = {
  Government: 'bg-indigo-100 text-indigo-800',
  PSU: 'bg-purple-100 text-purple-800',
  Private: 'bg-orange-100 text-orange-800',
  PPP: 'bg-cyan-100 text-cyan-800',
};

const PITCH_COLORS: Record<string, string> = {
  'Not Contacted': 'bg-ink-100 text-ink-600',
  Contacted: 'bg-amber-100 text-amber-800',
  'In Discussion': 'bg-sky-100 text-sky-800',
  Quoted: 'bg-blue-100 text-blue-800',
  'Order Won': 'bg-green-100 text-green-800',
  'Not Interested': 'bg-red-100 text-red-800',
};

function Pill({ text, className }: { text: string; className: string }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Pill text={status} className={STATUS_COLORS[status] ?? 'bg-ink-100 text-ink-700'} />;
}

export function OwnerBadge({ ownerType }: { ownerType: string }) {
  return <Pill text={ownerType} className={OWNER_COLORS[ownerType] ?? 'bg-ink-100 text-ink-700'} />;
}

export function PitchBadge({ pitchStatus }: { pitchStatus: string }) {
  return <Pill text={pitchStatus} className={PITCH_COLORS[pitchStatus] ?? 'bg-ink-100 text-ink-700'} />;
}
