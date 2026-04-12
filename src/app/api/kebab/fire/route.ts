import { NextResponse } from 'next/server';

interface FireRequest {
  ids: string[];
}

export async function POST(request: Request) {
  try {
    const body: FireRequest = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array required' }, { status: 400 });
    }

    // Phase 9+: 실 잘로 발사 활성화 예정
    // 현재는 stub — ids를 받아 로그만 남기고 성공 응답
    console.log(`[kebab/fire] stub: ${ids.length}건 발사 요청 (Phase 9+에서 실 잘로 발사 활성화)`);

    return NextResponse.json({
      success: true,
      fired: ids.length,
      message: `${ids.length}건 발사 (Phase 9+ 실 잘로 발사 활성화)`,
      stub: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
