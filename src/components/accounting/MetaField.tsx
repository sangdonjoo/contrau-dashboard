interface Props {
  label: string
  children: React.ReactNode
}

export default function MetaField({ label, children }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  )
}
