import { NextResponse } from 'next/server';

type DDStatus = 'pending' | 'in_progress' | 'submitted';

interface DeepDiveRow {
  id: string;
  interviewee: string | null;
  issued_by: string | null;
  status: string | null;
  trigger: string | null;
  domain: string | null;
  ai_summary: string | null;
  meta_interview: string | null;
  created_at: string | null;
}

const KNOWN_STATUSES = new Set<DDStatus>(['pending', 'in_progress', 'submitted']);

function toStatus(raw: string | null): DDStatus {
  if (raw && KNOWN_STATUSES.has(raw as DDStatus)) return raw as DDStatus;
  return 'pending';
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
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const row = rows[0];
    const issuedBy = row.issued_by ?? '';
    const interviewee = row.interviewee ?? '';

    return NextResponse.json({
      id: row.id,
      issuedBy,
      issuedByLevel: issuedBy === 'charlie' ? 1 : 3,
      interviewee,
      intervieweeLevel: interviewee.includes('charlie') ? 1 : 3,
      title: row.trigger ?? '',
      description: '',
      status: toStatus(row.status),
      domain: row.domain ?? '',
      createdAt: row.created_at?.slice(0, 10) ?? '',
      aiSummary: row.ai_summary ?? '',
      metaInterview: row.meta_interview ?? '',
      filePath: '',
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
