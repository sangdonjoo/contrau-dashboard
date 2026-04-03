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

function extractSection(content: string, heading: string): string {
  const pattern = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`);
  const match = content.match(pattern);
  return match ? match[1].trim() : '';
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filePath = path.join(
    SSOT_PATH,
    '07_context-override',
    'pull-interview',
    'interviews',
    `${id}.md`
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const fm = parseFrontmatter(content);

  const dateMatch = id.match(/DD-(\d{4})(\d{2})(\d{2})/);
  const createdAt = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';

  const statusMap: Record<string, 'pending' | 'in_progress' | 'submitted'> = {
    closed: 'submitted', open: 'pending', in_progress: 'in_progress',
  };

  const aiSummary = extractSection(content, 'AI Summary');
  const metaInterview = extractSection(content, 'Meta Interview');

  return NextResponse.json({
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
    aiSummary,
    metaInterview,
    filePath: `07_context-override/pull-interview/interviews/${id}.md`,
  });
}
