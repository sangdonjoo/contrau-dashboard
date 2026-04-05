import { NextResponse } from 'next/server';
import { rowToTask, personLevel, type SpecialTaskRow } from '../route';

export interface TaskStep {
  id: string;
  order: number;
  description: string;
  done: boolean;
  /** Derived on the server: 'completed' | 'in_progress' | 'prepared' */
  stepStatus: 'completed' | 'in_progress' | 'prepared';
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

    // Fetch task + steps in parallel (logs removed — progress tracked in MD)
    const [taskRes, stepsRes] = await Promise.all([
      fetch(
        `${supabaseUrl}/rest/v1/special_tasks?id=eq.${encodeURIComponent(id)}&select=*`,
        { headers, cache: 'no-store' }
      ),
      fetch(
        `${supabaseUrl}/rest/v1/task_steps?task_id=eq.${encodeURIComponent(id)}&select=id,order:step_order,description,done&order=step_order.asc`,
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

    const rawSteps: { id: string; order: number; description: string; done: boolean }[] =
      stepsRes.ok ? await stepsRes.json() : [];

    const task = rowToTask(rows[0]);
    const doneCount = rawSteps.filter(s => s.done).length;

    // Derive current step index: first step where done=false
    const currentStepIndex = rawSteps.findIndex(s => !s.done);

    // Annotate each step with derived stepStatus
    const steps: TaskStep[] = rawSteps.map((s, idx) => ({
      ...s,
      stepStatus: s.done
        ? 'completed'
        : idx === currentStepIndex
        ? 'in_progress'
        : 'prepared',
    }));

    return NextResponse.json({
      ...task,
      steps,
      stepsDone: doneCount,
      stepsTotal: steps.length,
      currentStepIndex,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
