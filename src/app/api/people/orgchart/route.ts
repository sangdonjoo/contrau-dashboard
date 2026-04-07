import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

// DB company name → display name
const COMPANY_DISPLAY: Record<string, string> = {
  Contrau:    'HQ',
  ContrauEco: 'HQ',
  Solagron:   'Solagron',
  ECCM:       'Eco CM',
  Entoflow:   'Entoflow',
  BMD:        'BMD',
};

// Display order
const COMPANY_ORDER = ['HQ', 'Solagron', 'Eco CM', 'Entoflow', 'BMD'];

export interface OrgPerson {
  name: string;
  role: string;
  level: number;
}

export interface OrgCompany {
  name: string;
  people: OrgPerson[];
}

export interface OrgChartResponse {
  available: boolean;
  companies: OrgCompany[];
}

export async function GET(): Promise<NextResponse<OrgChartResponse>> {
  const empty: OrgChartResponse = { available: false, companies: [] };
  if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json(empty);

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/people?select=employee_name,company,role,info_level&status=neq.deleted&order=info_level.asc,employee_name.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: 'no-store' }
    );
    if (!res.ok) return NextResponse.json(empty);

    const rows: { employee_name: string; company: string; role: string | null; info_level: number }[] = await res.json();

    const map = new Map<string, OrgPerson[]>();
    for (const r of rows) {
      const display = COMPANY_DISPLAY[r.company] ?? r.company;
      if (!map.has(display)) map.set(display, []);
      map.get(display)!.push({
        name:  r.employee_name,
        role:  r.role || '',
        level: r.info_level ?? 5,
      });
    }

    const companies: OrgCompany[] = COMPANY_ORDER
      .filter(name => map.has(name))
      .map(name => ({ name, people: map.get(name)! }));

    return NextResponse.json({ available: true, companies });
  } catch (err) {
    console.error('OrgChart API error:', err);
    return NextResponse.json(empty);
  }
}
