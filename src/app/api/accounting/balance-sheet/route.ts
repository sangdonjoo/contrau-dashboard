import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://uyvghswdreirwhflvxhm.supabase.co';

const COMPANIES = ['CONTRAU_KR', 'CTSF', 'CINV', 'CTPLUS', 'ECCM', 'ENTOFLOW', 'BMD', 'CTAT', 'SOLAGRON'] as const;

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

export interface BalanceSheetData {
  // Current Assets
  cash: number;
  accountsReceivable: number;
  inventory: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
  // Non-current Assets
  fixedAssets: number;
  accumulatedDepreciation: number;
  constructionInProgress: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  // Short-term Liabilities
  accountsPayable: number;
  advancesReceived: number;
  otherShortTermLiabilities: number;
  totalShortTermLiabilities: number;
  // Long-term Liabilities
  longTermDebt: number;
  otherLongTermLiabilities: number;
  totalLongTermLiabilities: number;
  totalLiabilities: number;
  // Equity
  paidInCapital: number;
  retainedEarnings: number;
  otherEquity: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

export interface BalanceSheetResponse {
  available: boolean;
  asOf: string;
  company: string;
  data: BalanceSheetData;
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

function emptyData(): BalanceSheetData {
  return {
    cash: 0, accountsReceivable: 0, inventory: 0, otherCurrentAssets: 0, totalCurrentAssets: 0,
    fixedAssets: 0, accumulatedDepreciation: 0, constructionInProgress: 0,
    otherNonCurrentAssets: 0, totalNonCurrentAssets: 0, totalAssets: 0,
    accountsPayable: 0, advancesReceived: 0, otherShortTermLiabilities: 0, totalShortTermLiabilities: 0,
    longTermDebt: 0, otherLongTermLiabilities: 0, totalLongTermLiabilities: 0, totalLiabilities: 0,
    paidInCapital: 0, retainedEarnings: 0, otherEquity: 0, totalEquity: 0,
    totalLiabilitiesAndEquity: 0,
  };
}

function computeBalances(details: VoucherDetailRow[]): BalanceSheetData {
  // Per-account running net balance
  // Asset accounts: debit increases balance, credit decreases
  // Liability/Equity accounts: credit increases balance, debit decreases
  const balances = new Map<string, number>();

  for (const d of details) {
    const amount = Number(d.amount) || 0;
    const debit = d.debit_account ?? '';
    const credit = d.credit_account ?? '';

    if (debit) {
      balances.set(debit, (balances.get(debit) ?? 0) + amount);
    }
    if (credit) {
      balances.set(credit, (balances.get(credit) ?? 0) - amount);
    }
  }

  // Sum balances by prefix, applying sign conventions
  function sumPrefix(prefix: string, isAsset: boolean): number {
    let total = 0;
    for (const [acct, net] of balances) {
      if (acct.startsWith(prefix)) {
        // net = debit_sum - credit_sum
        // Asset: positive net = debit > credit = asset balance (correct)
        // Liability/Equity: negative net = credit > debit = liability balance → negate
        total += isAsset ? net : -net;
      }
    }
    return total;
  }

  function sumPrefixes(prefixes: string[], isAsset: boolean): number {
    return prefixes.reduce((s, p) => s + sumPrefix(p, isAsset), 0);
  }

  // Current Assets
  const cash = sumPrefixes(['111', '112', '113'], true);
  const accountsReceivable = sumPrefix('131', true);
  const inventory = sumPrefix('15', true);
  // Other current assets: 13x (excl 131), 14x, 16x
  const otherCurrentAssets = sumPrefixes(['132', '133', '134', '135', '136', '137', '138', '139', '141', '142', '161', '162'], true);
  const totalCurrentAssets = cash + accountsReceivable + inventory + otherCurrentAssets;

  // Non-current Assets
  const fixedAssets = sumPrefixes(['211', '212', '213'], true);
  // 214 = accumulated depreciation: credit-normal contra asset; net is negative in debit-centric map
  // To show as positive number (deduction): take the credit side surplus
  const accumulatedDepreciation = sumPrefix('214', false); // credit-normal → -net = positive
  const constructionInProgress = sumPrefix('241', true);
  const otherNonCurrentAssets = sumPrefixes(['221', '222', '228', '229', '242', '243', '244', '252', '261', '268', '269', '271', '272', '281'], true);
  const totalNonCurrentAssets = fixedAssets - accumulatedDepreciation + constructionInProgress + otherNonCurrentAssets;

  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  // Short-term Liabilities (31x, 33x, 34x short-term, 33x)
  const accountsPayable = sumPrefix('331', false);
  const advancesReceived = sumPrefix('131', false); // received advances are on credit side of 131
  const otherShortTermLiabilities = sumPrefixes(['311', '312', '313', '314', '315', '316', '317', '318', '319',
    '332', '333', '334', '335', '336', '337', '338', '339', '341', '342', '343', '344', '347'], false);
  const totalShortTermLiabilities = accountsPayable + otherShortTermLiabilities;

  // Long-term Liabilities (34x long, 35x, 36x, 37x)
  const longTermDebt = sumPrefixes(['352', '353', '356', '357', '361', '362', '363', '411'], false);
  const otherLongTermLiabilities = sumPrefixes(['371', '372', '373', '374', '375', '376', '381'], false);
  const totalLongTermLiabilities = longTermDebt + otherLongTermLiabilities;

  const totalLiabilities = totalShortTermLiabilities + totalLongTermLiabilities;

  // Equity (4xx)
  const paidInCapital = sumPrefix('411', false);
  const retainedEarnings = sumPrefixes(['421', '422', '419'], false);
  const otherEquity = sumPrefixes(['412', '413', '414', '415', '416', '417', '418', '431', '441', '461', '466'], false);
  const totalEquity = paidInCapital + retainedEarnings + otherEquity;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return {
    cash, accountsReceivable, inventory, otherCurrentAssets, totalCurrentAssets,
    fixedAssets, accumulatedDepreciation, constructionInProgress, otherNonCurrentAssets, totalNonCurrentAssets,
    totalAssets,
    accountsPayable, advancesReceived, otherShortTermLiabilities, totalShortTermLiabilities,
    longTermDebt, otherLongTermLiabilities, totalLongTermLiabilities, totalLiabilities,
    paidInCapital, retainedEarnings, otherEquity, totalEquity,
    totalLiabilitiesAndEquity,
  };
}

function addData(a: BalanceSheetData, b: BalanceSheetData): BalanceSheetData {
  const keys = Object.keys(a) as (keyof BalanceSheetData)[];
  const result = emptyData();
  for (const k of keys) {
    (result as unknown as Record<string, number>)[k] =
      (a as unknown as Record<string, number>)[k] +
      (b as unknown as Record<string, number>)[k];
  }
  return result;
}

export async function GET(request: Request): Promise<NextResponse<BalanceSheetResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') ?? 'all';
    const asOf = searchParams.get('asOf') ?? new Date().toISOString().slice(0, 10);

    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!supabaseKey) {
      return NextResponse.json({ available: false, asOf, company, data: emptyData() });
    }

