import { NextResponse } from 'next/server'

const ADMIN_KEY = process.env.ANTHROPIC_ADMIN_KEY ?? ''

// API key → 사용자 매핑
const KEY_TO_USER: Record<string, string> = {
  'apikey_01GToxoUm8eV6xv75APDA99y': 'jihyun',   // jihyun-claude-code
  'apikey_01LYSsr6Hkp9uAZeX72FzsbC': 'sangdon',  // zalo-ssot
}

interface UsageResult {
  uncached_input_tokens: number
  cache_read_input_tokens: number
  output_tokens: number
  api_key_id: string
}

interface UsageBucket {
  starting_at: string
  ending_at: string
  results: UsageResult[]
}

async function fetchAllPages(startingAt: string, endingAt: string): Promise<UsageBucket[]> {
  const buckets: UsageBucket[] = []
  let page: string | null = null

  while (true) {
    const url = new URL(`https://api.anthropic.com/v1/organizations/usage_report/messages`)
    url.searchParams.set('starting_at', startingAt)
    url.searchParams.set('ending_at', endingAt)
    url.searchParams.set('bucket_width', '1d')
    url.searchParams.append('group_by[]', 'api_key_id')
    if (page) url.searchParams.set('page', page)

    const res = await fetch(url.toString(), {
      headers: {
        'x-api-key': ADMIN_KEY,
        'anthropic-version': '2023-06-01',
      },
    })

    if (!res.ok) break

    const json = await res.json()
    buckets.push(...(json.data ?? []))

    if (!json.has_more) break
    page = json.next_page ?? null
    if (!page) break
  }

  return buckets
}

export async function GET() {
  try {
    const now = new Date()
    const endingAt = now.toISOString().split('T')[0] + 'T00:00:00Z'
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 30)
    const startingAt = startDate.toISOString().split('T')[0] + 'T00:00:00Z'

    const buckets = await fetchAllPages(startingAt, endingAt)

    // 사용자별 일별 집계
    // { username: { date: { input, output } } }
    const userDaily: Record<string, Record<string, { input: number; output: number }>> = {}

    for (const bucket of buckets) {
      const date = bucket.starting_at.split('T')[0]
      for (const result of bucket.results) {
        const user = KEY_TO_USER[result.api_key_id] ?? 'others'
        if (!userDaily[user]) userDaily[user] = {}
        if (!userDaily[user][date]) userDaily[user][date] = { input: 0, output: 0 }
        userDaily[user][date].input += result.uncached_input_tokens + result.cache_read_input_tokens
        userDaily[user][date].output += result.output_tokens
      }
    }

    return NextResponse.json({ userDaily })
  } catch {
    return NextResponse.json({ userDaily: {} })
  }
}
