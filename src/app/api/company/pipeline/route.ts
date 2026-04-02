import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const SSOT_PATH = process.env.SSOT_PATH ?? path.join(process.cwd(), '..', 'contrau-ssot');

function vnDate(daysAgo = 0): string {
  const d = new Date();
  d.setUTCHours(d.getUTCHours() + 7); // UTC→VN
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const r0Dir = path.join(SSOT_PATH, '01_company', '01_raw', 'R0');
    const r1Dir = path.join(SSOT_PATH, '01_company', '01_raw', 'R1');
    const wDir  = path.join(SSOT_PATH, '01_company', '02_digest', 'W');
    const mDir  = path.join(SSOT_PATH, '01_company', '02_digest', 'M');
    const qDir  = path.join(SSOT_PATH, '01_company', '02_digest', 'Q');
    const snapshotFile = path.join(SSOT_PATH, '01_company', '03_snapshot', 'COMPANY_SNAPSHOT.md');

    if (!fs.existsSync(r0Dir)) {
      return NextResponse.json({ available: false });
    }

    // R0/R1: 최근 5일 상태
    const channels = ['zalo', 'swit', 'gmail'];
    const r0Days = Array.from({ length: 5 }, (_, i) => {
      const date = vnDate(i + 1);
      const exists = channels.some(ch => fs.existsSync(path.join(r0Dir, `${date}_${ch}_R0.md`)));
      return { date, status: exists ? 'green' : 'red' as const };
    });

    const r1Days = Array.from({ length: 5 }, (_, i) => {
      const date = vnDate(i + 1);
      const r1Exists = fs.existsSync(path.join(r1Dir, `${date}_R1.md`));
      const r0Exists = r0Days[i].status === 'green';
      const status = r1Exists ? 'green' : (r0Exists ? 'yellow' : 'red');
      return { date, status: status as 'green' | 'yellow' | 'red', reason: !r1Exists && r0Exists ? 'R0 collected, R1 pending' : !r1Exists ? 'No R0/R1 collected' : undefined };
    });

    // W: 최신 파일 존재 여부
    const wFiles = fs.existsSync(wDir) ? fs.readdirSync(wDir).filter(f => f.endsWith('_W.md')) : [];
    const latestW = wFiles.sort().at(-1)?.replace('_W.md', '') ?? '';
    const wStatus = wFiles.length > 0 ? 'green' : 'red';

    // M: 최신 파일 존재 여부
    const mFiles = fs.existsSync(mDir) ? fs.readdirSync(mDir).filter(f => f.endsWith('_M.md')) : [];
    const latestM = mFiles.sort().at(-1)?.replace('_M.md', '') ?? '';
    const mStatus = mFiles.length > 0 ? 'green' : 'red';

    // Q: 최신 파일 존재 여부
    const qFiles = fs.existsSync(qDir) ? fs.readdirSync(qDir).filter(f => f.endsWith('_Q.md')) : [];
    const latestQ = qFiles.sort().at(-1)?.replace('_Q.md', '') ?? '';
    const qStatus = qFiles.length > 0 ? 'green' : 'red';

    // Snapshot
    const snapshotExists = fs.existsSync(snapshotFile);
    const snapshotDays = Array.from({ length: 5 }, (_, i) => ({
      date: vnDate(i + 1),
      status: (i === 0 ? (snapshotExists ? 'green' : 'red') : 'green') as 'green' | 'red',
    }));

    return NextResponse.json({
      available: true,
      r0Days,
      r1Days,
      w: { status: wStatus, label: latestW },
      m: { status: mStatus, label: latestM },
      q: { status: qStatus, label: latestQ },
      snapshotDays,
    });
  } catch (err) {
    return NextResponse.json({ available: false, error: String(err) });
  }
}
