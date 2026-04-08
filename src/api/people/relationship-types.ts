export interface RelationshipNode {
  id: string
  name: string
  score: number
  eventCount: number
  isIsolated: boolean
}

export interface RelationshipEdge {
  source: string
  target: string
  weight: number
  channels: string[]
}

export interface RelationshipsResponse {
  nodes: RelationshipNode[]
  edges: RelationshipEdge[]
  period: '30d'
  generated_at: string
}
