'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import type { Project } from '@/lib/types';
import { startYear } from '@/lib/utils';

const SEQUENTIAL_BLUE = '#2a78d6';
const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
const INK_MUTED = '#898781';
const GRIDLINE = '#e1e0d9';

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-ink-800">{title}</p>
      {children}
    </div>
  );
}

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid #e1e0d9',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

export function StateBarChart({ projects }: { projects: Project[] }) {
  const counts = new Map<string, number>();
  for (const p of projects) counts.set(p.state, (counts.get(p.state) ?? 0) + 1);
  const data = Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <ChartCard title="Top States by Project Count">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} stroke={GRIDLINE} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
          <YAxis type="category" dataKey="state" width={100} tick={{ fontSize: 11, fill: '#52514e' }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="count" name="Projects" fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SectorBarChart({ projects }: { projects: Project[] }) {
  const counts = new Map<string, number>();
  for (const p of projects) counts.set(p.sector, (counts.get(p.sector) ?? 0) + 1);
  const data = Array.from(counts.entries())
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <ChartCard title="Projects by Sector">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} stroke={GRIDLINE} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
          <YAxis type="category" dataKey="sector" width={150} tick={{ fontSize: 10.5, fill: '#52514e' }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="count" name="Projects" fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function OwnerPieChart({ projects }: { projects: Project[] }) {
  const counts = new Map<string, number>();
  for (const p of projects) counts.set(p.ownerType, (counts.get(p.ownerType) ?? 0) + 1);
  const data = Array.from(counts.entries()).map(([name, value]) => ({ name, value }));

  return (
    <ChartCard title="Projects by Owner Type">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="48%"
            outerRadius={90}
            innerRadius={50}
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={CATEGORICAL[i % CATEGORICAL.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopContractorsChart({ projects }: { projects: Project[] }) {
  const values = new Map<string, number>();
  for (const p of projects) {
    if (!p.contractor) continue;
    values.set(p.contractor, (values.get(p.contractor) ?? 0) + (p.projectValueCr ?? 0));
  }
  const data = Array.from(values.entries())
    .map(([contractor, value]) => ({ contractor, value }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <ChartCard title="Top Contractors by Project Value (₹ Cr)">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} stroke={GRIDLINE} />
          <XAxis type="number" tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
          <YAxis type="category" dataKey="contractor" width={150} tick={{ fontSize: 10.5, fill: '#52514e' }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(v: number) => `₹${v.toLocaleString('en-IN')} Cr`} />
          <Bar dataKey="value" name="Value (₹ Cr)" fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TimelineChart({ projects }: { projects: Project[] }) {
  const counts = new Map<number, number>();
  let unknown = 0;
  for (const p of projects) {
    const year = startYear(p);
    if (year === null) { unknown += 1; continue; }
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  const data = Array.from(counts.entries())
    .map(([year, count]) => ({ year: String(year), count }))
    .sort((a, b) => a.year.localeCompare(b.year));
  if (unknown > 0) data.push({ year: 'Unknown', count: unknown });

  return (
    <ChartCard title="Projects Starting by Year">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ left: 0, right: 16 }}>
          <CartesianGrid vertical={false} stroke={GRIDLINE} />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="count" name="Projects" fill={SEQUENTIAL_BLUE} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
