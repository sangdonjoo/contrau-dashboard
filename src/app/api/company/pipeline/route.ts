import { NextResponse } from 'next/server';

interface PipelineRow {
  stage: string;
  date: string;
  status: string;
  label: string | null;
  reason: string | null;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ available: false });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/pipeline_status?select=stage,date,status,label,reason`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json({ available: false });
    }

    const rows: PipelineRow[] = await res.json();

    const r0Rows = rows
      .filter((r) => r.stage === 'r0')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-5);

    if (r0Rows.length === 0) {
      return NextResponse.json({ available: false });
    }

    const r0Days = r0Rows.map((r) => ({ date: r.date, status: r.status }));

    const r1Days = rows
      .filter((r) => r.stage === 'r1')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-5)
      .map((r) => ({
        date: r.date,
        status: r.status as 'green' | 'yellow' | 'red',
        ...(r.reason ? { reason: r.reason } : {}),
      }));

    const wRow = rows.find((r) => r.stage === 'w' && r.date === 'latest');
    const mRow = rows.find((r) => r.stage === 'm' && r.date === 'latest');
    const qRow = rows.find((r) => r.stage === 'q' && r.date === 'latest');

    const snapshotDays = rows
      .filter((r) => r.stage === 'snapshot')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-5)
      .map((r) => ({ date: r.date, status: r.status }));

    return NextResponse.json({
      available: true,
      r0Days,
      r1Days,
      w: wRow ? { status: wRow.status, label: wRow.label ?? '' } : { status: 'red', label: '' },
      m: mRow ? { status: mRow.status, label: mRow.label ?? '' } : { status: 'red', label: '' },
      q: qRow ? { status: qRow.status, label: qRow.label ?? '' } : { status: 'red', label: '' },
      snapshotDays,
    });
  } catch (err) {
    return NextResponse.json({ available: false, error: String(err) });
  }
}
