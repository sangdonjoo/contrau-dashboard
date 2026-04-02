import type { ActorType } from '@/api/accounting/types'

interface Props {
  actorType: ActorType
}

const STYLES: Record<ActorType, { bg: string; label: string }> = {
  AI: { bg: 'bg-blue-500', label: 'AI' },
  BOT: { bg: 'bg-purple-500', label: 'B' },
  HUMAN: { bg: 'bg-green-500', label: 'H' },
}

export default function ActorIcon({ actorType }: Props) {
  const { bg, label } = STYLES[actorType]
  return (
    <div className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {label}
    </div>
  )
}
