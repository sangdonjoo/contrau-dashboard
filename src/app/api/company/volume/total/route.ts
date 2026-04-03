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
  const r1Dir = path.join(SSOT_PATH, '01_company', '01_raw', 'R1')

  const channels = ['zalo', 'swit', 'gmail']
  const data: { date: string; r0: number; r1: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = vnDate(i * 86400000)
    let r0 = 0
    for (const ch of channels) {
      if (fs.existsSync(path.join(r0Dir, `${date}_${ch}_R0.md`))) r0++
    }
    const r1 = fs.existsSync(path.join(r1Dir, `${date}_R1.md`)) ? 1 : 0
    data.push({ date: date.slice(5).replace('-', '/'), r0, r1 })
  }

  return NextResponse.json({ data })
}
