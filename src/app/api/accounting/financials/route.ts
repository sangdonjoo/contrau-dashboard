import { NextResponse } from 'next/server';

// company_code → subsidiary metadata mapping
const COMPANY_META: Record<string, { id: string; name: string; nameKo: string }> = {
  SOLAGRON: { id: 'algae', name: 'Solagron', nameKo: 'Algae' },
  CPLUS:    { id: 'cplus', name: 'Contrau Plus', nameKo: 'C Plus' },  // CONTRAU_PLUS
  ECCM:     { id: 'eccm',  name: 'Eco Ca Mau', nameKo: 'Eco CM' },
  ENTOFLOW: { id: 'entoflow', name: 'Entoflow', nameKo: 'BSF' },
  CTSF:     { id: 'ctsf', name: 'Contrau Seafood', nameKo: 'Seafood' },
};

interface MonthlyRow {
  month: string;
  revenue: number;
  cogs: number;
  financialIncome: number;
  financialExpense: number;
  sellingExpense: number;
  adminExpense: number;
}

interface MonthlyFinancial {
  month: string;
  grossProfit: number;
  operatingIncome: number;
}

interface SubsidiaryFinancials {
  id: string;
  name: string;
  nameKo: string;
  data: MonthlyFinancial[];
}

interface ApiResponse {
  available: boolean;
  data: SubsidiaryFinancials[];
}

interface VoucherRow {
  refid: string;
  company_code: string;
  refdate: string;
}

interface VoucherDetailRow {
  refid: string;
  company_code: string;
  debit_account: string | null;
  credit_account: string | null;
  amount: number | string | null;
}

// Generate list of YYYY-MM strings for the last N months (newest last)
function buildMonthRange(months: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    result.push(`${yyyy}-${mm}`);
  }
  return result;
}

