import type { ContributionPerson } from './people/contribution-types'

export type { ContributionPerson }

// 실데이터 (2026-04-05). 확정 가중치: git=sqrt(total_diff)x1, zalo=1x, swit=1.5x, gmail=1.3x, deepdive=5x
const MOCK_DATA: ContributionPerson[] = [
  { person_id: 'sangdon', name_en: 'Sangdon', name_ko: '상돈', score_7d: 169.0, score_30d: 324.6, git_score_7d: 134.8, git_score_30d: 193.4, context_score_7d: 34.2, context_score_30d: 131.2, rank_7d: 1, rank_30d: 2, event_count_7d: 382, event_count_30d: 876, promoted_count_7d: 0, promoted_count_30d: 55, top_channel_7d: 'git', streak_days: 5, pl: 1, project: 'HQ', daily: [] },
  { person_id: 'charlie', name_en: 'Charlie', name_ko: '찰리', score_7d: 111.8, score_30d: 227.1, git_score_7d: 16.6, git_score_30d: 52.9, context_score_7d: 95.2, context_score_30d: 174.2, rank_7d: 2, rank_30d: 3, event_count_7d: 84, event_count_30d: 218, promoted_count_7d: 73, promoted_count_30d: 129, top_channel_7d: 'zalo', streak_days: 8, pl: 3, project: 'MicroAlgae', daily: [] },
  { person_id: 'anh_nguyen', name_en: 'Anh Nguyen', name_ko: 'Anh Nguyen', score_7d: 30.5, score_30d: 82.2, git_score_7d: 0, git_score_30d: 0, context_score_7d: 30.5, context_score_30d: 82.2, rank_7d: 3, rank_30d: 5, event_count_7d: 26, event_count_30d: 81, promoted_count_7d: 19, promoted_count_30d: 54, top_channel_7d: 'zalo', streak_days: 5, pl: 4, project: 'MicroAlgae', daily: [] },
  { person_id: 'jihyun', name_en: 'Jihyun', name_ko: '지현', score_7d: 25.6, score_30d: 189.4, git_score_7d: 15.3, git_score_30d: 165.1, context_score_7d: 10.3, context_score_30d: 24.2, rank_7d: 4, rank_30d: 1, event_count_7d: 19, event_count_30d: 715, promoted_count_7d: 4, promoted_count_30d: 8, top_channel_7d: 'git', streak_days: 4, pl: 2, project: 'HQ', daily: [] },
  { person_id: 'ngoc_hue', name_en: 'Ngoc Hue', name_ko: 'Ngọc Huế', score_7d: 23.0, score_30d: 50.2, git_score_7d: 0, git_score_30d: 0, context_score_7d: 23.0, context_score_30d: 50.2, rank_7d: 5, rank_30d: 8, event_count_7d: 23, event_count_30d: 53, promoted_count_7d: 21, promoted_count_30d: 49, top_channel_7d: 'zalo', streak_days: 6, pl: 5, project: 'MicroAlgae', daily: [] },
  { person_id: 'doan_dung', name_en: 'Doan Dung', name_ko: 'Đoàn Dửng', score_7d: 20.4, score_30d: 25.9, git_score_7d: 0, git_score_30d: 0, context_score_7d: 20.4, context_score_30d: 25.9, rank_7d: 6, rank_30d: 12, event_count_7d: 14, event_count_30d: 23, promoted_count_7d: 13, promoted_count_30d: 15, top_channel_7d: 'zalo', streak_days: 3, pl: 4, project: 'MicroAlgae', daily: [] },
  { person_id: 'nguyen_thanh_con', name_en: 'Nguyen Thanh Con', name_ko: 'Nguyen Thanh Con', score_7d: 19.4, score_30d: 68.8, git_score_7d: 0, git_score_30d: 0, context_score_7d: 19.4, context_score_30d: 68.8, rank_7d: 7, rank_30d: 6, event_count_7d: 19, event_count_30d: 74, promoted_count_7d: 15, promoted_count_30d: 49, top_channel_7d: 'zalo', streak_days: 7, pl: 4, project: 'MicroAlgae', daily: [] },
  { person_id: 'quynh', name_en: 'Quynh', name_ko: 'Quỳnh', score_7d: 19.2, score_30d: 47.4, git_score_7d: 0, git_score_30d: 0, context_score_7d: 19.2, context_score_30d: 47.4, rank_7d: 8, rank_30d: 9, event_count_7d: 18, event_count_30d: 49, promoted_count_7d: 14, promoted_count_30d: 34, top_channel_7d: 'zalo', streak_days: 2, pl: 3, project: 'MicroAlgae', daily: [] },
  { person_id: 'na', name_en: 'Na', name_ko: 'Na', score_7d: 15.5, score_30d: 52.4, git_score_7d: 0, git_score_30d: 0, context_score_7d: 15.5, context_score_30d: 52.4, rank_7d: 9, rank_30d: 7, event_count_7d: 17, event_count_30d: 59, promoted_count_7d: 15, promoted_count_30d: 50, top_channel_7d: 'zalo', streak_days: 6, pl: 4, project: 'MicroAlgae', daily: [] },
  { person_id: 'son_dien', name_en: 'Son Dien', name_ko: 'Sơn Diễn', score_7d: 14.3, score_30d: 35.0, git_score_7d: 0, git_score_30d: 0, context_score_7d: 14.3, context_score_30d: 35.0, rank_7d: 10, rank_30d: 11, event_count_7d: 15, event_count_30d: 38, promoted_count_7d: 13, promoted_count_30d: 36, top_channel_7d: 'zalo', streak_days: 4, pl: 5, project: 'MicroAlgae', daily: [] },
  { person_id: 'thach_thao', name_en: 'Thach Thao', name_ko: 'Thạch Thảo', score_7d: 14.1, score_30d: 40.6, git_score_7d: 0, git_score_30d: 0, context_score_7d: 14.1, context_score_30d: 40.6, rank_7d: 11, rank_30d: 10, event_count_7d: 13, event_count_30d: 42, promoted_count_7d: 11, promoted_count_30d: 35, top_channel_7d: 'zalo', streak_days: 5, pl: 4, project: 'MicroAlgae', daily: [] },
  { person_id: 'anh_kha', name_en: 'Anh Kha', name_ko: 'Anh Kha', score_7d: 11.4, score_30d: 12.3, git_score_7d: 0, git_score_30d: 0, context_score_7d: 11.4, context_score_30d: 12.3, rank_7d: 12, rank_30d: 14, event_count_7d: 10, event_count_30d: 11, promoted_count_7d: 8, promoted_count_30d: 8, top_channel_7d: 'zalo', streak_days: 2, pl: 4, project: 'Shrimp', daily: [] },
  { person_id: 'nhi', name_en: 'Nhi', name_ko: 'Nhi', score_7d: 0, score_30d: 135.3, git_score_7d: 0, git_score_30d: 131.7, context_score_7d: 0, context_score_30d: 3.6, rank_7d: 14, rank_30d: 4, event_count_7d: 0, event_count_30d: 297, promoted_count_7d: 0, promoted_count_30d: 4, top_channel_7d: null, streak_days: 0, pl: 2, project: 'HQ', daily: [] },
  { person_id: 'thach_rat', name_en: 'Thach Rat', name_ko: 'Thạch Rát', score_7d: 2.8, score_30d: 10.9, git_score_7d: 0, git_score_30d: 0, context_score_7d: 2.8, context_score_30d: 10.9, rank_7d: 13, rank_30d: 13, event_count_7d: 3, event_count_30d: 12, promoted_count_7d: 2, promoted_count_30d: 11, top_channel_7d: 'zalo', streak_days: 2, pl: 5, project: 'MicroAlgae', daily: [] },
  { person_id: 'others', name_en: 'Others', name_ko: '기타', score_7d: 0, score_30d: 0, git_score_7d: 0, git_score_30d: 0, context_score_7d: 0, context_score_30d: 0, rank_7d: 0, rank_30d: 0, event_count_7d: 0, event_count_30d: 0, promoted_count_7d: 0, promoted_count_30d: 0, top_channel_7d: null, streak_days: 0, pl: null, project: null, daily: [] },
]

export async function fetchContributions(): Promise<ContributionPerson[]> {
  try {
    const res = await fetch('/api/people/contributions')
    if (!res.ok) return MOCK_DATA
    const json = await res.json()
    const rankings = json.rankings ?? []
    return rankings.length > 0 ? rankings : MOCK_DATA
  } catch {
    return MOCK_DATA
  }
}

export function formatScore(score: number): string {
  if (score >= 1000) return (score / 1000).toFixed(1) + 'K'
  return String(Math.round(score * 10) / 10)
}
