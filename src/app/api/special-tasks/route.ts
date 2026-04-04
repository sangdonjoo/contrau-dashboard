import { NextResponse } from 'next/server';

export type STStatus = 'pending' | 'in_progress' | 'completed';

export interface SpecialTaskRow {
  id: string;
  title: string | null;
  description: string | null;  // "what"
  reason: string | null;       // "why"
  criteria: string | null;
  measurement: string | null;
  domain: string | null;
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
  description: string;
  reason: string;
  criteria: string;
  measurement: string;
  domain: string;
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
    description: row.description ?? '',
    reason: row.reason ?? '',
    criteria: row.criteria ?? '',
    measurement: row.measurement ?? '',
    domain: row.domain ?? '',
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
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ available: false, data: [] });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/special_tasks?select=id,title,description,reason,criteria,measurement,domain,assigned_by,assignee,status,progress,created_at,completed_at`,
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

interface CreateSTBody {
  title: string;
  description: string;
  reason: string;
  criteria: string;
  measurement: string;
  assigned_to: string;
  assigned_by: string;
  domain: string;
  steps: string[];
}

async function generateID(supabaseUrl: string, supabaseKey: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const prefix = `ST-${today}`;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/special_tasks?id=like.${encodeURIComponent(prefix + '%')}&select=id`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: 'no-store',
    }
  );

  const existing: { id: string }[] = res.ok ? await res.json() : [];
  const next = (existing.length + 1).toString().padStart(3, '0');
  return `${prefix}-${next}`;
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    const body: CreateSTBody = await req.json();

    if (!body.title || !body.assigned_to || !body.assigned_by) {
      return NextResponse.json({ error: 'title, assigned_to, assigned_by are required' }, { status: 400 });
    }

    const id = await generateID(supabaseUrl, supabaseKey);
    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    };

    // INSERT task
    const taskRes = await fetch(`${supabaseUrl}/rest/v1/special_tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id,
        title: body.title,
        description: body.description ?? '',
        reason: body.reason ?? '',
        criteria: body.criteria ?? '',
        measurement: body.measurement ?? '',
        domain: body.domain ?? '',
        assigned_by: body.assigned_by,
        assignee: body.assigned_to,
        status: 'pending',
        progress: 0,
      }),
    });

    if (!taskRes.ok) {
      const errText = await taskRes.text();
      return NextResponse.json({ error: `task insert failed: ${errText}` }, { status: 500 });
    }

    // INSERT steps (batch)
    if (body.steps && body.steps.length > 0) {
      const stepRows = body.steps.map((desc, i) => ({
        task_id: id,
        step_order: i + 1,
        description: desc,
        done: false,
      }));

      const stepsRes = await fetch(`${supabaseUrl}/rest/v1/task_steps`, {
        method: 'POST',
        headers,
        body: JSON.stringify(stepRows),
      });

      if (!stepsRes.ok) {
        // Task was created; log step failure but don't roll back
        console.error(`task ${id} created but steps insert failed: ${await stepsRes.text()}`);
      }
    }

    return NextResponse.json({ id, status: 'active' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
