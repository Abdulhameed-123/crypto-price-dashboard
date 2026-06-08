import { useMemo } from 'react'
import type { Coin } from '../types'

interface GainersLosersProps {
  coins: Coin[]
  loading: boolean
  onSelect: (id: string) => void
}

export function GainersLosers({ coins, loading, onSelect }: GainersLosersProps) {
  const { gainer, loser } = useMemo(() => {
    const withChange = coins.filter((c) => c.current_price > 0 && c.price_change_percentage_24h !== 0)
    if (withChange.length < 2) return { gainer: null, loser: null }
    const sorted = [...withChange].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    return { gainer: sorted[0], loser: sorted[sorted.length - 1] }
  }, [coins])

  if (loading && coins.every((c) => c.current_price === 0)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-crypto-surface border border-crypto-border rounded-xl p-4 animate-pulse">
            <div className="h-3 w-20 bg-crypto-border rounded mb-3" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-crypto-border" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-16 bg-crypto-border rounded" />
                <div className="h-4 w-12 bg-crypto-border rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!gainer || !loser) return null

  const Card = ({ coin, type }: { coin: Coin; type: 'gainer' | 'loser' }) => {
    const isUp = type === 'gainer'
    return (
      <button
        onClick={() => onSelect(coin.id)}
        className="flex items-center gap-3 bg-crypto-surface border border-crypto-border rounded-xl p-4 text-left transition-all hover:border-crypto-accent/50 hover:bg-crypto-surface-hover"
      >
        <img
          src={coin.image ?? `https://ui-avatars.com/api/?name=${coin.symbol}&background=6366f1&color=fff&size=32`}
          alt=""
          className="w-8 h-8 rounded-full bg-crypto-bg shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=6366f1&color=fff&size=32`
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{coin.symbol}</p>
          <p className="text-xs text-crypto-text-muted truncate">{coin.name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold ${isUp ? 'text-crypto-green' : 'text-crypto-red'}`}>
            {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
          </p>
          <p className="text-xs text-crypto-text-muted">
            ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </button>
    )
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-crypto-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs font-semibold text-crypto-text-muted uppercase tracking-wider">Top Gainers &amp; Losers</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card coin={gainer} type="gainer" />
        <Card coin={loser} type="loser" />
      </div>
    </div>
  )
}
