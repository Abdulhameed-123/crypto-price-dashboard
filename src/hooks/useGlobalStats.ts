import { useState, useEffect } from 'react'
import { fetchGlobalStats } from '../api/coingecko'

interface GlobalStats {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  marketCapChange24h: number
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchGlobalStats()
      .then((res) => {
        if (cancelled) return
        setStats({
          totalMarketCap: res.data.total_market_cap.usd,
          totalVolume: res.data.total_volume.usd,
          btcDominance: res.data.btc_dominance,
          marketCapChange24h: res.data.market_cap_change_percentage_24h_usd,
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return stats
}
