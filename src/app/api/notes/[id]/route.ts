import { NextResponse } from 'next/server';

interface GitHubFileContent {
  content: string;
  encoding: string;
}

// Name → level lookup (case-insensitive substring match)
// L1: CEO/Founder, L2: Director/Chief, L3: PL/Factory Manager, L4: Staff, L5: Operator
const LEVEL_MAP: [string, number][] = [
  ['sangdon', 1],
  ['jihyun', 2], ['yoo jihyun', 2],
  ['nhi', 2], ['ly hoang man nhi', 2],
  ['vicky', 2], ['nguyen thi tuong vi', 2],
  ['charlie', 3], ['nguyen van cu', 3],
  ['youngin', 3], ['seo youngin', 3],
  ['quynh', 3], ['to thi ngoc quynh', 3],
];

function personLevel(name: string): number {
  const lower = name.toLowerCase();
  let best = 4;
  for (const [key, lvl] of LEVEL_MAP) {
    if (lower.includes(key)) best = Math.min(best, lvl);
  }
  return best;
}

function parseFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { meta: {}, body: raw };
  const body = raw.slice(match[0].length).trim();
  const meta: Record<string, string | string[]> = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      let val = kv[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        meta[kv[1]] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      } else {
        meta[kv[1]] = val.replace(/^["']|["']$/g, '');
      }
    }
  }
  return { meta, body };
}

function parseLangSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const parts = body.split(/<!--\s*lang:(\w+)\s*-->/);
  // parts: ['before', 'en', 'en content', 'ko', 'ko content', ...]
  for (let i = 1; i < parts.length; i += 2) {
    sections[parts[i]] = parts[i + 1]?.trim() ?? '';
  }
  return sections;
}

function extractHeading(content: string): string {
  const heading = content.match(/^##\s+(.+)$/m);
  return heading ? heading[1].trim() : '';
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    const repo = process.env.SSOT_REPO ?? 'sangdonjoo/contrau-ssot';
    const fileUrl = `https://api.github.com/repos/${repo}/contents/01_company/01_raw/notes/${id}.md`;

    const res = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: 'GitHub API error' }, { status: 500 });
    }

    const file: GitHubFileContent = await res.json();
    const raw = Buffer.from(file.content, 'base64').toString('utf-8');

    const { meta, body } = parseFrontmatter(raw);
    const sections = parseLangSections(body);

    const contentEn = sections['en'] ?? '';
    const contentKo = sections['ko'] ?? '';
    const contentVi = sections['vi'] ?? '';

    const author = typeof meta.author === 'string' ? meta.author : '';
    const fmTitle = typeof meta.title === 'string' ? meta.title : '';
    const enTitle = extractHeading(contentEn) || fmTitle;

    return NextResponse.json({
      id: typeof meta.id === 'string' ? meta.id : id,
      title: enTitle,
      author,
      authorLevel: personLevel(author),
      readers: typeof meta.readers === 'string' ? meta.readers : 'all',
      lang: typeof meta.lang === 'string' ? meta.lang : 'ko',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      created: typeof meta.created === 'string' ? meta.created : '',
      contentEn,
      contentKo,
      contentVi,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
