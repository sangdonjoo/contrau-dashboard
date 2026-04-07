import { NextResponse } from 'next/server'
import type { ContributionPerson, ContributionResponse } from '@/api/people/contribution-types'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

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

interface RankingRow {
  person_id: string
  name_en: string
  name_ko: string | null
  score_7d: number
  score_30d: number
  rank_7d: number | null
  rank_30d: number | null
  event_count_7d: number
  event_count_30d: number
  promoted_count_7d: number
  promoted_count_30d: number
  top_channel_7d: string | null
  streak_days: number
}

interface DailyAggRow {
  person_id: string
  git_7d: number
  ctx_7d: number
  git_30d: number
  ctx_30d: number
}

export async function GET() {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  }

  try {
    // 병렬: rankings 전체 + daily 집계 (git/context 분리)
    const [rankingsRes, dailyRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/contribution_rankings?select=person_id,name_en,name_ko,score_7d,score_30d,rank_7d,rank_30d,event_count_7d,event_count_30d,promoted_count_7d,promoted_count_30d,top_channel_7d,streak_days&order=rank_7d.asc.nullslast`,
        { headers }
      ),
      // RPC로 git/ctx 분리 합계를 7d/30d 두 기간 한 번에 가져옴
      fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_git_ctx_split`,
        { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: '{}' }
      ),
    ])

    if (!rankingsRes.ok) {
      throw new Error(`rankings fetch failed: ${rankingsRes.status}`)
    }

    const rankingRows: RankingRow[] = await rankingsRes.json()

    // Daily 집계: RPC가 없으면 REST로 두 기간 따로 가져옴
    let dailyMap = new Map<string, { git_7d: number; ctx_7d: number; git_30d: number; ctx_30d: number }>()

    if (dailyRes.ok) {
      const rpcRows: DailyAggRow[] = await dailyRes.json()
      for (const r of rpcRows) {
        dailyMap.set(r.person_id, { git_7d: r.git_7d ?? 0, ctx_7d: r.ctx_7d ?? 0, git_30d: r.git_30d ?? 0, ctx_30d: r.ctx_30d ?? 0 })
      }
    } else {
      // RPC 없음 → 두 기간 REST 쿼리
      const now = new Date()
      const d7 = new Date(now); d7.setDate(d7.getDate() - 7)
      const d30 = new Date(now); d30.setDate(d30.getDate() - 30)
      const from7 = d7.toISOString().slice(0, 10)
      const from30 = d30.toISOString().slice(0, 10)

      const [daily7Res, daily30Res] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/contribution_daily?select=person_id,total_score,channel_breakdown&score_date=gte.${from7}`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/contribution_daily?select=person_id,total_score,channel_breakdown&score_date=gte.${from30}`, { headers }),
      ])

      interface DailyRow { person_id: string; total_score: number; channel_breakdown: Record<string, number> }

      const aggregate = (rows: DailyRow[]) => {
        const m = new Map<string, { git: number; ctx: number }>()
        for (const r of rows) {
          const gitAmt = r.channel_breakdown?.git ?? 0
          const ctxAmt = (r.total_score ?? 0) - gitAmt
          const prev = m.get(r.person_id) ?? { git: 0, ctx: 0 }
          m.set(r.person_id, { git: prev.git + gitAmt, ctx: prev.ctx + ctxAmt })
        }
        return m
      }

      const [rows7, rows30] = await Promise.all([
        daily7Res.ok ? (daily7Res.json() as Promise<DailyRow[]>) : Promise.resolve([]),
        daily30Res.ok ? (daily30Res.json() as Promise<DailyRow[]>) : Promise.resolve([]),
      ])

      const map7 = aggregate(rows7)
      const map30 = aggregate(rows30)

      const allPids = new Set([...map7.keys(), ...map30.keys()])
      for (const pid of allPids) {
        const a7 = map7.get(pid) ?? { git: 0, ctx: 0 }
        const a30 = map30.get(pid) ?? { git: 0, ctx: 0 }
        dailyMap.set(pid, { git_7d: a7.git, ctx_7d: a7.ctx, git_30d: a30.git, ctx_30d: a30.ctx })
      }
    }

    // ContributionPerson 배열 생성
    const rankings: ContributionPerson[] = rankingRows
      .filter(r => r.person_id !== 'others')
      .map(r => {
        const pm = PEOPLE_META[r.person_id]
        const daily = dailyMap.get(r.person_id)

        // git_score는 raw sum (channel_breakdown.git의 합)
        // contribution_rankings.score_7d는 이미 sqrt 적용된 pre-computed 값이므로
        // git/ctx 비율을 daily에서 구해 score에 적용
        const rawGit7 = daily?.git_7d ?? 0
        const rawCtx7 = daily?.ctx_7d ?? 0
        const rawTotal7 = rawGit7 + rawCtx7

        const rawGit30 = daily?.git_30d ?? 0
        const rawCtx30 = daily?.ctx_30d ?? 0
        const rawTotal30 = rawGit30 + rawCtx30

        const score7 = r.score_7d ?? 0
        const score30 = r.score_30d ?? 0

        // 비율 기반 분리 (daily 데이터가 없으면 top_channel로 추정)
        let gitScore7: number
        let ctxScore7: number
        let gitScore30: number
        let ctxScore30: number

        if (rawTotal7 > 0) {
          gitScore7 = Math.round((score7 * rawGit7 / rawTotal7) * 10) / 10
          ctxScore7 = Math.round((score7 * rawCtx7 / rawTotal7) * 10) / 10
        } else if (r.top_channel_7d === 'git') {
          gitScore7 = score7; ctxScore7 = 0
        } else {
          gitScore7 = 0; ctxScore7 = score7
        }

        if (rawTotal30 > 0) {
          gitScore30 = Math.round((score30 * rawGit30 / rawTotal30) * 10) / 10
          ctxScore30 = Math.round((score30 * rawCtx30 / rawTotal30) * 10) / 10
        } else if (r.top_channel_7d === 'git') {
          gitScore30 = score30; ctxScore30 = 0
        } else {
          gitScore30 = 0; ctxScore30 = score30
        }

        return {
          person_id: r.person_id,
          name_en: r.name_en ?? r.person_id,
          name_ko: r.name_ko ?? r.name_en ?? r.person_id,
          score_7d: score7,
          score_30d: score30,
          git_score_7d: gitScore7,
          git_score_30d: gitScore30,
          context_score_7d: ctxScore7,
          context_score_30d: ctxScore30,
          rank_7d: r.rank_7d ?? 999,
          rank_30d: r.rank_30d ?? 999,
          event_count_7d: r.event_count_7d ?? 0,
          event_count_30d: r.event_count_30d ?? 0,
          promoted_count_7d: r.promoted_count_7d ?? 0,
          promoted_count_30d: r.promoted_count_30d ?? 0,
          top_channel_7d: r.top_channel_7d ?? null,
          streak_days: r.streak_days ?? 0,
          pl: pm?.pl ?? null,
          project: pm?.project ?? null,
          daily: [],
        }
      })

    const team_total_7d = Math.round(rankings.reduce((s, p) => s + p.score_7d, 0) * 10) / 10
    const team_total_30d = Math.round(rankings.reduce((s, p) => s + p.score_30d, 0) * 10) / 10

    if (rankings.length === 0) {
      throw new Error('empty rankings')
    }

    return NextResponse.json<ContributionResponse>({
      rankings,
      team_total_7d,
      team_total_30d,
      last_updated: new Date().toISOString(),
    })
  } catch {
    // Supabase 실패 시 빈 배열 반환 (클라이언트가 mock으로 fallback)
    return NextResponse.json<ContributionResponse>({
      rankings: [],
      team_total_7d: 0,
      team_total_30d: 0,
      last_updated: new Date().toISOString(),
    })
  }
}
