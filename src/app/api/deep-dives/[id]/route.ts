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
  ai_summary: string | null;
  meta_interview: string | null;
  created_at: string | null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/deep_dives?id=eq.${encodeURIComponent(id)}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Supabase error' }, { status: 500 });
    }

    const rows: DeepDiveRow[] = await res.json();
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const row = rows[0];
    const statusMap: Record<string, 'pending' | 'in_progress' | 'submitted'> = {
      closed: 'submitted', open: 'pending', in_progress: 'in_progress',
    };

    return NextResponse.json({
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
      aiSummary: row.ai_summary || '',
      metaInterview: row.meta_interview || '',
      filePath: `07_context-override/pull-interview/interviews/${row.id}.md`,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
