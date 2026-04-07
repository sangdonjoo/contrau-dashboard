import { NextResponse } from 'next/server';

// company_code → subsidiary metadata mapping
const COMPANY_META: Record<string, { id: string; name: string; nameKo: string }> = {
  SOLAGRON: { id: 'algae', name: 'Contrau Algae', nameKo: 'Algae' },
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

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const months = Math.max(1, Math.min(60, parseInt(searchParams.get('months') ?? '12', 10)));
    const companyFilter = searchParams.get('company') ?? 'all';

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ available: false, data: [] });
    }

    // Calculate date range
    const monthRange = buildMonthRange(months);
    const dateFrom = `${monthRange[0]}-01`;
    const lastMonth = monthRange[monthRange.length - 1];
    const [ly, lm] = lastMonth.split('-').map(Number);
    const lastDay = new Date(ly, lm, 0).getDate();
    const dateTo = `${lastMonth}-${String(lastDay).padStart(2, '0')}`;

    // Build company filter clause
    const companyCodes = companyFilter === 'all'
      ? Object.keys(COMPANY_META)
      : [companyFilter.toUpperCase()];

    // SQL query: join misa_voucher_details with misa_vouchers, aggregate by company + month
    // Revenue: credit_account starts with '5' (511, 5112, 5113, 515)
    // COGS: debit_account = '632'
    // Financial income: credit_account = '515'
    // Financial expense: debit_account = '635'
    // Selling expense: debit_account starts with '641'
    // Admin expense: debit_account starts with '642'
    const sql = `
      SELECT
        vd.company_code,
        TO_CHAR(v.refdate, 'YYYY-MM') AS month,
        SUM(CASE WHEN vd.credit_account LIKE '5%' THEN vd.amount ELSE 0 END) AS revenue,
        SUM(CASE WHEN vd.debit_account = '632' THEN vd.amount ELSE 0 END) AS cogs,
        SUM(CASE WHEN vd.credit_account = '515' THEN vd.amount ELSE 0 END) AS financial_income,
        SUM(CASE WHEN vd.debit_account = '635' THEN vd.amount ELSE 0 END) AS financial_expense,
        SUM(CASE WHEN vd.debit_account LIKE '641%' THEN vd.amount ELSE 0 END) AS selling_expense,
        SUM(CASE WHEN vd.debit_account LIKE '642%' THEN vd.amount ELSE 0 END) AS admin_expense
      FROM misa_voucher_details vd
      JOIN misa_vouchers v ON v.refid = vd.refid
      WHERE v.refdate >= '${dateFrom}'
        AND v.refdate <= '${dateTo}'
        AND vd.company_code IN (${companyCodes.map(c => `'${c}'`).join(', ')})
      GROUP BY vd.company_code, TO_CHAR(v.refdate, 'YYYY-MM')
      ORDER BY vd.company_code, month
    `;

    // Use Supabase management API SQL endpoint
    const mgmtRes = await fetch(
      `https://api.supabase.com/v1/projects/uyvghswdreirwhflvxhm/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer sbp_172d709f45b40e7647c56051e428d6d549a537f4`,
        },
        body: JSON.stringify({ query: sql }),
        cache: 'no-store',
      }
    );

    if (!mgmtRes.ok) {
      const errText = await mgmtRes.text();
      console.error('Supabase management API error:', mgmtRes.status, errText);

      // Fallback: try Supabase REST API via RPC or direct table
      return NextResponse.json({ available: false, data: [] });
    }

    // Management API returns array of row objects
    interface RawRow {
      company_code: string;
      month: string;
      revenue: string | number;
      cogs: string | number;
      financial_income: string | number;
      financial_expense: string | number;
      selling_expense: string | number;
      admin_expense: string | number;
    }

    const rows: RawRow[] = await mgmtRes.json();

    // Group by company
    const byCompany = new Map<string, Map<string, MonthlyRow>>();

    for (const row of rows) {
      const code = row.company_code;
      if (!byCompany.has(code)) byCompany.set(code, new Map());
      const companyMap = byCompany.get(code)!;
      companyMap.set(row.month, {
        month: row.month,
        revenue: Number(row.revenue) || 0,
        cogs: Number(row.cogs) || 0,
        financialIncome: Number(row.financial_income) || 0,
        financialExpense: Number(row.financial_expense) || 0,
        sellingExpense: Number(row.selling_expense) || 0,
        adminExpense: Number(row.admin_expense) || 0,
      });
    }

    const data: SubsidiaryFinancials[] = [];

    for (const [code, meta] of Object.entries(COMPANY_META)) {
      if (companyFilter !== 'all' && code.toUpperCase() !== companyFilter.toUpperCase()) continue;

      const companyMap = byCompany.get(code) ?? new Map<string, MonthlyRow>();

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
