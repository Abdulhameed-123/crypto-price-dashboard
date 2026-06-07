import { useState, useCallback, useMemo } from 'react'
import type { Coin, Allocation } from '../types'

const STORAGE_KEY = 'crypto-portfolio'
const PIE_COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
  '#06b6d4', '#a855f7', '#ec4899', '#14b8a6',
  '#f97316', '#8b5cf6',
]

function load(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(holdings: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings))
}

export function usePortfolio(coins: Coin[]) {
  const [holdings, setHoldings] = useState<Record<string, number>>(load)

  const setHolding = useCallback((coinId: string, amount: number) => {
    setHoldings((prev) => {
      const next = { ...prev }
      if (amount > 0) next[coinId] = amount
      else delete next[coinId]
      save(next)
      return next
    })
  }, [])

  const getHolding = useCallback(
    (coinId: string) => holdings[coinId] ?? 0,
    [holdings]
  )

  const hasHoldings = Object.keys(holdings).length > 0

  const totalValue = useMemo(() => {
    return Object.entries(holdings).reduce((sum, [id, amount]) => {
      const coin = coins.find((c) => c.id === id)
      return sum + (coin ? coin.current_price * amount : 0)
    }, 0)
  }, [holdings, coins])

  const pnl24h = useMemo(() => {
    return Object.entries(holdings).reduce((sum, [id, amount]) => {
      const coin = coins.find((c) => c.id === id)
      if (!coin) return sum
      const change24h = coin.current_price - coin.current_price / (1 + coin.price_change_percentage_24h / 100)
      return sum + change24h * amount
    }, 0)
  }, [holdings, coins])

  const pnlPercent = totalValue > 0 ? (pnl24h / (totalValue - pnl24h)) * 100 : 0

  const allocations = useMemo((): Allocation[] => {
    const entries = Object.entries(holdings)
      .map(([id, amount]) => {
        const coin = coins.find((c) => c.id === id)
        if (!coin) return null
        return {
          coinId: id,
          symbol: coin.symbol,
          value: coin.current_price * amount,
        }
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .sort((a, b) => b.value - a.value)

    const total = entries.reduce((s, e) => s + e.value, 0)
    if (total === 0) return []

    let colorIdx = 0
    return entries.map((e) => ({
      ...e,
      pct: (e.value / total) * 100,
      color: PIE_COLORS[colorIdx++ % PIE_COLORS.length],
    }))
  }, [holdings, coins])

  return { holdings, setHolding, getHolding, hasHoldings, totalValue, pnl24h, pnlPercent, allocations }
}
