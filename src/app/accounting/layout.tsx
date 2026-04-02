import AccountingShell from '@/components/accounting/AccountingShell'

export const metadata = {
  title: 'Contrau — Accounting',
}

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return <AccountingShell>{children}</AccountingShell>
}
