import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

const KNOWN_USERS = new Set(['sangdon', 'jihyun', 'nhi', 'cu', 'vicky', 'charlie', 'youngin'])

interface CodeUsageRow {
  user_id: string
  date: string
  input_tokens: number
  output_tokens: number
  cache_read_tokens: number
  cache_create_tokens: number
}

export async function GET() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/code_usage?select=user_id,date,input_tokens,output_tokens,cache_read_tokens,cache_create_tokens&order=date.asc`

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ userDaily: {} })
    }

    const rows: CodeUsageRow[] = await res.json()

    // user_id별 일별 집계
    // { username: { date: { input, output } } }
    const userDaily: Record<string, Record<string, { input: number; output: number }>> = {}

    for (const row of rows) {
      const user = KNOWN_USERS.has(row.user_id) ? row.user_id : 'others'
      if (!userDaily[user]) userDaily[user] = {}
      if (!userDaily[user][row.date]) userDaily[user][row.date] = { input: 0, output: 0 }
      userDaily[user][row.date].input += row.input_tokens
      userDaily[user][row.date].output += row.output_tokens
    }

    return NextResponse.json({ userDaily })
  } catch {
    return NextResponse.json({ userDaily: {} })
  }
}
