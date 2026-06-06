import { useState, useEffect, useRef } from 'react'
import type { TimeRange } from '../types'
import { fetchPriceHistory } from '../api/coingecko'

interface ChartPoint {
  time: number
  price: number
}

const cache = new Map<string, ChartPoint[]>()

export function useChartData(coinId: string | null, days: TimeRange) {
  const [data, setData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!coinId) {
      setData([])
      setError(null)
      return
    }

    const cacheKey = `${coinId}-${days}`
    const cached = cache.get(cacheKey)
    if (cached) {
      setData(cached)
      setLoading(false)
      setError(null)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPriceHistory(coinId, days, controller.signal)
      .then((history) => {
        if (cancelled || controller.signal.aborted) return
        const points = history.prices.map(([time, price]) => ({ time, price }))
        cache.set(cacheKey, points)
        if (points.length > 1000) {
          const sampled = points.filter((_, i) => i % Math.ceil(points.length / 500) === 0)
          cache.set(cacheKey, sampled)
          setData(sampled)
        } else {
          setData(points)
        }
      })
      .catch((err) => {
        if (cancelled || controller.signal.aborted) return
        if (err instanceof Error && err.message.includes('abort')) return
        setError(err instanceof Error ? err.message : 'Failed to load chart')
        setData([])
      })
      .finally(() => {
        if (!cancelled && !controller.signal.aborted) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [coinId, days])

  return { chartData: data, loading, error }
}
