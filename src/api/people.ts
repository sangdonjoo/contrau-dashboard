const BROKER_URL = (process.env.NEXT_PUBLIC_BROKER_URL ?? '').replace(/\/$/, '')

interface Bot {
  id: string
  name: string
  role: string
  online: boolean
}

interface Human {
  id: string
  name: string
  role: string
}

interface PeopleResponse {
  bots: { pinned: Bot[]; domain: Bot[]; hub: Bot[] }
  idle_pool: string[]
  workers: string[]
  humans: Human[]
}

export interface UIParticipant {
  id: string
  name: string
  type: 'bot' | 'human'
  status: 'online' | 'offline'
  role: string
}

export async function fetchPeople(): Promise<UIParticipant[]> {
  const res = await fetch(`${BROKER_URL}/api/people`)
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  const data: PeopleResponse = await res.json()

  const allBots = [...data.bots.pinned, ...data.bots.domain, ...data.bots.hub]
  const bots: UIParticipant[] = allBots.map(b => ({
    id: b.id,
    name: b.name,
    type: 'bot',
    status: b.online ? 'online' : 'offline',
    role: b.role,
  }))

  const humans: UIParticipant[] = data.humans.map(h => ({
    id: h.id,
    name: h.name,
    type: 'human',
    status: 'offline',
    role: h.role,
  }))

  return [...bots, ...humans]
}
