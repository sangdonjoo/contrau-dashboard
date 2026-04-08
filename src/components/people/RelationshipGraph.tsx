'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { fetchRelationships } from '@/api/people-relationships'
import type { RelationshipNode, RelationshipEdge } from '@/api/people/relationship-types'

const RelationshipGraphCanvas = dynamic(
  () => import('./RelationshipGraphCanvas'),
  { ssr: false, loading: () => <CanvasSkeleton /> }
)

function CanvasSkeleton() {
  return (
    <div className="h-[340px] w-full bg-gray-50 rounded-lg animate-pulse" />
  )
}

export default function RelationshipGraph() {
  const [nodes, setNodes] = useState<RelationshipNode[]>([])
  const [edges, setEdges] = useState<RelationshipEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchRelationships()
      .then(data => {
        setNodes(data.nodes)
        setEdges(data.edges)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">People</p>
          <h3 className="text-base font-bold text-gray-900">HQ 소통 관계도</h3>
        </div>
        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
          30d
        </span>
      </div>

      {/* Canvas area */}
      {loading ? (
        <CanvasSkeleton />
      ) : error ? (
        <div className="h-[340px] flex items-center justify-center text-sm text-gray-400">
          데이터를 불러올 수 없습니다.
        </div>
      ) : nodes.length === 0 ? (
        <div className="h-[340px] flex items-center justify-center text-sm text-gray-400">
          기간 내 소통 데이터가 없습니다.
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-lg border border-gray-100">
          <RelationshipGraphCanvas nodes={nodes} edges={edges} />
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
          노드 크기 = 기여 점수
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 h-0.5 bg-gray-300" />
          엣지 굵기 = 같은 방 동시 접속 횟수
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-300" />
          초록 링 = 허브 노드 (mean+1σ 초과)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border border-dashed border-gray-400 bg-gray-100" />
          점선 = 단독 활동
        </span>
      </div>
    </div>
  )
}