// Fetch all pages from a Supabase REST endpoint (handles pagination)
async function fetchAllPages<T>(
  baseUrl: string,
  headers: Record<string, string>,
  pageSize = 1000,
): Promise<T[]> {
  const results: T[] = [];
  let offset = 0;

  while (true) {
    const sep = baseUrl.includes('?') ? '&' : '?';
    const url = `${baseUrl}${sep}limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, { headers, cache: 'no-store' });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase REST error (${res.status}): ${text}`);
    }

    const page: T[] = await res.json();
    results.push(...page);

    if (page.length < pageSize) break; // last page
    offset += pageSize;
  }

  return results;
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const months = Math.max(1, Math.min(60, parseInt(searchParams.get('months') ?? '12', 10)));
    const companyFilter = searchParams.get('company') ?? 'all';

    const supabaseUrl = 'https://uyvghswdreirwhflvxhm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseKey) {
      console.error('Missing SUPABASE_SERVICE_KEY and SUPABASE_ANON_KEY');
      return NextResponse.json({ available: false, data: [] });
    }

    // Calculate date range
    const monthRange = buildMonthRange(months);
    const dateFrom = `${monthRange[0]}-01`;
    const lastMonth = monthRange[monthRange.length - 1];
    const [ly, lm] = lastMonth.split('-').map(Number);
    const lastDay = new Date(ly, lm, 0).getDate();
    const dateTo = `${lastMonth}-${String(lastDay).padStart(2, '0')}`;

    // Build company code filter
    const companyCodes = companyFilter === 'all'
      ? Object.keys(COMPANY_META)
      : [companyFilter.toUpperCase()].filter(c => c in COMPANY_META);

    if (companyCodes.length === 0) {
      return NextResponse.json({ available: false, data: [] });
    }

    const companyIn = `(${companyCodes.join(',')})`;

    const headers: Record<string, string> = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    };

    // Step 1: Fetch misa_vouchers filtered by date range + company codes
    // This gives us refid → refdate mapping
    const vouchersUrl =
      `${supabaseUrl}/rest/v1/misa_vouchers` +
      `?select=refid,company_code,refdate` +
      `&company_code=in.${companyIn}` +
      `&refdate=gte.${dateFrom}` +
      `&refdate=lte.${dateTo}`;

    const vouchers = await fetchAllPages<VoucherRow>(vouchersUrl, headers);

    if (vouchers.length === 0) {
      // No vouchers in range — return zeros
      const data: SubsidiaryFinancials[] = Object.entries(COMPANY_META)
        .filter(([code]) => companyFilter === 'all' || code.toUpperCase() === companyFilter.toUpperCase())
        .map(([, meta]) => ({
          ...meta,
          data: monthRange.map(month => ({ month, grossProfit: 0, operatingIncome: 0 })),
        }));
      return NextResponse.json({ available: true, data });
    }

    // Build refid → month map
    const refidToMonth = new Map<string, string>();
    for (const v of vouchers) {
      // refdate is typically "YYYY-MM-DD"
      const month = v.refdate.slice(0, 7); // "YYYY-MM"
      refidToMonth.set(v.refid, month);
    }

    // Build set of valid refids for fast lookup
    const validRefids = new Set(refidToMonth.keys());

    // Step 2: Fetch misa_voucher_details filtered by company codes
    // We'll then join by refid to get the date
    const detailsUrl =
      `${supabaseUrl}/rest/v1/misa_voucher_details` +
      `?select=refid,company_code,debit_account,credit_account,amount` +
      `&company_code=in.${companyIn}`;

    const details = await fetchAllPages<VoucherDetailRow>(detailsUrl, headers);

    // Step 3: Aggregate in JS
    // Map: companyCode → month → MonthlyRow accumulator
    const agg = new Map<string, Map<string, MonthlyRow>>();

    for (const d of details) {
      // Skip details whose voucher is outside the date range
      if (!validRefids.has(d.refid)) continue;

      const month = refidToMonth.get(d.refid)!;
      const code = d.company_code;

      if (!agg.has(code)) agg.set(code, new Map());
      const companyMap = agg.get(code)!;

      if (!companyMap.has(month)) {
        companyMap.set(month, {
          month,
          revenue: 0,
          cogs: 0,
          financialIncome: 0,
          financialExpense: 0,
          sellingExpense: 0,
          adminExpense: 0,
        });
      }

      const row = companyMap.get(month)!;
      const amount = Number(d.amount) || 0;
      const debit = d.debit_account ?? '';
      const credit = d.credit_account ?? '';

      // VAS accounting rules
      if (credit.startsWith('5')) row.revenue += amount;          // Revenue: credit 5xx
      if (debit === '632')        row.cogs += amount;             // COGS
      if (credit === '515')       row.financialIncome += amount;  // Financial income
      if (debit === '635')        row.financialExpense += amount; // Financial expense
      if (debit.startsWith('641')) row.sellingExpense += amount;  // Selling expense
      if (debit.startsWith('642')) row.adminExpense += amount;    // Admin expense
    }

    // Step 4: Build response
    const data: SubsidiaryFinancials[] = [];

    for (const [code, meta] of Object.entries(COMPANY_META)) {
      if (companyFilter !== 'all' && code.toUpperCase() !== companyFilter.toUpperCase()) continue;

      const companyMap = agg.get(code) ?? new Map<string, MonthlyRow>();

      const monthlyData: MonthlyFinancial[] = monthRange.map(month => {
        const r = companyMap.get(month);
        if (!r) return { month, grossProfit: 0, operatingIncome: 0 };

        const grossProfit = r.revenue - r.cogs;
        const operatingIncome =
          grossProfit + r.financialIncome - r.financialExpense - r.sellingExpense - r.adminExpense;

        return { month, grossProfit, operatingIncome };
      });

      data.push({ ...meta, data: monthlyData });
    }

    return NextResponse.json({ available: true, data });
  } catch (err) {
    console.error('Financials API error:', err);
    return NextResponse.json({ available: false, data: [] });
  }
}
