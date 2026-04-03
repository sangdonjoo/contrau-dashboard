import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

const SSOT_PATH = process.env.SSOT_PATH ?? path.join(process.cwd(), '..', 'contrau-ssot')

function vnDate(msAgo = 0): string {
  return new Date(Date.now() + 7 * 3600000 - msAgo).toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  const days = Math.min(Number(req.nextUrl.searchParams.get('days') ?? '30'), 90)
  const r0Dir = path.join(SSOT_PATH, '01_company', '01_raw', 'R0')

  // 최근 N일 날짜 목록 생성
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(vnDate(i * 86400000))
  }

  const channels = ['zalo', 'swit', 'gmail']
  const data = dates.map(date => {
    const row: Record<string, string | number> = { date: date.slice(5).replace('-', '/') }
    for (const ch of channels) {
      // 패턴: {date}_{channel}_R0.md
      const filePath = path.join(r0Dir, `${date}_${ch}_R0.md`)
      row[ch] = fs.existsSync(filePath) ? 1 : 0
    }
    return row
  })

  return NextResponse.json({ data })
}
