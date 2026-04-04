import { NextResponse } from 'next/server';

export type STStatus = 'pending' | 'in_progress' | 'completed';

export interface SpecialTaskRow {
  id: string;
  title: string | null;
  what: string | null;
  why: string | null;
  criteria: string | null;
  assigned_by: string | null;
  assignee: string | null;
  status: string | null;
  progress: number | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface SpecialTask {
  id: string;
  title: string;
  what: string;
  why: string;
  criteria: string;
  assignedBy: string;
  assignedByLevel: number;
  assignee: string;
  assigneeLevel: number;
  status: STStatus;
  progress: number;
  createdAt: string;
  completedAt: string | null;
}

const KNOWN_STATUSES = new Set<STStatus>(['pending', 'in_progress', 'completed']);

export const LEVEL_MAP: [string, number][] = [
  ['sangdon', 1],
  ['jihyun', 2], ['yoo jihyun', 2],
  ['nhi', 2], ['ly hoang man nhi', 2],
  ['vicky', 2], ['nguyen thi tuong vi', 2],
  ['charlie', 3], ['nguyen van cu', 3],
  ['youngin', 3], ['seo youngin', 3],
  ['quynh', 3], ['to thi ngoc quynh', 3],
];

export function personLevel(name: string): number {
  const lower = name.toLowerCase();
  let best = 4;
  for (const [key, lvl] of LEVEL_MAP) {
    if (lower.includes(key)) best = Math.min(best, lvl);
  }
  return best;
}

export function toSTStatus(raw: string | null): STStatus {
  if (raw && KNOWN_STATUSES.has(raw as STStatus)) return raw as STStatus;
  return 'pending';
}

export function rowToTask(row: SpecialTaskRow): SpecialTask {
  const assignedBy = row.assigned_by ?? '';
  const assignee = row.assignee ?? '';
  return {
    id: row.id,
    title: row.title ?? '',
    what: row.what ?? '',
    why: row.why ?? '',
    criteria: row.criteria ?? '',
    assignedBy,
    assignedByLevel: personLevel(assignedBy),
    assignee,
    assigneeLevel: personLevel(assignee),
    status: toSTStatus(row.status),
    progress: row.progress ?? 0,
    createdAt: row.created_at?.slice(0, 10) ?? '',
    completedAt: row.completed_at?.slice(0, 10) ?? null,
  };
}

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ available: false, data: [] });
    }

    // Active tasks: created_at ASC; completed tasks: completed_at DESC
    // Fetch all and sort client-side for simplicity
    const res = await fetch(
      `${supabaseUrl}/rest/v1/special_tasks?select=id,title,what,why,criteria,assigned_by,assignee,status,progress,created_at,completed_at`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json({ available: false, data: [] });
    }

    const rows: SpecialTaskRow[] = await res.json();

    const active = rows
      .filter(r => r.status !== 'completed')
      .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''));

    const completed = rows
      .filter(r => r.status === 'completed')
      .sort((a, b) => (b.completed_at ?? b.created_at ?? '').localeCompare(a.completed_at ?? a.created_at ?? ''));

    const data: SpecialTask[] = [...active, ...completed].map(rowToTask);

    return NextResponse.json({ available: true, data });
  } catch (err) {
    return NextResponse.json({ available: false, data: [], error: String(err) });
  }
}
