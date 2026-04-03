"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const BOT_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16"
]

const brokerUrl = (process.env.NEXT_PUBLIC_BROKER_URL ?? '').replace(/\/$/, '')

interface BotDay {
  date: string
  [bot: string]: number | string
  total: number
}

export default function BotActivityChart() {
  const [data, setData] = useState<BotDay[]>([])
  const [bots, setBots] = useState<string[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${brokerUrl}/api/stats/daily?days=30`)
      .then(r => r.json())
      .then(json => {
        const botList: string[] = json.bots ?? []
        // 총합 기준 내림차순 정렬 (많이 쓰는 봇이 먼저 → stacked 맨 아래)
        const botTotals: Record<string, number> = {}
        for (const day of json.daily ?? []) {
          for (const bot of botList) {
            const b = day.by_bot?.[bot] ?? { received: 0, sent: 0 }
            botTotals[bot] = (botTotals[bot] ?? 0) + b.received + b.sent
          }
        }
        const sortedBots = [...botList].sort((a, b) => (botTotals[b] ?? 0) - (botTotals[a] ?? 0))

        const chartData: BotDay[] = (json.daily ?? []).map((day: any) => {
          const row: BotDay = { date: day.date.slice(5).replace("-", "/"), total: day.total ?? 0 }
          for (const bot of sortedBots) {
            const b = day.by_bot?.[bot] ?? { received: 0, sent: 0 }
            row[bot] = b.received + b.sent
          }
          return row
        })

        setBots(sortedBots)
        setData(chartData)
      })
      .catch(() => setError(true))
  }, [])

  if (error || data.length === 0) {
    return <p className="text-sm text-gray-400">데이터 없음</p>
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {bots.map((bot, i) => (
          <Area
            key={bot}
            type="monotone"
            dataKey={bot}
            stackId="1"
            stroke={BOT_COLORS[i % BOT_COLORS.length]}
            fill={BOT_COLORS[i % BOT_COLORS.length]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
