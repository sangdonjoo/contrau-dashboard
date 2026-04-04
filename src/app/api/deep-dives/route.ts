import { NextResponse } from 'next/server';

type DDStatus = 'pending' | 'in_progress' | 'submitted' | 'closed';

interface DeepDiveRow {
  id: string;
  interviewee: string | null;
  issued_by: string | null;
  status: string | null;
  trigger: string | null;
  domain: string | null;
  created_at: string | null;
}

interface DeepDive {
  id: string;
  issuedBy: string;
  issuedByLevel: number;
  interviewee: string;
  intervieweeLevel: number;
  title: string;
  description: string;
  status: DDStatus;
  domain: string;
  createdAt: string;
  filePath: string;
}

const KNOWN_STATUSES = new Set<DDStatus>(['pending', 'in_progress', 'submitted', 'closed']);

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

function toStatus(raw: string | null): DDStatus {
  if (raw && KNOWN_STATUSES.has(raw as DDStatus)) return raw as DDStatus;
  return 'pending';
}

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ available: false, data: [] });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/deep_dives?select=id,interviewee,issued_by,status,trigger,domain,created_at&order=created_at.desc`,
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

    const data: DeepDive[] = rows.map((row) => {
      const issuedBy = row.issued_by ?? '';
      const interviewee = row.interviewee ?? '';
      return {
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
        filePath: '',
      };
    });

    return NextResponse.json({ available: true, data });
  } catch (err) {
    return NextResponse.json({ available: false, data: [], error: String(err) });
  }
}
