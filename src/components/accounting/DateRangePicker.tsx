"use client"

interface Props {
  dateFrom: string | null
  dateTo: string | null
  onChangeFrom: (v: string | null) => void
  onChangeTo: (v: string | null) => void
}

const inputClass = 'text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500'

export default function DateRangePicker({ dateFrom, dateTo, onChangeFrom, onChangeTo }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="date"
        value={dateFrom ?? ''}
        onChange={e => onChangeFrom(e.target.value || null)}
        className={inputClass}
      />
      <span className="text-xs text-gray-400">~</span>
      <input
        type="date"
        value={dateTo ?? ''}
        onChange={e => onChangeTo(e.target.value || null)}
        className={inputClass}
      />
    </div>
  )
}
