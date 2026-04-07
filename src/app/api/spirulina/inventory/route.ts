import { NextResponse } from 'next/server';

const SUPABASE_MGMT = 'https://api.supabase.com/v1/projects/uyvghswdreirwhflvxhm/database/query';
const SUPABASE_TOKEN = 'sbp_172d709f45b40e7647c56051e428d6d549a537f4';

export interface ChemicalRow {
  id: string;
  name: string;
  unit: string;
  peakCapacity: number;
  currentStock: number;
  todayPlannedUsage: number;
  reorderThreshold: number;
}

interface ApiResponse {
  available: boolean;
  data: ChemicalRow[];
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const sql = `
      SELECT
        i.item_code,
        COALESCE(NULLIF(i.factory_name, ''), i.item_code) AS factory_name,
        i.uom,
        SUM(i.onhand_qty)          AS total_qty,
        COALESCE(ci.min_stock, 0)  AS min_stock
      FROM chem_inventory i
      LEFT JOIN chem_items ci ON ci.item_code = i.item_code
      WHERE i.onhand_qty >= 0
      GROUP BY i.item_code, i.factory_name, i.uom, ci.min_stock
      ORDER BY i.factory_name
    `;

    const res = await fetch(SUPABASE_MGMT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_TOKEN}`,
      },
      body: JSON.stringify({ query: sql }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Supabase inventory API error:', res.status, await res.text());
      return NextResponse.json({ available: false, data: [] });
    }

    interface RawRow {
      item_code: string;
      factory_name: string;
      uom: string;
      total_qty: string | number;
      min_stock: string | number;
    }

    const rows: RawRow[] = await res.json();

    const data: ChemicalRow[] = rows.map(r => {
      const currentStock     = Number(r.total_qty)  || 0;
      const reorderThreshold = Number(r.min_stock)  || 0;
      // peakCapacity: at least 5x reorder threshold or 2x current stock
      const peakCapacity = Math.max(reorderThreshold * 5, currentStock * 2, 100);

      return {
        id:                r.item_code,
        name:              r.factory_name,
        unit:              r.uom || 'kg',
        peakCapacity,
        currentStock,
        todayPlannedUsage: 0, // App1 deduction data — available after App1 sync
        reorderThreshold,
      };
    });

    return NextResponse.json({ available: true, data });
  } catch (err) {
    console.error('Inventory API error:', err);
    return NextResponse.json({ available: false, data: [] });
  }
}
