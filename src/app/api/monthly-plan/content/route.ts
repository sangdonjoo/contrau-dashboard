import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const ssotPath = process.env.SSOT_PATH;
    if (!ssotPath) {
      return NextResponse.json({ available: false, content: '', error: 'SSOT_PATH not set' });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ available: false, content: '', error: 'path param required' });
    }

    // 경로 탈출 방지: 06_monthly-plan/ 아래 파일만 허용
    const normalized = path.normalize(filePath).replace(/\\/g, '/');
    if (normalized.includes('..') || !normalized.match(/^(shrimp|algae|bsf)\//)) {
      return NextResponse.json({ available: false, content: '', error: 'invalid path' }, { status: 400 });
    }

    const fullPath = path.join(ssotPath, '06_monthly-plan', normalized);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ available: false, content: '', error: 'file not found' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    return NextResponse.json({ available: true, content });
  } catch (err) {
    return NextResponse.json({ available: false, content: '', error: String(err) });
  }
}
