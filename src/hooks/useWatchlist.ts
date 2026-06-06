import { useState, useCallback } from 'react'

const STORAGE_KEY = 'crypto-watchlist'

function loadWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveWatchlist(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(loadWatchlist)

  const toggle = useCallback((coinId: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId]
      saveWatchlist(next)
      return next
    })
  }, [])

  const isWatched = useCallback(
    (coinId: string) => watchlist.includes(coinId),
    [watchlist]
  )

  return { watchlist, toggle, isWatched }
}
