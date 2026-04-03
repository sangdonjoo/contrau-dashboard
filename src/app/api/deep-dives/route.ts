import { NextResponse } from 'next/server';

interface DeepDiveRow {
  id: string;
  interviewee: string | null;
  issued_by: string | null;
  status: string | null;
  trigger: string | null;
  trigger_ref: string | null;
  domain: string | null;
  channel: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ available: false, data: [] });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/deep_dives?select=id,interviewee,issued_by,status,trigger,trigger_ref,domain,channel,started_at,ended_at,created_at&order=created_at.desc`,
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

    const rows: DeepDiveRow[] = await res.json();

    const statusMap: Record<string, 'pending' | 'in_progress' | 'submitted'> = {
      closed: 'submitted', open: 'pending', in_progress: 'in_progress',
    };

    const data = rows.map((row) => ({
      id: row.id,
      issuedBy: row.issued_by || 'System',
      issuedByLevel: 1,
      interviewee: (row.interviewee || 'Unknown').split(' ')[0],
      intervieweeLevel: 2,
      title: row.trigger || `Interview ${row.id}`,
      description: row.trigger_ref || row.trigger || '',
      status: statusMap[row.status || ''] || 'pending',
      domain: row.domain || 'company',
      createdAt: row.created_at || '',
      filePath: `07_context-override/pull-interview/interviews/${row.id}.md`,
    }));

    return NextResponse.json({ available: true, data });
  } catch (err) {
    return NextResponse.json({ available: false, data: [], error: String(err) });
  }
}
