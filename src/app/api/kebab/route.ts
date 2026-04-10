import { NextResponse } from 'next/server';

export const revalidate = 3600; // ISR: 1시간 캐시, 오전 9시 크론으로 강제 갱신

export interface KebabTicket {
  id: string;
  ticket_type: string;
  domain: string;
  status: string;
  question_summary: string | null;
  assignee: string | null;
  requested_at: string | null;
  resolved_at: string | null;
  proposed_kebab_path: string | null;
  score_urgency: number;
  score_importance: number;
  score_impact: number;
  score_total: number;
}

export interface KebabDomainStat {
  domain: string;
  total: number;
  urgent: number; // score_total >= 7
}

export interface KebabResponse {
  available: boolean;
  items: KebabTicket[];
  total: number;
  hasMore: boolean;
  domainStats: KebabDomainStat[];
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

const DOMAINS = ['company', 'legal', 'accounting', 'people', 'production'];

export async function GET(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ available: false, items: [], total: 0, hasMore: false, domainStats: [] });
  }

  const { searchParams } = new URL(request.url);
  const domain   = searchParams.get('domain') ?? '';
  const assignee = searchParams.get('assignee') ?? '';
  const status   = searchParams.get('status') ?? 'open';  // 기본: 미해소만
  const limit    = Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10));
  const offset   = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10));

  try {
    // 필터 조건 조립
    const conditions: string[] = [];
    if (status === 'open') {
      conditions.push('status=eq.open');
    } else if (status === 'all') {
      // no filter — 1년치만
      conditions.push('requested_at=gte.' + new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString());
    } else {
      conditions.push(`status=eq.${status}`);
    }
    if (domain)   conditions.push(`domain=eq.${encodeURIComponent(domain)}`);
    if (assignee) conditions.push(`assignee=ilike.*${encodeURIComponent(assignee)}*`);

    const filterStr = conditions.length ? '&' + conditions.join('&') : '';
    const selectFields = 'id,ticket_type,domain,status,question_summary,assignee,requested_at,resolved_at,proposed_kebab_path,score_urgency,score_importance,score_impact,score_total';

    // 메인 쿼리
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/kebab_tickets?select=${selectFields}&order=score_total.desc,requested_at.desc${filterStr}`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ available: false, items: [], total: 0, hasMore: false, domainStats: [] });
    }

    const allRows: KebabTicket[] = await res.json();
    const total = allRows.length;
    const items = allRows.slice(offset, offset + limit);
    const hasMore = offset + items.length < total;

    // 도메인별 통계 (open 티켓 기준)
    const domainStats: KebabDomainStat[] = DOMAINS.map(d => {
      const openInDomain = allRows.filter(r => r.domain === d && r.status === 'open');
      return {
        domain: d,
        total: openInDomain.length,
        urgent: openInDomain.filter(r => r.score_total >= 7).length,
      };
    });

    return NextResponse.json({ available: true, items, total, hasMore, domainStats });
  } catch (err) {
    return NextResponse.json({ available: false, items: [], total: 0, hasMore: false, domainStats: [], error: String(err) });
  }
}
