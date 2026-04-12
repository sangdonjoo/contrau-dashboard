import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export type Project = 'shrimp' | 'algae' | 'bsf';

export interface MonthlyPlanFile {
  name: string;       // 파일명 (2026-04_monthly-plan.md)
  label: string;      // 표시용 (2026-04)
  isArchive: boolean;
  filePath: string;   // 상대 경로 (project/archive/...)
}

export interface MonthlyPlanResponse {
  available: boolean;
  project: Project;
  files: MonthlyPlanFile[];
  error?: string;
}

const PROJECT_DIR_MAP: Record<Project, string> = {
  shrimp: 'shrimp',
  algae: 'algae',
  bsf: 'bsf',
};

function extractLabel(filename: string): string {
  // 2026-04_monthly-plan.md → 2026-04
  const match = filename.match(/^(\d{4}-\d{2})/);
  return match ? match[1] : filename.replace('.md', '');
}

export async function GET(request: Request) {
  try {
    const ssotPath = process.env.SSOT_PATH;
    if (!ssotPath) {
      return NextResponse.json({ available: false, project: 'shrimp', files: [], error: 'SSOT_PATH not set' });
    }

    const { searchParams } = new URL(request.url);
    const projectParam = searchParams.get('project') ?? 'shrimp';
    const project = (Object.keys(PROJECT_DIR_MAP).includes(projectParam) ? projectParam : 'shrimp') as Project;

    const projectDir = path.join(ssotPath, '06_monthly-plan', PROJECT_DIR_MAP[project]);

    if (!fs.existsSync(projectDir)) {
      return NextResponse.json({ available: true, project, files: [] });
    }

    const files: MonthlyPlanFile[] = [];

    // 루트 디렉토리 .md 파일
    const rootEntries = fs.readdirSync(projectDir, { withFileTypes: true });
    for (const entry of rootEntries) {
      if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
        files.push({
          name: entry.name,
          label: extractLabel(entry.name),
          isArchive: false,
          filePath: `${PROJECT_DIR_MAP[project]}/${entry.name}`,
        });
      }
    }

    // archive 하위 .md 파일
    const archiveDir = path.join(projectDir, 'archive');
    if (fs.existsSync(archiveDir)) {
      const archiveEntries = fs.readdirSync(archiveDir, { withFileTypes: true });
      for (const entry of archiveEntries) {
        if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
          files.push({
            name: entry.name,
            label: extractLabel(entry.name),
            isArchive: true,
            filePath: `${PROJECT_DIR_MAP[project]}/archive/${entry.name}`,
          });
        }
      }
    }

    // 최신순 정렬 (라벨 기준 내림차순)
    files.sort((a, b) => b.label.localeCompare(a.label));

    return NextResponse.json({ available: true, project, files });
  } catch (err) {
    return NextResponse.json({ available: false, project: 'shrimp', files: [], error: String(err) });
  }
}
