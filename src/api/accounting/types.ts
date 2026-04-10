// Enumerations
export type StageCode = 'REQUESTED' | 'REVIEWING' | 'PENDING_APPROVAL' | 'APPROVED'
  | 'PROCESSING' | 'JOURNALED' | 'SYNCED' | 'COMPLETED'

export type WorkflowType = 'PURCHASE' | 'SALES' | 'EXPENSE' | 'CAPEX'
  | 'INVENTORY' | 'PAYROLL' | 'TAX' | 'MONTH_CLOSE'
  | 'BANK' | 'FIXED_ASSET'

export type Subsidiary = 'CONTRAU_ECO' | 'CONTRAU_SHRIMP' | 'CONTRAU_ALGAE'
  | 'CONTRAU_BSF' | 'CONTRAU_FEED' | 'CONTRAU_PLUS' | 'CONTRAU_KR' | 'CONTRAU_INV' | 'CONTRAU_AQUA'
  | 'CONTRAU_NT_INV' | 'CONTRAU_NT_ECO' | 'GALG_INV' | 'SAVN'

export type TransactionStatus = 'active' | 'archived'
export type ActorType = 'AI' | 'BOT' | 'HUMAN'
export type StepResult = 'SUCCESS' | 'BLOCKED' | 'REJECTED' | null

export interface WorkflowTransaction {
  id: string
  title: string
  type: WorkflowType
  subsidiary: Subsidiary
  amount: number
  currency: string
  current_stage: StageCode
  status: TransactionStatus
  requester: string | null
  assignee: string | null
  ai_confidence: number | null
  vendor: string | null
  invoice_ref: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Attachment {
  name: string
  url: string
}

export interface WorkflowStep {
  id: string
  transaction_id: string
  stage: StageCode
  actor: string
  actor_type: ActorType
  action: string
  result: StepResult
  details: Record<string, unknown> | null
  attachments: Attachment[] | null
  started_at: string
  completed_at: string | null
}

export interface JournalPreview {
  id: string
  transaction_id: string
  debit_account: string
  credit_account: string
  amount: number
  description: string
  ai_generated: boolean
  confidence: number | null
  is_confirmed: boolean
  confirmed_at: string | null
  confirmed_by: string | null
}

export interface FilterState {
  subsidiary: Subsidiary | 'all'
  type: WorkflowType | 'all'
  threshold: 'all' | 'small' | 'medium' | 'large'
}

export interface ArchiveFilterState extends FilterState {
  dateFrom: string | null
  dateTo: string | null
  keyword: string
  page: number
  pageSize: number
}