    const headers: Record<string, string> = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    };

    const companyCodes = company === 'all' ? [...COMPANIES] : [company.toUpperCase()];
    const companyIn = `(${companyCodes.join(',')})`;

    // Fetch vouchers up to asOf date
    const vouchersUrl =
      `${SUPABASE_URL}/rest/v1/misa_vouchers` +
      `?select=refid,company_code,refdate` +
      `&company_code=in.${companyIn}` +
      `&refdate=lte.${asOf}`;

    const vouchers = await fetchAllPages<VoucherRow>(vouchersUrl, headers);

    if (vouchers.length === 0) {
      return NextResponse.json({ available: true, asOf, company, data: emptyData() });
    }

    const validRefids = new Set(vouchers.map(v => v.refid));

    // Fetch all details for these companies
    const detailsUrl =
      `${SUPABASE_URL}/rest/v1/misa_voucher_details` +
      `?select=refid,company_code,debit_account,credit_account,amount` +
      `&company_code=in.${companyIn}`;

    const allDetails = await fetchAllPages<VoucherDetailRow>(detailsUrl, headers);
    const details = allDetails.filter(d => validRefids.has(d.refid));

    let data: BalanceSheetData;

    if (company === 'all') {
      // Compute per-company and aggregate
      let consolidated = emptyData();
      for (const code of companyCodes) {
        const companyDetails = details.filter(d => d.company_code === code);
        if (companyDetails.length > 0) {
          consolidated = addData(consolidated, computeBalances(companyDetails));
        }
      }
      data = consolidated;
    } else {
      data = details.length > 0 ? computeBalances(details) : emptyData();
    }

    return NextResponse.json({ available: true, asOf, company, data });
  } catch (err) {
    console.error('Balance sheet API error:', err);
    return NextResponse.json({ available: false, asOf: '', company: '', data: emptyData() });
  }
}
