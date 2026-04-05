import { NextResponse } from 'next/server'
import type { ContributionPerson, ContributionResponse } from '@/api/people/contribution-types'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

// 확정 가중치: git=sqrt(total_diff)*1, zalo=1, swit=1.5, gmail=1.3, deepdive=5, production=1.3
const NEW_WEIGHTS: Record<string, number> = {
  zalo: 1.0,
  swit: 1.5,
  gmail: 1.3,
  deepdive: 5.0,
  production: 1.3,
  git: 1.0,
}

// pl/project은 DB에 없으므로 정적 매핑 (people.db 기반)
const PEOPLE_META: Record<string, { pl: number; project: string }> = {
  sangdon: { pl: 1, project: 'HQ' },
  jihyun: { pl: 2, project: 'HQ' },
  nhi: { pl: 2, project: 'HQ' },
  charlie: { pl: 3, project: 'MicroAlgae' },
  quynh: { pl: 3, project: 'MicroAlgae' },
  anh_nguyen: { pl: 4, project: 'MicroAlgae' },
  nguyen_thanh_con: { pl: 4, project: 'MicroAlgae' },
  thach_thao: { pl: 4, project: 'MicroAlgae' },
  na: { pl: 4, project: 'MicroAlgae' },
  doan_dung: { pl: 4, project: 'MicroAlgae' },
  anh_kha: { pl: 4, project: 'Shrimp' },
  ngoc_hue: { pl: 5, project: 'MicroAlgae' },
  son_dien: { pl: 5, project: 'MicroAlgae' },
  thach_rat: { pl: 5, project: 'MicroAlgae' },
}

interface EventRow {
  person_id: string
  channel: string
  event_date: string
  message_len: number
  final_score: number
  channel_weight: number
  promoted_to_r1: boolean
}

interface RankingRow {
  person_id: string
  name_en: string
  name_ko: string
  streak_days: number
}

/** Supabase REST 페이지네이션 fetch */
async function fetchAllEvents(fromDate: string): Promise<EventRow[]> {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  }
  const select = 'person_id,channel,event_date,message_len,final_score,channel_weight,promoted_to_r1'
  const all: EventRow[] = []
  const PAGE = 1000

  for (let offset = 0; ; offset += PAGE) {
    const url = `${SUPABASE_URL}/rest/v1/contribution_events?select=${select}&event_date=gte.${fromDate}&order=person_id.asc&limit=${PAGE}&offset=${offset}`
    const res = await fetch(url, { headers })
    if (!res.ok) break
    const rows: EventRow[] = await res.json()
    all.push(...rows)
    if (rows.length < PAGE) break
  }
  return all
}

export async function GET() {
  try {
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    }

    // 30일 전 날짜, 7일 전 날짜
    const now = new Date()
    const d30 = new Date(now)
    d30.setDate(d30.getDate() - 30)
    const d7 = new Date(now)
    d7.setDate(d7.getDate() - 7)
    const fromDate30 = d30.toISOString().slice(0, 10)
    const fromDate7 = d7.toISOString().slice(0, 10)

    // 병렬: 이벤트 + 랭킹 메타데이터
    const [events, rankingsRes] = await Promise.all([
      fetchAllEvents(fromDate30),
      fetch(
        `${SUPABASE_URL}/rest/v1/contribution_rankings?select=person_id,name_en,name_ko,streak_days`,
        { headers }
      ),
    ])

    const rankingRows: RankingRow[] = rankingsRes.ok ? await rankingsRes.json() : []
    const metaMap = new Map(rankingRows.map(r => [r.person_id, r]))

    // 이벤트 집계
    interface PersonAcc {
      git_diff_7d: number
      git_diff_30d: number
      ctx_7d: number
      ctx_30d: number
      events_7d: number
      events_30d: number
      promoted_7d: number
      promoted_30d: number
      top_channels_7d: Record<string, number>
    }

    const acc = new Map<string, PersonAcc>()

    for (const e of events) {
      if (!metaMap.has(e.person_id)) continue

      let a = acc.get(e.person_id)
      if (!a) {
        a = { git_diff_7d: 0, git_diff_30d: 0, ctx_7d: 0, ctx_30d: 0, events_7d: 0, events_30d: 0, promoted_7d: 0, promoted_30d: 0, top_channels_7d: {} }
        acc.set(e.person_id, a)
      }

      const is7d = e.event_date >= fromDate7

      if (e.channel === 'git') {
        a.git_diff_30d += e.message_len
        if (is7d) a.git_diff_7d += e.message_len
      } else {
        const oldW = e.channel_weight || 1
        const newW = NEW_WEIGHTS[e.channel] ?? 1.0
        const score = (e.final_score / oldW) * newW
        a.ctx_30d += score
        if (is7d) {
          a.ctx_7d += score
          a.top_channels_7d[e.channel] = (a.top_channels_7d[e.channel] ?? 0) + score
        }
      }

      a.events_30d++
      if (is7d) a.events_7d++
      if (e.promoted_to_r1) {
        a.promoted_30d++
        if (is7d) a.promoted_7d++
      }
    }

    // ContributionPerson 배열 생성
    const rankings: ContributionPerson[] = []

    for (const [pid, a] of acc.entries()) {
      const meta = metaMap.get(pid)!
      const pm = PEOPLE_META[pid]
      const git7 = a.git_diff_7d > 0 ? Math.sqrt(a.git_diff_7d) : 0
      const git30 = a.git_diff_30d > 0 ? Math.sqrt(a.git_diff_30d) : 0

      // top_channel_7d
      let topCh: string | null = null
      let topChScore = 0
      for (const [ch, sc] of Object.entries(a.top_channels_7d)) {
        if (sc > topChScore) { topCh = ch; topChScore = sc }
      }
      if (git7 > topChScore) topCh = 'git'

      rankings.push({
        person_id: pid,
        name_en: meta.name_en ?? pid,
        name_ko: meta.name_ko ?? pid,
        score_7d: Math.round((git7 + a.ctx_7d) * 10) / 10,
        score_30d: Math.round((git30 + a.ctx_30d) * 10) / 10,
        git_score_7d: Math.round(git7 * 10) / 10,
        git_score_30d: Math.round(git30 * 10) / 10,
        context_score_7d: Math.round(a.ctx_7d * 10) / 10,
        context_score_30d: Math.round(a.ctx_30d * 10) / 10,
        rank_7d: 0,
        rank_30d: 0,
        event_count_7d: a.events_7d,
        event_count_30d: a.events_30d,
        promoted_count_7d: a.promoted_7d,
        promoted_count_30d: a.promoted_30d,
        top_channel_7d: topCh,
        streak_days: meta.streak_days ?? 0,
        pl: pm?.pl ?? null,
        project: pm?.project ?? null,
        daily: [],
      })
    }

    // 랭킹 계산
    const sorted7d = [...rankings].sort((a, b) => b.score_7d - a.score_7d)
    const sorted30d = [...rankings].sort((a, b) => b.score_30d - a.score_30d)
    sorted7d.forEach((p, i) => { p.rank_7d = i + 1 })
    sorted30d.forEach((p, i) => { p.rank_30d = i + 1 })

    const team_total_7d = rankings.reduce((s, p) => s + p.score_7d, 0)
    const team_total_30d = rankings.reduce((s, p) => s + p.score_30d, 0)

    return NextResponse.json<ContributionResponse>({
      rankings,
      team_total_7d,
      team_total_30d,
      last_updated: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json<ContributionResponse>({
      rankings: [],
      team_total_7d: 0,
      team_total_30d: 0,
      last_updated: new Date().toISOString(),
    })
  }
}
