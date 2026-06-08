import { useState, useEffect, useRef } from 'react'
import type { TimeRange, ChartType, OhlcData } from '../types'
import { fetchPriceHistory, fetchOhlcHistory } from '../api/coingecko'

interface ChartPoint {
  time: number
  price: number
}

const priceCache = new Map<string, ChartPoint[]>()
const ohlcCache = new Map<string, OhlcData[]>()

function sampleData<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data
  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, i) => i % step === 0)
}

const PRIMARY_MAX = 800
const SECONDARY_MAX = 400

export function useChartData(coinId: string | null, days: TimeRange, chartType: ChartType) {
  const [lineData, setLineData] = useState<ChartPoint[]>([])
  const [candleData, setCandleData] = useState<OhlcData[]>([])
  const [lineError, setLineError] = useState<string | null>(null)
  const [candleError, setCandleError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const error = chartType === 'line' ? lineError : candleError

  useEffect(() => {
    if (!coinId) {
      setLineData([])
      setCandleData([])
      setLineError(null)
      setCandleError(null)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    let cancelled = false
    setLoading(true)
    setLineError(null)
    setCandleError(null)
    if (chartType === 'line') setCandleData([])
    else setLineData([])

    const safetyTimer = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 15_000)

    const loadLine = async () => {
      const cacheKey = `${coinId}-${days}-line`
      const cached = priceCache.get(cacheKey)
      if (cached) {
        setLineData(cached)
        return
      }

      try {
        const history = await fetchPriceHistory(coinId, days, controller.signal)
        if (cancelled || controller.signal.aborted) return
        const points = history.prices.map(([time, price]) => ({ time, price }))
        const sampled = sampleData(points, PRIMARY_MAX)
        priceCache.set(cacheKey, sampled)
        setLineData(sampled)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        if (err instanceof Error && err.message.includes('abort')) return
        setLineError(err instanceof Error ? err.message : 'Failed to load chart')
      }
    }

    const loadCandle = async () => {
      const cacheKey = `${coinId}-${days}-candle`
      const cached = ohlcCache.get(cacheKey)
      if (cached) {
        setCandleData(cached)
        return
      }

      try {
        const raw = await fetchOhlcHistory(coinId, days, controller.signal)
        if (cancelled || controller.signal.aborted) return
        const candles: OhlcData[] = raw.map(([time, open, high, low, close]) => ({
          time, open, high, low, close,
        }))
        const sampled = sampleData(candles, SECONDARY_MAX)
        ohlcCache.set(cacheKey, sampled)
        setCandleData(sampled)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        if (err instanceof Error && err.message.includes('abort')) return
        try {
          const history = await fetchPriceHistory(coinId, days, controller.signal)
          if (cancelled || controller.signal.aborted) return
          const points = history.prices
          const candles: OhlcData[] = []
          for (let i = 0; i < points.length - 1; i++) {
            const [time, open] = points[i]
            const [, close] = points[i + 1]
            const high = Math.max(open, close)
            const low = Math.min(open, close)
            candles.push({ time, open, high, low, close })
          }
          const sampled = sampleData(candles, SECONDARY_MAX)
          ohlcCache.set(cacheKey, sampled)
          setCandleData(sampled)
        } catch (err2) {
          if (cancelled || controller.signal.aborted) return
          if (err2 instanceof Error && err2.message.includes('abort')) return
          setCandleError(err instanceof Error ? err.message : 'Failed to load chart')
        }
      }
    }

    const primary = chartType === 'line' ? loadLine() : loadCandle()
    const secondary = chartType === 'line' ? loadCandle() : loadLine()

    const done = () => {
      clearTimeout(safetyTimer)
      if (!cancelled && !controller.signal.aborted) setLoading(false)
    }

    primary.finally(done)
    secondary.catch(() => {}).finally(done)

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [coinId, days, chartType])

  return { chartData: lineData, candleData, loading, error }
}
