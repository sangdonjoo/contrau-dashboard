export interface ContributionPerson {
  person_id: string
  name_en: string
  name_ko: string
  score_7d: number
  score_30d: number
  git_score_7d: number
  git_score_30d: number
  context_score_7d: number
  context_score_30d: number
  rank_7d: number
  rank_30d: number
  event_count_7d: number
  event_count_30d: number
  promoted_count_7d: number
  promoted_count_30d: number
  top_channel_7d: string | null
  streak_days: number
  pl: number | null
  project: string | null
  daily: Array<{ date: string; score: number }>
}

export interface ContributionResponse {
  rankings: ContributionPerson[]
  team_total_7d: number
  team_total_30d: number
  last_updated: string
}
