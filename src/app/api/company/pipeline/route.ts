import { NextResponse } from 'next/server';

interface PipelineRow {
  stage: string;
  date: string;
  status: string;
  label: string | null;
  reason: string | null;
}

function getVNDateRange(days: number): string[] {
  const now = new Date();
  // VN = UTC+7, yesterday in VN time
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  vnNow.setUTCDate(vnNow.getUTCDate() - 1); // yesterday
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(vnNow);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
  }
  return dates;
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

    if (rows.length === 0) {
      return NextResponse.json({ available: false });
    }

    const dateRange = getVNDateRange(5);

    const r0RowMap = new Map(rows.filter(r => r.stage === 'r0').map(r => [r.date, r]));
    const r0Days = dateRange.map(date => {
      const r = r0RowMap.get(date);
      return { date, status: r ? r.status : 'red' };
    });

    const r1RowMap = new Map(rows.filter(r => r.stage === 'r1').map(r => [r.date, r]));
    const r1Days = dateRange.map(date => {
      const r = r1RowMap.get(date);
      return {
        date,
        status: (r ? r.status : 'red') as 'green' | 'yellow' | 'red',
        ...(r?.reason ? { reason: r.reason } : {}),
      };
    });

    const wRow = rows.find((r) => r.stage === 'w' && r.date === 'latest');
    const mRow = rows.find((r) => r.stage === 'm' && r.date === 'latest');
    const qRow = rows.find((r) => r.stage === 'q' && r.date === 'latest');

    const snapshotRowMap = new Map(rows.filter(r => r.stage === 'snapshot').map(r => [r.date, r]));
    const snapshotDays = dateRange.map(date => {
      const r = snapshotRowMap.get(date);
      return { date, status: r ? r.status : 'red' };
    });

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
