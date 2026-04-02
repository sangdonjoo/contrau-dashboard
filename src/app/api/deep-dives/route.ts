import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const SSOT_PATH = process.env.SSOT_PATH ?? path.join(process.cwd(), '..', 'contrau-ssot');

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (val && !val.startsWith('|') && !val.startsWith('-')) {
        result[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }
  return result;
}

export async function GET() {
  try {
    const interviewsDir = path.join(SSOT_PATH, '07_context-override', 'pull-interview', 'interviews');
    if (!fs.existsSync(interviewsDir)) {
      return NextResponse.json({ available: false, data: [] });
    }

    const files = fs.readdirSync(interviewsDir)
      .filter(f => f.startsWith('DD-') && f.endsWith('.md'))
      .sort()
      .reverse(); // newest first

    const data = files.map(file => {
      const content = fs.readFileSync(path.join(interviewsDir, file), 'utf-8');
      const fm = parseFrontmatter(content);
      const id = file.replace('.md', '');

      // Extract date from DD-YYYYMMDD-NNN
      const dateMatch = id.match(/DD-(\d{4})(\d{2})(\d{2})/);
      const createdAt = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';

      const statusMap: Record<string, 'pending' | 'in_progress' | 'submitted'> = {
        closed: 'submitted', open: 'pending', in_progress: 'in_progress',
      };

      return {
        id,
        issuedBy: fm.issued_by || 'System',
        issuedByLevel: 1,
        interviewee: (fm.interviewee || 'Unknown').split(' ')[0],
        intervieweeLevel: 2,
        title: fm.trigger || `Interview ${id}`,
        description: fm.trigger_ref || fm.trigger || '',
        status: statusMap[fm.status] || 'pending',
        domain: fm.domain || 'company',
        createdAt,
        filePath: `07_context-override/pull-interview/interviews/${file}`,
      };
    });

    return NextResponse.json({ available: true, data });
  } catch (err) {
    return NextResponse.json({ available: false, data: [], error: String(err) });
  }
}
