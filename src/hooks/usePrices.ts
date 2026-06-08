import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Coin, CoinMeta } from '../types'
import { fetchCoins } from '../api/coingecko'

const POLL_INTERVAL = 30_000
const STALE_AFTER_MS = 120_000

function emptyCoins(metas: CoinMeta[]): Coin[] {
  return metas.map((m) => ({
    id: m.id,
    symbol: m.symbol,
    name: m.name,
    current_price: 0,
    price_change_percentage_24h: 0,
    market_cap: 0,
    market_cap_rank: null,
    total_volume: 0,
    high_24h: 0,
    low_24h: 0,
  }))
}

export function usePrices(coinMetas: CoinMeta[]) {
  const [coins, setCoins] = useState<Coin[]>(() => emptyCoins(coinMetas))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isStale, setIsStale] = useState(false)
  const mountedRef = useRef(true)
  const lastUpdatedRef = useRef<Date | null>(null)
  const prevIdsRef = useRef('')

  useEffect(() => {
    setCoins(emptyCoins(coinMetas))
  }, [coinMetas])

  const load = useCallback(async () => {
    const ids = coinMetas.map((c) => c.id)
    if (ids.length === 0) {
      setCoins([])
      setLoading(false)
      return
    }

    try {
      const data = await fetchCoins(ids)
      if (!mountedRef.current) return

      const enriched = coinMetas.map((cm) => {
        const match = data.find((c) => c.id === cm.id)
        if (match) {
          return { ...match, symbol: cm.symbol }
        }
        return {
          id: cm.id,
          symbol: cm.symbol,
          name: cm.name,
          current_price: 0,
          price_change_percentage_24h: 0,
          market_cap: 0,
          market_cap_rank: null,
          total_volume: 0,
          high_24h: 0,
          low_24h: 0,
        }
      })
      setCoins(enriched)
      setError(null)
      const now = new Date()
      setLastUpdated(now)
      lastUpdatedRef.current = now
      setIsStale(false)
    } catch (err) {
      if (!mountedRef.current) return
      const msg = err instanceof Error ? err.message : 'Failed to fetch prices'
      setError(msg)
      if (lastUpdatedRef.current) {
        const elapsed = Date.now() - lastUpdatedRef.current.getTime()
        setIsStale(elapsed > STALE_AFTER_MS)
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [coinMetas])

  useEffect(() => {
    const idsKey = coinMetas.map((c) => c.id).sort().join(',')
    if (idsKey !== prevIdsRef.current) {
      prevIdsRef.current = idsKey
      setLoading(true)
    }
  }, [coinMetas])

  useEffect(() => {
    mountedRef.current = true
    load()

    const id = setInterval(load, POLL_INTERVAL)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, [load])

  const formattedLastUpdated = useMemo(
    () =>
      lastUpdated
        ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : null,
    [lastUpdated]
  )

  return { coins, loading, error, lastUpdated: formattedLastUpdated, refetch: load, isStale }
}
