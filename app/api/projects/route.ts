import { NextRequest, NextResponse } from 'next/server';
import { readProjects, writeProjects, nextProjectId } from '@/lib/data';
import type { Project } from '@/lib/types';

export async function GET() {
  const projects = readProjects();
  return NextResponse.json(projects);
}

// Bulk import: accepts an array of partial project records (e.g. from CSV import).
// Records with a matching id are updated in place; records without one are appended
// as new projects with generated ids.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const incoming: Partial<Project>[] = Array.isArray(body) ? body : body.projects;

  if (!Array.isArray(incoming)) {
    return NextResponse.json({ error: 'Expected an array of projects' }, { status: 400 });
  }

  const existing = readProjects();
  const byId = new Map(existing.map((p) => [p.id, p]));
  let created = 0;
  let updated = 0;

  for (const record of incoming) {
    if (record.id && byId.has(record.id)) {
      const merged = { ...byId.get(record.id)!, ...record, lastUpdated: new Date().toISOString().slice(0, 10) };
      byId.set(record.id, merged as Project);
      updated += 1;
    } else {
      const id = record.id && !byId.has(record.id) ? record.id : nextProjectId(Array.from(byId.values()));
      const project: Project = {
        id,
        name: record.name ?? 'Untitled Project',
        description: record.description ?? '',
        sector: record.sector ?? 'Roads & Highways',
        ownerType: record.ownerType ?? 'Government',
        state: record.state ?? '',
        city: record.city ?? '',
        contractor: record.contractor ?? '',
        client: record.client ?? '',
        projectValueCr: Number(record.projectValueCr) || 0,
        steelRequirementTonnes: record.steelRequirementTonnes != null ? Number(record.steelRequirementTonnes) : null,
        cementRequirementTonnes: record.cementRequirementTonnes != null ? Number(record.cementRequirementTonnes) : null,
        startDate: record.startDate ?? '',
        endDate: record.endDate ?? '',
        durationMonths: Number(record.durationMonths) || 0,
        status: record.status ?? 'Tendering',
        fundingSource: record.fundingSource ?? 'State',
        tenderDate: record.tenderDate ?? null,
        contactPerson: record.contactPerson ?? null,
        contactPhone: record.contactPhone ?? null,
        contactEmail: record.contactEmail ?? null,
        sourceUrl: record.sourceUrl ?? null,
        pitchStatus: record.pitchStatus ?? 'Not Contacted',
        notes: record.notes ?? '',
        lastUpdated: new Date().toISOString().slice(0, 10),
      };
      byId.set(id, project);
      created += 1;
    }
  }

  const merged = Array.from(byId.values());
  writeProjects(merged);
  return NextResponse.json({ created, updated, total: merged.length });
}
