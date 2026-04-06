import { NextResponse } from 'next/server';

interface GitHubFileEntry {
  name: string;
  download_url: string | null;
  type: string;
}

interface NoteItem {
  id: string;
  title: string;
  author: string;
  authorLevel: number;
  readers: string;
  lang: string;
  tags: string[];
  created: string;
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

function extractEnTitle(body: string): string {
  const enMatch = body.match(/<!--\s*lang:en\s*-->([\s\S]*?)(?=<!--\s*lang:\w+\s*-->|$)/);
  if (!enMatch) return '';
  const heading = enMatch[1].match(/^##\s+(.+)$/m);
  return heading ? heading[1].trim() : '';
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ available: false, items: [] });
    }

    const repo = process.env.SSOT_REPO ?? 'sangdonjoo/contrau-ssot';
    const dirUrl = `https://api.github.com/repos/${repo}/contents/01_company/01_raw/notes`;

    const dirRes = await fetch(dirUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'no-store',
    });

    if (!dirRes.ok) {
      return NextResponse.json({ available: false, items: [] });
    }

    const entries: GitHubFileEntry[] = await dirRes.json();
    const noteFiles = entries.filter(
      e => e.type === 'file' && /^NOTE-.*\.md$/.test(e.name)
    );

    const raw_items = await Promise.all(
      noteFiles.map(async (entry): Promise<NoteItem | null> => {
        if (!entry.download_url) return null;
        const contentRes = await fetch(entry.download_url, { cache: 'no-store' });
        if (!contentRes.ok) return null;
        const raw = await contentRes.text();
        const { meta, body } = parseFrontmatter(raw);

        const id = typeof meta.id === 'string' ? meta.id : entry.name.replace(/\.md$/, '');
        const author = typeof meta.author === 'string' ? meta.author : '';
        const readers = typeof meta.readers === 'string' ? meta.readers : 'all';
        const lang = typeof meta.lang === 'string' ? meta.lang : 'ko';
        const tags = Array.isArray(meta.tags) ? meta.tags : [];
        const created = typeof meta.created === 'string' ? meta.created : '';
        const fmTitle = typeof meta.title === 'string' ? meta.title : '';

        const enTitle = extractEnTitle(body);
        const title = enTitle || fmTitle;

        return { id, title, author, authorLevel: personLevel(author), readers, lang, tags, created };
      })
    );

    const validItems = raw_items
      .filter((item): item is NoteItem => item !== null)
      .sort((a, b) => b.created.localeCompare(a.created));

    return NextResponse.json({ available: true, items: validItems });
  } catch (err) {
    return NextResponse.json({ available: false, items: [], error: String(err) });
  }
}
