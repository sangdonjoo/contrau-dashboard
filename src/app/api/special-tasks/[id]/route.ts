import { NextResponse } from 'next/server';
import { rowToTask, personLevel, type SpecialTaskRow } from '../route';

export interface TaskStep {
  id: string;
  order: number;
  description: string;
  done: boolean;
}

export interface TaskLog {
  id: string;
  created_at: string;
  author: string;
  content: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    };

    // Fetch task + steps + logs in parallel
    const [taskRes, stepsRes, logsRes] = await Promise.all([
      fetch(
        `${supabaseUrl}/rest/v1/special_tasks?id=eq.${encodeURIComponent(id)}&select=*`,
        { headers, cache: 'no-store' }
      ),
      fetch(
        `${supabaseUrl}/rest/v1/task_steps?task_id=eq.${encodeURIComponent(id)}&select=id,order:step_order,description,done&order=step_order.asc`,
        { headers, cache: 'no-store' }
      ),
      fetch(
        `${supabaseUrl}/rest/v1/task_logs?task_id=eq.${encodeURIComponent(id)}&select=id,created_at,author,content&order=created_at.desc`,
        { headers, cache: 'no-store' }
      ),
    ]);

    if (!taskRes.ok) {
      return NextResponse.json({ error: 'Supabase error' }, { status: 500 });
    }

    const rows: SpecialTaskRow[] = await taskRes.json();
    if (rows.length === 0) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const steps: TaskStep[] = stepsRes.ok ? await stepsRes.json() : [];
    const logs: TaskLog[] = logsRes.ok ? await logsRes.json() : [];

    const task = rowToTask(rows[0]);
    const doneCount = steps.filter(s => s.done).length;

    return NextResponse.json({
      ...task,
      steps,
      logs: logs.map(l => ({
        ...l,
        authorLevel: personLevel(l.author),
        createdAt: l.created_at?.slice(0, 16).replace('T', ' ') ?? '',
      })),
      stepsDone: doneCount,
      stepsTotal: steps.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
