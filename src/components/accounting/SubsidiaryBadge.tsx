import type { Subsidiary } from '@/api/accounting/types'
import { getSubsidiaryShort } from '@/api/accounting/utils'

interface Props {
  subsidiary: Subsidiary
}

export default function SubsidiaryBadge({ subsidiary }: Props) {
  return (
    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
      {getSubsidiaryShort(subsidiary)}
    </span>
  )
}
