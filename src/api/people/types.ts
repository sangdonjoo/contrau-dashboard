export type Plan = 'max' | 'premium' | 'standard'

export interface TokenUserProfile {
  id: string
  nameKo: string
  nameEn: string
  plan: Plan
  superBotId: string
  contextWindow: number
}

export interface DailyUsage {
  date: string
  input: number
  output: number
}

export interface TokenUserData {
  userId: string
  dailyUsage: DailyUsage[]
}

export interface TokenUser {
  profile: TokenUserProfile
  dailyUsage: DailyUsage[]
  total30d: number
  total7d: number
  totalInput30d: number
  totalOutput30d: number
}

export type PeriodFilter = '30d' | '7d'
