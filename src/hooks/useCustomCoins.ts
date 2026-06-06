import { useState, useCallback } from 'react'
import type { CoinMeta } from '../types'

const STORAGE_KEY = 'crypto-custom-coins'

function load(): CoinMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(coins: CoinMeta[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coins))
}

export function useCustomCoins() {
  const [customCoins, setCustomCoins] = useState<CoinMeta[]>(load)

  const add = useCallback((meta: CoinMeta) => {
    setCustomCoins((prev) => {
      if (prev.some((c) => c.id === meta.id)) return prev
      const next = [...prev, meta]
      save(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setCustomCoins((prev) => {
      const next = prev.filter((c) => c.id !== id)
      save(next)
      return next
    })
  }, [])

  const isCustom = useCallback(
    (id: string) => customCoins.some((c) => c.id === id),
    [customCoins]
  )

  return { customCoins, add, remove, isCustom }
}
