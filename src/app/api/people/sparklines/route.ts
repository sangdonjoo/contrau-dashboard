import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

interface DailyRow {
  person_id: string
  score_date: string
  total_score: number
}

export async function GET() {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  }

  try {
    const now = new Date()
    const d30 = new Date(now)
    d30.setDate(d30.getDate() - 30)
    const from30 = d30.toISOString().slice(0, 10)

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/contribution_daily?select=person_id,score_date,total_score&score_date=gte.${from30}&order=score_date.asc`,
      { headers }
    )

    if (!res.ok) {
      throw new Error(`contribution_daily fetch failed: ${res.status}`)
    }

    const rows: DailyRow[] = await res.json()

    // Build date axis: last 30 days as YYYY-MM-DD strings
    const dates: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().slice(0, 10))
    }

    // Group rows by person_id → map score_date → total_score
    const byPerson = new Map<string, Map<string, number>>()
    for (const row of rows) {
      if (!byPerson.has(row.person_id)) {
        byPerson.set(row.person_id, new Map())
      }
      byPerson.get(row.person_id)!.set(row.score_date, row.total_score ?? 0)
    }

    // Build sparklines: 30 numbers per person (0 if missing)
    const sparklines: Record<string, number[]> = {}
    for (const [pid, dateMap] of byPerson.entries()) {
      sparklines[pid] = dates.map(d => dateMap.get(d) ?? 0)
    }

    return NextResponse.json({ sparklines })
  } catch {
    return NextResponse.json({ sparklines: {} })
  }
}
