import { NextResponse } from 'next/server'
import type { RelationshipNode, RelationshipEdge, RelationshipsResponse } from '@/api/people/relationship-types'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY ?? ''

const HQ_PEOPLE = ['sangdon', 'jihyun', 'nhi'] as const

interface EventRow {
  person_id: string
  event_date: string
  source_room: string
  channel: string | null
  final_score: number | null
}

interface RankingRow {
  person_id: string
  name_en: string
  score_30d: number
  event_count_30d: number
}

export async function GET() {
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  }

  try {
    const now = new Date()
    const d30 = new Date(now)
    d30.setDate(d30.getDate() - 30)
    const from30 = d30.toISOString().slice(0, 10)

    const personFilter = HQ_PEOPLE.map(p => `person_id.eq.${p}`).join(',')

    const [eventsRes, rankingsRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/contribution_events?select=person_id,event_date,source_room,channel,final_score` +
          `&or=(${personFilter})` +
          `&event_date=gte.${from30}` +
          `&source_room=not.is.null`,
        { headers }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/contribution_rankings?select=person_id,name_en,score_30d,event_count_30d` +
          `&or=(${personFilter})`,
        { headers }
      ),
    ])

    if (!eventsRes.ok) {
      throw new Error(`events fetch failed: ${eventsRes.status}`)
    }

    const eventRows: EventRow[] = await eventsRes.json()

    // Build rankings map
    const rankMap = new Map<string, { name: string; score: number; eventCount: number }>()
    if (rankingsRes.ok) {
      const rankRows: RankingRow[] = await rankingsRes.json()
      for (const r of rankRows) {
        rankMap.set(r.person_id, {
          name: r.name_en ?? r.person_id,
          score: r.score_30d ?? 0,
          eventCount: r.event_count_30d ?? 0,
        })
      }
    }

    // Group events by source_room + event_date to find co-occurrences
    const roomDayMap = new Map<string, Set<string>>()
    const personChannels = new Map<string, Set<string>>()

    for (const row of eventRows) {
      const key = `${row.source_room}__${row.event_date}`
      if (!roomDayMap.has(key)) roomDayMap.set(key, new Set())
      roomDayMap.get(key)!.add(row.person_id)

      if (row.channel) {
        const pid = row.person_id
        if (!personChannels.has(pid)) personChannels.set(pid, new Set())
        personChannels.get(pid)!.add(row.channel)
      }
    }

    // Build co-occurrence edge weights
    const edgeMap = new Map<string, { weight: number; channelSet: Set<string> }>()

    for (const [, people] of roomDayMap) {
      const arr = [...people].filter(p => (HQ_PEOPLE as readonly string[]).includes(p))
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const [a, b] = [arr[i], arr[j]].sort()
          const edgeKey = `${a}__${b}`
          const existing = edgeMap.get(edgeKey)
          const aChannels = personChannels.get(a) ?? new Set<string>()
          const bChannels = personChannels.get(b) ?? new Set<string>()
          const merged = new Set([...aChannels, ...bChannels])
          if (existing) {
            existing.weight += 1
            for (const c of merged) existing.channelSet.add(c)
          } else {
            edgeMap.set(edgeKey, { weight: 1, channelSet: merged })
          }
        }
      }
    }

    // Determine which HQ people have edges (for isIsolated)
    const connectedPeople = new Set<string>()
    for (const [key, val] of edgeMap) {
      if (val.weight > 0) {
        const [a, b] = key.split('__')
        connectedPeople.add(a)
        connectedPeople.add(b)
      }
    }

    const nodes: RelationshipNode[] = HQ_PEOPLE.map(pid => {
      const meta = rankMap.get(pid)
      return {
        id: pid,
        name: meta?.name ?? pid,
        score: meta?.score ?? 0,
        eventCount: meta?.eventCount ?? 0,
        isIsolated: !connectedPeople.has(pid),
      }
    })

    const edges: RelationshipEdge[] = []
    for (const [key, val] of edgeMap) {
      const [source, target] = key.split('__')
      edges.push({
        source,
        target,
        weight: val.weight,
        channels: [...val.channelSet],
      })
    }

    return NextResponse.json<RelationshipsResponse>({
      nodes,
      edges,
      period: '30d',
      generated_at: new Date().toISOString(),
    })
  } catch {
    // Fallback: return empty so client uses mock
    return NextResponse.json<RelationshipsResponse>({
      nodes: [],
      edges: [],
      period: '30d',
      generated_at: new Date().toISOString(),
    })
  }
}
