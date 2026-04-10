/**
 * COMPANY CODE & DISPLAY NAME REGISTRY
 * ─────────────────────────────────────────────────────────────────────────────
 * Source of truth for all company_code ↔ display name mappings.
 *
 * ⚠️  DO NOT EDIT without Sangdon's approval.
 *     Changes here affect Supabase queries, Balance Sheet, P&L, and Cash Flow.
 *
 * Naming rule: [Brand prefix] [Function abbreviation]
 *   CT = Con Trau / Contrau
 *   GA = Green Algae
 *   SA = Star Algae
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const COMPANY_DISPLAY: Record<string, string> = {
  CONTRAU_KR: 'CT Eco KR',
  CTPLUS:     'CT Plus',
  CINV:       'CT Inv',
  CTAT:       'CT Aqua',
  CTSF:       'CT SF',
  ECCM:       'Eco CM',
  ENTOFLOW:   'Entoflow',
  CTNTINV:    'CT NT Inv',
  CTECONT:    'CT Eco NT',
  GAINV:      'GA Inv',
  SAVN:       'SA VN',
  SOLAGRON:   'Solagron',
  SASG:       'SA SG',
  BMD:        'BMD',
  GALG_SING:  'GA SG',
};

/** All company codes with accounting data in Supabase */
export const ACCOUNTING_COMPANIES = [
  'CONTRAU_KR',
  'CTSF',
  'CINV',
  'CTPLUS',
  'ECCM',
  'ENTOFLOW',
  'CTAT',
  'SOLAGRON',
  'CTNTINV',
  'CTECONT',
  'GAINV',
  'SAVN',
] as const;

export type AccountingCompany = typeof ACCOUNTING_COMPANIES[number];

export function getDisplayName(code: string): string {
  return COMPANY_DISPLAY[code] ?? code;
}
