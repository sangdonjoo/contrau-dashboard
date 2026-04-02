import type { Attachment } from '@/api/accounting/types'

interface Props {
  attachments: Attachment[]
}

export default function AttachmentLink({ attachments }: Props) {
  if (attachments.length === 0) return null
  return (
    <div className="flex flex-col gap-0.5 mt-1">
      {attachments.map(a => (
        <a
          key={a.name}
          href={a.url}
          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          onClick={e => e.stopPropagation()}
        >
          <span>📎</span>
          {a.name}
        </a>
      ))}
    </div>
  )
}
