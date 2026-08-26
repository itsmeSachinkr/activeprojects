import fs from 'fs';
import path from 'path';
import type { Project } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'projects.json');

export function readProjects(): Project[] {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw) as Project[];
}

export function writeProjects(projects: Project[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2) + '\n', 'utf8');
}

export function getProjectById(id: string): Project | undefined {
  return readProjects().find((p) => p.id === id);
}

export function nextProjectId(existing: Project[]): string {
  let max = 0;
  for (const p of existing) {
    const match = /^p(\d+)$/.exec(p.id);
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  }
  return `p${String(max + 1).padStart(3, '0')}`;
}

export function computeDurationMonths(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(months, 0);
}
