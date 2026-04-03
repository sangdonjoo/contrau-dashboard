import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

function vnDate(msAgo = 0): string {
  return new Date(Date.now() + 7 * 3600000 - msAgo).toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  const days = Math.min(Number(req.nextUrl.searchParams.get('days') ?? '30'), 90)

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ data: [] })
  }

  const url = `${SUPABASE_URL}/rest/v1/company_activity?select=date,company,activity_index&order=date.asc`
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

  const rows: { date: string; company: string; activity_index: number }[] = await res.json()

  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(vnDate(i * 86400000))
  }
  const dateSet = new Set(dates)

  const grouped: Record<string, Record<string, number>> = {}
  for (const row of rows) {
    if (!dateSet.has(row.date)) continue
    if (!grouped[row.date]) grouped[row.date] = {}
    grouped[row.date][row.company] = row.activity_index
  }

  const data = dates.map(date => {
    const g = grouped[date] ?? {}
    return {
      date: date.slice(5).replace('-', '/'),
      microalgae: g['microalgae'] ?? 0,
      bsfl: g['bsfl'] ?? 0,
      shrimp: g['shrimp'] ?? 0,
      bmd: g['bmd'] ?? 0,
      hq: g['hq'] ?? 0,
    }
  })

  return NextResponse.json({ data })
}
