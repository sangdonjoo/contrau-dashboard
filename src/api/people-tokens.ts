import type { TokenUser, TokenUserProfile, DailyUsage } from './people/types'
import profilesData from '@/data/people/profiles.json'

const profiles = profilesData as TokenUserProfile[]

// 고정 3그룹 정의
const FIXED_USER_IDS = ['sangdon', 'jihyun', 'others'] as const

const OTHERS_PROFILE: TokenUserProfile = {
  id: 'others',
  nameKo: '기타',
  nameEn: 'Others',
  plan: 'standard',
  superBotId: '',
  contextWindow: 0,
}

function sumDailyUsage(dailyUsage: DailyUsage[], days: number): { total: number; input: number; output: number } {
  const recent = dailyUsage.slice(-days)
  let input = 0, output = 0
  for (const d of recent) { input += d.input; output += d.output }
  return { total: input + output, input, output }
}

export async function fetchTokenUsers(): Promise<TokenUser[]> {
  let userDaily: Record<string, Record<string, { input: number; output: number }>> = {}

  try {
    const res = await fetch('/api/people/tokens')
    if (res.ok) {
      const json = await res.json()
      userDaily = json.userDaily ?? {}
    }
  } catch {
    // API 실패 시 빈 데이터로 처리
  }

  const users: TokenUser[] = FIXED_USER_IDS.map(userId => {
    const profile: TokenUserProfile =
      userId === 'others'
        ? OTHERS_PROFILE
        : (profiles.find(p => p.id === userId) ?? { ...OTHERS_PROFILE, id: userId, nameKo: userId, nameEn: userId })

    const dateMap = userDaily[userId] ?? {}
    const dailyUsage: DailyUsage[] = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { input, output }]) => ({ date, input, output }))
    const sum30 = sumDailyUsage(dailyUsage, 30)
    const sum7 = sumDailyUsage(dailyUsage, 7)
    return {
      profile,
      dailyUsage,
      total30d: sum30.total,
      total7d: sum7.total,
      totalInput30d: sum30.input,
      totalOutput30d: sum30.output,
    }
  })
  return users.sort((a, b) => b.total30d - a.total30d)
}

export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M'
  if (count >= 1_000) return (count / 1_000).toFixed(0) + 'K'
  return String(count)
}

export function calcPercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
