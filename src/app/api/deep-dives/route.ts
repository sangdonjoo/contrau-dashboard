import { NextResponse } from 'next/server';

type DDStatus = 'pending' | 'in_progress' | 'submitted';

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

const KNOWN_STATUSES = new Set<DDStatus>(['pending', 'in_progress', 'submitted']);

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
        issuedByLevel: issuedBy === 'charlie' ? 1 : 3,
        interviewee,
        intervieweeLevel: interviewee.includes('charlie') ? 1 : 3,
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
