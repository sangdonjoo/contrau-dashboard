import type { TokenUser, TokenUserProfile, TokenUserData, DailyUsage } from './people/types'
import profilesData from '@/data/people/profiles.json'
import usageData from '@/data/people/daily-usage.json'

const profiles = profilesData as TokenUserProfile[]
const allUsage = usageData as TokenUserData[]

function sumDailyUsage(dailyUsage: DailyUsage[], days: number): { total: number; input: number; output: number } {
  const recent = dailyUsage.slice(-days)
  let input = 0, output = 0
  for (const d of recent) { input += d.input; output += d.output }
  return { total: input + output, input, output }
}

export async function fetchTokenUsers(): Promise<TokenUser[]> {
  const users: TokenUser[] = profiles.map(profile => {
    const userData = allUsage.find(u => u.userId === profile.id)
    const dailyUsage = userData?.dailyUsage ?? []
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
