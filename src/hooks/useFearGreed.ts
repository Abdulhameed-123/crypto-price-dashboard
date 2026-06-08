import { useState, useEffect } from 'react'

interface FearGreedData {
  value: number
  classification: string
}

export function useFearGreed() {
  const [data, setData] = useState<FearGreedData | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.alternative.me/fng/?limit=1')
        if (cancelled) return
        const json = await res.json()
        if (cancelled) return
        const entry = json.data[0]
        setData({
          value: parseInt(entry.value, 10),
          classification: entry.value_classification,
        })
      } catch {
        if (!cancelled) setData(null)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 300_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return data
}
