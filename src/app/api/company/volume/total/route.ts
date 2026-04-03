import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

function vnDate(msAgo = 0): string {
  return new Date(Date.now() + 7 * 3600000 - msAgo).toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  const days = Math.min(Number(req.nextUrl.searchParams.get('days') ?? '30'), 90)

  const url = `${SUPABASE_URL}/rest/v1/company_volume?select=date,channel,r0_count,r1_exists&order=date.asc`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'supabase fetch failed' }, { status: 502 })
  }

  const rows: { date: string; channel: string; r0_count: number; r1_exists: boolean }[] = await res.json()

  // 최근 N일 날짜 목록 생성
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(vnDate(i * 86400000))
  }
  const dateSet = new Set(dates)

  // date별 집계: r0 = SUM(r0_count), r1 = MAX(r1_exists ? 1 : 0)
  const grouped: Record<string, { r0: number; r1: number }> = {}
  for (const row of rows) {
    if (!dateSet.has(row.date)) continue
    if (!grouped[row.date]) grouped[row.date] = { r0: 0, r1: 0 }
    grouped[row.date].r0 += row.r0_count
    if (row.r1_exists) grouped[row.date].r1 = 1
  }

  const data: { date: string; r0: number; r1: number }[] = dates.map(date => {
    const g = grouped[date] ?? { r0: 0, r1: 0 }
    return {
      date: date.slice(5).replace('-', '/'),
      r0: g.r0,
      r1: g.r1,
    }
  })

  return NextResponse.json({ data })
}
