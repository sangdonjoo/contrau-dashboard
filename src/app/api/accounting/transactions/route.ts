import { NextResponse } from 'next/server';
import type { WorkflowTransaction, WorkflowType, Subsidiary } from '@/api/accounting/types';

interface MisaVoucherRow {
  refid: string;
  company_code: string | null;
  voucher_type: number | null;
  refno: string | null;
  refdate: string | null;
  total_amount: number | null;
  currency_id: string | null;
  account_object_name: string | null;
  journal_memo: string | null;
  description: string | null;
  misa_synced_at: string | null;
}

const VOUCHER_TYPE_MAP: Record<number, WorkflowType> = {
  0: 'EXPENSE',
  1: 'BANK',
  3: 'EXPENSE',
  4: 'PURCHASE',
  5: 'BANK',
  7: 'INVENTORY',
  8: 'INVENTORY',
  13: 'SALES',
  18: 'PURCHASE',
};

const COMPANY_SUBSIDIARY_MAP: Record<string, Subsidiary> = {
  SOLAGRON:    'CONTRAU_ALGAE',
  CTPLUS:      'CONTRAU_ECO',
  ECCM:        'CONTRAU_SHRIMP',
  ENTOFLOW:    'CONTRAU_BSF',
  CTSF:        'CONTRAU_FEED',
  CONTRAU_KR:  'CONTRAU_KR',
  CINV:        'CONTRAU_INV',
  CTAT:        'CONTRAU_AQUA',
  CINVNT:      'CONTRAU_NT_INV',
  CENT:        'CONTRAU_NT_ECO',
  GALG_INV:    'GALG_INV',
  SAVN:        'SAVN',
};

function voucherTypeToWorkflow(voucherType: number | null): WorkflowType {
  if (voucherType === null) return 'EXPENSE';
  return VOUCHER_TYPE_MAP[voucherType] ?? 'EXPENSE';
}

function companyToSubsidiary(companyCode: string | null): Subsidiary {
  if (!companyCode) return 'CONTRAU_ALGAE';
  return COMPANY_SUBSIDIARY_MAP[companyCode] ?? 'CONTRAU_ALGAE';
}

function buildTitle(refno: string | null, journalMemo: string | null, description: string | null): string {
  const ref = refno ?? '';
  const memo = (journalMemo || description || '').slice(0, 60);
  if (ref && memo) return `${ref} — ${memo}`;
  return ref || memo || '(no title)';
}

function toWorkflowTransaction(row: MisaVoucherRow): WorkflowTransaction {
  const createdAt = row.refdate
    ? `${row.refdate}T00:00:00.000Z`
    : (row.misa_synced_at ?? new Date().toISOString());

  return {
    id: row.refid,
    title: buildTitle(row.refno, row.journal_memo, row.description),
    type: voucherTypeToWorkflow(row.voucher_type),
    subsidiary: companyToSubsidiary(row.company_code),
    amount: row.total_amount ?? 0,
    currency: row.currency_id ?? 'VND',
    current_stage: 'COMPLETED',
    status: 'archived',
    requester: null,
    assignee: null,
    ai_confidence: null,
    vendor: row.account_object_name ?? null,
    invoice_ref: row.refno ?? null,
    notes: row.journal_memo ?? row.description ?? null,
    created_at: createdAt,
    updated_at: row.misa_synced_at ?? createdAt,
  };
}

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ available: false, items: [], total: 0, hasMore: false });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10));
    const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10));
    const typeFilter = searchParams.get('type');
    const subsidiaryFilter = searchParams.get('subsidiary');
    const keyword = searchParams.get('keyword');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Reverse map: Subsidiary → company_code[]
    const SUBSIDIARY_COMPANY_MAP: Record<string, string[]> = {};
    for (const [code, sub] of Object.entries(COMPANY_SUBSIDIARY_MAP)) {
      if (!SUBSIDIARY_COMPANY_MAP[sub]) SUBSIDIARY_COMPANY_MAP[sub] = [];
      SUBSIDIARY_COMPANY_MAP[sub].push(code);
    }

    // Build Supabase REST query
    const selectFields = 'refid,company_code,voucher_type,refno,refdate,total_amount,currency_id,account_object_name,journal_memo,description,misa_synced_at';
    const params = new URLSearchParams();
    params.set('select', selectFields);
    params.set('order', 'refdate.desc,misa_synced_at.desc');

    // Apply subsidiary filter → company_code
    if (subsidiaryFilter && subsidiaryFilter !== 'all') {
      const companyCodes = SUBSIDIARY_COMPANY_MAP[subsidiaryFilter] ?? [];
      if (companyCodes.length === 1) {
        params.append('company_code', `eq.${companyCodes[0]}`);
      } else if (companyCodes.length > 1) {
        params.append('company_code', `in.(${companyCodes.join(',')})`);
      }
    }

    // Apply date filters
    if (dateFrom) params.append('refdate', `gte.${dateFrom}`);
    if (dateTo) params.append('refdate', `lte.${dateTo}`);

    // Apply voucher_type filter when WorkflowType is specified
    if (typeFilter) {
      const matchingVoucherTypes: number[] = [];
      for (const [vt, wt] of Object.entries(VOUCHER_TYPE_MAP)) {
        if (wt === typeFilter) matchingVoucherTypes.push(Number(vt));
      }
      if (matchingVoucherTypes.length > 0) {
        params.append('voucher_type', `in.(${matchingVoucherTypes.join(',')})`);
      }
    }

    const url = `${supabaseUrl}/rest/v1/misa_vouchers?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Supabase error:', res.status, await res.text());
      return NextResponse.json({ available: false, items: [], total: 0, hasMore: false });
    }

    let rows: MisaVoucherRow[] = await res.json();

    // Apply keyword filter in JS (Supabase REST OR search across columns)
    if (keyword) {
      const kw = keyword.toLowerCase();
      rows = rows.filter(r =>
        (r.refno?.toLowerCase().includes(kw)) ||
        (r.account_object_name?.toLowerCase().includes(kw)) ||
        (r.description?.toLowerCase().includes(kw)) ||
        (r.journal_memo?.toLowerCase().includes(kw))
      );
    }

    const total = rows.length;
    const paginated = rows.slice(offset, offset + limit);
    const items = paginated.map(toWorkflowTransaction);
    const hasMore = offset + paginated.length < total;

    return NextResponse.json({ available: true, items, total, hasMore });
  } catch (err) {
    console.error('Accounting transactions API error:', err);
    return NextResponse.json({ available: false, items: [], total: 0, hasMore: false, error: String(err) });
  }
}
