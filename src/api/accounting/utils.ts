import type { StageCode, WorkflowType, Subsidiary } from './types'

export function formatVND(amount: number): string {
  if (amount === 0) return '0 ₫'
  return amount.toLocaleString('en-US') + ' ₫'
}

export function getThresholdLabel(amount: number): { label: string; color: string } {
  if (amount <= 5_000_000) return { label: 'Small', color: 'green' }
  if (amount <= 20_000_000) return { label: 'Medium', color: 'orange' }
  return { label: 'Large', color: 'red' }
}

export function relativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d ago`
}

const STAGE_LABELS: Record<StageCode, string> = {
  REQUESTED: 'Requested',
  REVIEWING: 'Reviewing',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  PROCESSING: 'Processing',
  JOURNALED: 'Journaled',
  SYNCED: 'MISA Synced',
  COMPLETED: 'Completed',
}

export const STAGE_ORDER: StageCode[] = [
  'REQUESTED', 'REVIEWING', 'PENDING_APPROVAL', 'APPROVED',
  'PROCESSING', 'JOURNALED', 'SYNCED', 'COMPLETED',
]

export function getStageLabel(stage: StageCode): string {
  return STAGE_LABELS[stage] ?? stage
}

export function getStageIndex(stage: StageCode): number {
  return STAGE_ORDER.indexOf(stage)
}

const SUBSIDIARY_SHORT: Record<Subsidiary, string> = {
  CONTRAU_ECO: 'HQ',
  CONTRAU_PLUS: 'C Plus',
  CONTRAU_SHRIMP: 'Eco CM',
  CONTRAU_ALGAE: 'Solagron',
  CONTRAU_BSF: 'Entoflow',
  CONTRAU_FEED: 'Seafood',
  CONTRAU_KR: 'KR HQ',
  CONTRAU_INV: 'Investment',
  CONTRAU_AQUA: 'Aqua Tech',
}

export function getSubsidiaryShort(sub: Subsidiary): string {
  return SUBSIDIARY_SHORT[sub] ?? sub
}

const TYPE_LABELS: Record<WorkflowType, string> = {
  PURCHASE: 'Purchase',
  SALES: 'Sales',
  EXPENSE: 'Expense',
  CAPEX: 'CAPEX',
  INVENTORY: 'Inventory',
  PAYROLL: 'Payroll',
  TAX: 'Tax',
  MONTH_CLOSE: 'Month Close',
  BANK: 'Bank/Cash',
  FIXED_ASSET: 'Fixed Asset',
}

export function getTypeLabel(type: WorkflowType): string {
  return TYPE_LABELS[type] ?? type
}
