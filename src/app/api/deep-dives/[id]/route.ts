import { NextResponse } from 'next/server';

type DDStatus = 'pending' | 'in_progress' | 'submitted' | 'closed';

interface DeepDiveRow {
  id: string;
  interviewee: string | null;
  issued_by: string | null;
  status: string | null;
  trigger: string | null;
  domain: string | null;
  ai_summary: string | null;
  meta_interview: string | null;
  ai_summary_ko: string | null;
  ai_summary_en: string | null;
  ai_summary_vi: string | null;
  meta_interview_ko: string | null;
  meta_interview_en: string | null;
  meta_interview_vi: string | null;
  created_at: string | null;
}

const KNOWN_STATUSES = new Set<DDStatus>(['pending', 'in_progress', 'submitted', 'closed']);

const LEVEL_MAP: [string, number][] = [
  ['sangdon', 1],
  ['jihyun', 2], ['yoo jihyun', 2],
  ['nhi', 2], ['ly hoang man nhi', 2],
  ['vicky', 2], ['nguyen thi tuong vi', 2],
  ['charlie', 3], ['nguyen van cu', 3],
  ['youngin', 3], ['seo youngin', 3],
  ['quynh', 3], ['to thi ngoc quynh', 3],
];

function personLevel(name: string): number {
  const lower = name.toLowerCase();
  let best = 4;
  for (const [key, lvl] of LEVEL_MAP) {
    if (lower.includes(key)) best = Math.min(best, lvl);
  }
  return best;
}

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
      issuedByLevel: personLevel(issuedBy),
      interviewee,
      intervieweeLevel: personLevel(interviewee),
      title: row.trigger ?? '',
      description: '',
      status: toStatus(row.status),
      domain: row.domain ?? '',
      createdAt: row.created_at?.slice(0, 10) ?? '',
      aiSummary: row.ai_summary ?? '',
      metaInterview: row.meta_interview ?? '',
      aiSummaryKo: row.ai_summary_ko ?? '',
      aiSummaryEn: row.ai_summary_en ?? '',
      aiSummaryVi: row.ai_summary_vi ?? '',
      metaInterviewKo: row.meta_interview_ko ?? '',
      metaInterviewEn: row.meta_interview_en ?? '',
      metaInterviewVi: row.meta_interview_vi ?? '',
      filePath: '',
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
