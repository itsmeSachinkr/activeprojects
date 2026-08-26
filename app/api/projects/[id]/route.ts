import { NextRequest, NextResponse } from 'next/server';
import { readProjects, writeProjects } from '@/lib/data';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const projects = readProjects();
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const updates = await req.json();
  const projects = readProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  projects[index] = {
    ...projects[index],
    ...updates,
    id: projects[index].id,
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
  writeProjects(projects);
  return NextResponse.json(projects[index]);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const projects = readProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  writeProjects(filtered);
  return NextResponse.json({ success: true });
}
