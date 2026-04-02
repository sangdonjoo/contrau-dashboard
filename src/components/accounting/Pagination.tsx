"use client"

interface Props {
  page: number
  pageSize: number
  totalCount: number
  onChange: (page: number) => void
}

export default function Pagination({ page, pageSize, totalCount, onChange }: Props) {
  const totalPages = Math.ceil(totalCount / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="text-sm px-3 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">
        {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="text-sm px-3 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  )
}
