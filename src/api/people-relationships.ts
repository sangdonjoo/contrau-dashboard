import type { RelationshipsResponse } from './people/relationship-types'

export type { RelationshipsResponse }

export const MOCK_DATA: RelationshipsResponse = {
  nodes: [
    { id: 'sangdon', name: 'Sangdon', score: 324.6, eventCount: 876, isIsolated: false },
    { id: 'jihyun', name: 'Jihyun', score: 189.4, eventCount: 715, isIsolated: false },
    { id: 'nhi',    name: 'Nhi',    score: 135.3, eventCount: 297, isIsolated: false },
  ],
  edges: [
    { source: 'sangdon', target: 'jihyun', weight: 18, channels: ['zalo', 'swit'] },
    { source: 'sangdon', target: 'nhi',    weight: 12, channels: ['zalo', 'git'] },
    { source: 'jihyun',  target: 'nhi',    weight:  7, channels: ['zalo'] },
  ],
  period: '30d',
  generated_at: new Date().toISOString(),
}

export async function fetchRelationships(): Promise<RelationshipsResponse> {
  try {
    const res = await fetch('/api/people/relationships')
    if (!res.ok) return MOCK_DATA
    const json: RelationshipsResponse = await res.json()
    return json.nodes.length > 0 ? json : MOCK_DATA
  } catch {
    return MOCK_DATA
  }
}
