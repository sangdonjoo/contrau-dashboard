'use client'

import { formatScore } from '@/api/people-contributions'

interface ContributionBarProps {
  contextScore7d: number
  gitScore7d: number
  score30d: number
  max30d: number
}

export default function ContributionBar({ contextScore7d, gitScore7d, score30d, max30d }: ContributionBarProps) {
  const scale = 0.65
  const total7d = contextScore7d + gitScore7d

  // 선형 스케일
  const pct30 = max30d > 0 ? (score30d / max30d) * 100 * scale : 0
  const pctTotal7 = max30d > 0 ? (total7d / max30d) * 100 * scale : 0
  // 7d 내부에서 git/context 비율로 분배
  const ratio7 = total7d > 0 ? gitScore7d / total7d : 0
  const pctGit7 = pctTotal7 * ratio7
  const pctContext7 = pctTotal7 - pctGit7

  return (
    <div className="flex-1 relative h-4">
      <div className="absolute inset-0 bg-gray-100 rounded-full" />
      {/* 30d — 연한 파란색 */}
      <div
        className="absolute inset-y-0 left-0 bg-blue-100 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct30}%` }}
      />
      {/* 7d 깃 — 녹색 (왼쪽) */}
      {pctGit7 > 0 && (
        <div
          className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-700 ease-out"
          style={{
            width: `${pctGit7}%`,
            borderRadius: pctContext7 === 0 ? '9999px' : '9999px 0 0 9999px',
          }}
        />
      )}
      {/* 7d 맥락 — 파란색 (오른쪽) */}
      <div
        className="absolute inset-y-0 bg-blue-500 transition-all duration-700 ease-out"
        style={{
          left: `${pctGit7}%`,
          width: `${pctContext7}%`,
          borderRadius: pctGit7 === 0 ? '9999px' : '0 9999px 9999px 0',
        }}
      />
      {/* 7d 총점 */}
      <span
        className="absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold text-blue-700 whitespace-nowrap"
        style={{ left: `calc(${pctTotal7}% + 8px)` }}
      >
        {formatScore(total7d)}
      </span>
      {/* 30d 총점 */}
      {pct30 > pctTotal7 + 5 && (
        <span
          className="absolute top-1/2 -translate-y-1/2 text-[11px] font-medium text-blue-300 whitespace-nowrap"
          style={{ left: `calc(${pct30}% + 8px)` }}
        >
          {formatScore(score30d)}
        </span>
      )}
    </div>
  )
}
