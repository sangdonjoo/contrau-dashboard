"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/accounting', label: 'Transactions', exact: true },
  { href: '/accounting/workflow', label: 'Workflows' },
  { href: '/accounting/company', label: 'Financials' },
]

function AccountingNav() {
  const pathname = usePathname()
  return (
    <div className="border-b border-gray-200 bg-white px-4">
      <nav className="flex gap-4 overflow-x-auto">
        {tabs.map(tab => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`whitespace-nowrap py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default function AccountingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <AccountingNav />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
