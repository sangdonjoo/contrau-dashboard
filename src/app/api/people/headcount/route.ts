import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

export interface CompanyHeadcount {
  company: string;
  total: number;
  zaloLinked: number;
  zaloPct: number;
}

export interface HeadcountResponse {
  available: boolean;
  total: number;
  zaloLinked: number;
  byCompany: CompanyHeadcount[];
}

export async function GET(): Promise<NextResponse<HeadcountResponse>> {
  const empty: HeadcountResponse = { available: false, total: 0, zaloLinked: 0, byCompany: [] };

  if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json(empty);

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/people?select=company,zalo_user_id&status=neq.deleted`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) return NextResponse.json(empty);

    const rows: { company: string; zalo_user_id: string | null }[] = await res.json();

    const map = new Map<string, { total: number; zalo: number }>();
    for (const r of rows) {
      const c = r.company || 'Unknown';
      const prev = map.get(c) ?? { total: 0, zalo: 0 };
      map.set(c, {
        total: prev.total + 1,
        zalo: prev.zalo + (r.zalo_user_id ? 1 : 0),
      });
    }

    const byCompany: CompanyHeadcount[] = Array.from(map.entries())
      .map(([company, { total, zalo }]) => ({
        company,
        total,
        zaloLinked: zalo,
        zaloPct: Math.round((zalo / total) * 100),
      }))
      .sort((a, b) => b.total - a.total);

    const total = rows.length;
    const zaloLinked = rows.filter(r => r.zalo_user_id).length;

    return NextResponse.json({ available: true, total, zaloLinked, byCompany });
  } catch (err) {
    console.error('Headcount API error:', err);
    return NextResponse.json(empty);
  }
}
