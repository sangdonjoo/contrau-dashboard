import type { JournalPreview } from '@/api/accounting/types'
import { formatVND } from '@/api/accounting/utils'

interface Props {
  entries: JournalPreview[]
}

export default function JournalPreviewTable({ entries }: Props) {
  if (entries.length === 0) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Journal Preview</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left py-1.5 pr-3">Debit</th>
              <th className="text-left py-1.5 pr-3">Credit</th>
              <th className="text-right py-1.5 pr-3">Amount</th>
              <th className="text-left py-1.5 pr-3">Description</th>
              <th className="text-center py-1.5">Confirmed</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2 pr-3 text-gray-800 text-xs">{e.debit_account}</td>
                <td className="py-2 pr-3 text-gray-800 text-xs">{e.credit_account}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-gray-900 text-xs font-medium">{formatVND(e.amount)}</td>
                <td className="py-2 pr-3 text-gray-600 text-xs max-w-xs truncate">{e.description}</td>
                <td className="py-2 text-center">
                  {e.is_confirmed ? (
                    <span className="text-green-600 text-xs">Yes</span>
                  ) : (
                    <span className="text-gray-400 text-xs">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
