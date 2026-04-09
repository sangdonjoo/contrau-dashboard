import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://uyvghswdreirwhflvxhm.supabase.co';

const COMPANIES = ['CONTRAU_KR', 'CTSF', 'CINV', 'CTPLUS', 'ECCM', 'ENTOFLOW', 'CTAT', 'SOLAGRON'] as const;

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

export interface CashFlowPeriod {
  month: string; // YYYY-MM
  operating: number;
  investing: number;
  financing: number;
  net: number;
}

export interface CashFlowResponse {
  available: boolean;
  company: string;
  year: number;
  month: number | null;
  operating: number;
  investing: number;
  financing: number;
  netChange: number;
  openingBalance: number;
  closingBalance: number;
  monthly: CashFlowPeriod[];
}

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
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  return results;
}

// Cash accounts: 111 (cash on hand), 112 (bank deposits), 113 (bank transfers)
const CASH_ACCOUNTS = ['111', '112', '113'];

function isCashAccount(acct: string): boolean {
  return CASH_ACCOUNTS.some(prefix => acct.startsWith(prefix));
}

// Classify the counter-account (non-cash side) to determine activity type
function classifyActivity(counterAcct: string): 'operating' | 'investing' | 'financing' | 'unclassified' {
  if (!counterAcct) return 'unclassified';
  const p1 = counterAcct[0];
  const p2 = counterAcct.slice(0, 2);

  // Operating: revenue (5xx), COGS/expenses (6xx, 7xx), current receivables/payables (1xx excl cash, 3xx short-term)
  if (p1 === '5' || p1 === '6' || p1 === '7') return 'operating';
  if (p1 === '1' && !isCashAccount(counterAcct)) return 'operating'; // trade receivables, prepayments
  if (p1 === '3' && !p2.startsWith('34') && !p2.startsWith('35')) return 'operating'; // short-term payables

  // Investing: non-current assets (2xx)
  if (p1 === '2') return 'investing';

  // Financing: long-term liabilities (34x, 35x), equity (4xx)
  if (p2.startsWith('34') || p2.startsWith('35') || p1 === '4') return 'financing';

  return 'unclassified';
}

function emptyResponse(company: string, year: number, month: number | null): CashFlowResponse {
  return {
    available: false,
    company,
    year,
    month,
    operating: 0,
    investing: 0,
    financing: 0,
    netChange: 0,
    openingBalance: 0,
    closingBalance: 0,
    monthly: [],
  };
}

