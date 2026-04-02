import AccountingShell from '@/components/accounting/AccountingShell'

export const metadata = {
  title: 'Contrau — Accounting',
}

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Accounting</h1>
        <p className="text-xs text-gray-400 mt-0.5">Workflow transactions · financials</p>
      </header>
      <AccountingShell>{children}</AccountingShell>
    </div>
  )
}
