import { NextResponse } from 'next/server';

interface NoteRow {
  id: string;
  title: string | null;
  title_en: string | null;
  author: string | null;
  readers: string | null;
  lang: string | null;
  tags: string[] | null;
  created_at: string | null;
  content_en: string | null;
  content_ko: string | null;
  content_vi: string | null;
}

// Name → level lookup (case-insensitive substring match)
// L1: CEO/Founder, L2: Director/Chief, L3: PL/Factory Manager, L4: Staff, L5: Operator
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
      `${supabaseUrl}/rest/v1/notes?id=eq.${encodeURIComponent(id)}&select=*`,
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

    const rows: NoteRow[] = await res.json();

    if (!rows.length) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const row = rows[0];
    const author = row.author ?? '';
    const title = row.title_en || row.title || '';

    return NextResponse.json({
      id: row.id,
      title,
      author,
      authorLevel: personLevel(author),
      readers: row.readers ?? 'all',
      lang: row.lang ?? 'ko',
      tags: row.tags ?? [],
      created: row.created_at?.slice(0, 10) ?? '',
      contentEn: row.content_en ?? '',
      contentKo: row.content_ko ?? '',
      contentVi: row.content_vi ?? '',
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