export async function GET(request: Request): Promise<NextResponse<CashFlowResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') ?? 'all';
    const now = new Date();
    const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()), 10);
    const monthParam = searchParams.get('month');
    const month = monthParam ? parseInt(monthParam, 10) : null;

    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!supabaseKey) {
      return NextResponse.json(emptyResponse(company, year, month));
    }

    const headers: Record<string, string> = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    };

    const companyCodes = company === 'all' ? [...COMPANIES] : [company.toUpperCase()];
    const companyIn = `(${companyCodes.join(',')})`;

    // Date range for the selected year (or year+month)
    const dateFrom = month
      ? `${year}-${String(month).padStart(2, '0')}-01`
      : `${year}-01-01`;
    const dateTo = month
      ? (() => {
          const lastDay = new Date(year, month, 0).getDate();
          return `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
        })()
      : `${year}-12-31`;

    // Opening balance: cash balance as of day before dateFrom
    const openingDate = new Date(dateFrom);
    openingDate.setDate(openingDate.getDate() - 1);
    const openingAsOf = openingDate.toISOString().slice(0, 10);

    // Fetch vouchers for the current period
    const vouchersUrl =
      `${SUPABASE_URL}/rest/v1/misa_vouchers` +
      `?select=refid,company_code,refdate` +
      `&company_code=in.${companyIn}` +
      `&refdate=gte.${dateFrom}` +
      `&refdate=lte.${dateTo}`;

    // Fetch vouchers for opening balance (all up to openingAsOf)
    const openingVouchersUrl =
      `${SUPABASE_URL}/rest/v1/misa_vouchers` +
      `?select=refid,company_code,refdate` +
      `&company_code=in.${companyIn}` +
      `&refdate=lte.${openingAsOf}`;

    const [periodVouchers, openingVouchers] = await Promise.all([
      fetchAllPages<VoucherRow>(vouchersUrl, headers),
      fetchAllPages<VoucherRow>(openingVouchersUrl, headers),
    ]);

    const periodRefids = new Set(periodVouchers.map(v => v.refid));
    const openingRefids = new Set(openingVouchers.map(v => v.refid));
    const allRefids = new Set([...periodRefids, ...openingRefids]);

    if (allRefids.size === 0) {
      return NextResponse.json({ ...emptyResponse(company, year, month), available: true });
    }

    // Fetch all details for these companies (filter by refid in JS)
    const detailsUrl =
      `${SUPABASE_URL}/rest/v1/misa_voucher_details` +
      `?select=refid,company_code,debit_account,credit_account,amount` +
      `&company_code=in.${companyIn}`;

    const allDetails = await fetchAllPages<VoucherDetailRow>(detailsUrl, headers);

    // Compute opening cash balance
    let openingBalance = 0;
    for (const d of allDetails) {
      if (!openingRefids.has(d.refid)) continue;
      const amount = Number(d.amount) || 0;
      const debit = d.debit_account ?? '';
      const credit = d.credit_account ?? '';
      if (isCashAccount(debit)) openingBalance += amount;
      if (isCashAccount(credit)) openingBalance -= amount;
    }

    // Compute period cash flows
    // monthly: Map<YYYY-MM, {operating, investing, financing}>
    const refidToMonth = new Map<string, string>();
    for (const v of periodVouchers) {
      refidToMonth.set(v.refid, v.refdate.slice(0, 7));
    }

    type MonthAgg = { operating: number; investing: number; financing: number };
    const monthlyAgg = new Map<string, MonthAgg>();

    let totalOperating = 0;
    let totalInvesting = 0;
    let totalFinancing = 0;

    for (const d of allDetails) {
      if (!periodRefids.has(d.refid)) continue;
      const amount = Number(d.amount) || 0;
      const debit = d.debit_account ?? '';
      const credit = d.credit_account ?? '';
      const monthKey = refidToMonth.get(d.refid) ?? '';

      if (!monthlyAgg.has(monthKey)) {
        monthlyAgg.set(monthKey, { operating: 0, investing: 0, financing: 0 });
      }
      const agg = monthlyAgg.get(monthKey)!;

      // Cash inflow: cash is debited, counter account is credited
      if (isCashAccount(debit) && credit) {
        const activity = classifyActivity(credit);
        if (activity === 'operating') { agg.operating += amount; totalOperating += amount; }
        else if (activity === 'investing') { agg.investing += amount; totalInvesting += amount; }
        else if (activity === 'financing') { agg.financing += amount; totalFinancing += amount; }
        else { agg.operating += amount; totalOperating += amount; } // default to operating
      }

      // Cash outflow: cash is credited, counter account is debited
      if (isCashAccount(credit) && debit) {
        const activity = classifyActivity(debit);
        if (activity === 'operating') { agg.operating -= amount; totalOperating -= amount; }
        else if (activity === 'investing') { agg.investing -= amount; totalInvesting -= amount; }
        else if (activity === 'financing') { agg.financing -= amount; totalFinancing -= amount; }
        else { agg.operating -= amount; totalOperating -= amount; } // default to operating
      }
    }

    // Build monthly array sorted by month
    const monthly: CashFlowPeriod[] = Array.from(monthlyAgg.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([m, agg]) => ({
        month: m,
        operating: agg.operating,
        investing: agg.investing,
        financing: agg.financing,
        net: agg.operating + agg.investing + agg.financing,
      }));

    const netChange = totalOperating + totalInvesting + totalFinancing;
    const closingBalance = openingBalance + netChange;

    return NextResponse.json({
      available: true,
      company,
      year,
      month,
      operating: totalOperating,
      investing: totalInvesting,
      financing: totalFinancing,
      netChange,
      openingBalance,
      closingBalance,
      monthly,
    });
  } catch (err) {
    console.error('Cash flow API error:', err);
    const now = new Date();
    return NextResponse.json(emptyResponse('all', now.getFullYear(), null));
  }
}
