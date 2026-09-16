'use client';

import { useEffect, useState } from 'react';
import type { Project } from './types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
    }
  }

  async function updateProject(id: string, patch: Partial<Project>): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to save changes');
    const updated: Project = await res.json();
    setProjects((prev) => (prev ? prev.map((p) => (p.id === id ? updated : p)) : prev));
    return updated;
  }

  useEffect(() => {
    refresh();
  }, []);

  return { projects, error, refresh, updateProject };
}
