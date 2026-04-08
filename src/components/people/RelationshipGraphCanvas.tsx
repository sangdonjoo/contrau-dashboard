'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { RelationshipNode, RelationshipEdge } from '@/api/people/relationship-types'

interface Props {
  nodes: RelationshipNode[]
  edges: RelationshipEdge[]
}

interface GraphNode extends RelationshipNode {
  x?: number
  y?: number
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  weight: number
  channels: string[]
}

export default function RelationshipGraphCanvas({ nodes, edges }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width)
    })
    observer.observe(containerRef.current)
    setWidth(containerRef.current.offsetWidth)
    return () => observer.disconnect()
  }, [])

  const graphData = {
    nodes: nodes as GraphNode[],
    links: edges as GraphLink[],
  }

  // Compute mean + 1σ degree for hub detection
  const degreeMap = new Map<string, number>()
  for (const edge of edges) {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) ?? 0) + 1)
    degreeMap.set(edge.target, (degreeMap.get(edge.target) ?? 0) + 1)
  }
  const degrees = [...degreeMap.values()]
  const mean = degrees.length > 0 ? degrees.reduce((a, b) => a + b, 0) / degrees.length : 0
  const variance = degrees.length > 0 ? degrees.reduce((s, d) => s + (d - mean) ** 2, 0) / degrees.length : 0
  const sigma = Math.sqrt(variance)
  const hubThreshold = mean + sigma

  const maxScore = nodes.length > 0 ? Math.max(...nodes.map(n => n.score)) : 1

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D) => {
      const x = node.x ?? 0
      const y = node.y ?? 0
      const radius = Math.max(5, Math.min(14, Math.sqrt(node.score / maxScore) * 14))
      const degree = degreeMap.get(node.id) ?? 0
      const isHub = sigma > 0 && degree > hubThreshold

      // Hub ring (emerald stroke, no shadow)
      if (isHub) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI)
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.restore()
      }

      // Isolated node: gray dashed circle
      if (node.isIsolated) {
        ctx.save()
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.strokeStyle = '#9ca3af'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.fillStyle = '#f3f4f6'
        ctx.fill()
        ctx.restore()
      } else {
        // Normal filled circle
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = isHub ? '#059669' : '#3b82f6'
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Label below node
      ctx.font = `${Math.max(9, radius * 0.8)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#374151'
      ctx.fillText(node.name, x, y + radius + 3)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [degreeMap, hubThreshold, sigma, maxScore, nodes]
  )

  const linkWidth = useCallback(
    (link: GraphLink) => Math.log1p(link.weight) * 2,
    []
  )

  const linkColor = useCallback(() => '#d1d5db', [])

  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current?.zoom(1.2, 300)
      }, 600)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
    <ForceGraph2D
      ref={fgRef}
      graphData={graphData}
      width={width}
      height={340}
      nodeId="id"
      nodeCanvasObject={nodeCanvasObject}
      nodeCanvasObjectMode={() => 'replace'}
      linkWidth={linkWidth}
      linkColor={linkColor}
      enableNodeDrag
      enableZoomInteraction
      backgroundColor="#ffffff"
    />
    </div>
  )
}
