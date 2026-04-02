"use client"

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function SearchInput({ value, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder="Title / Vendor / Invoice"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
    />
  )
}
