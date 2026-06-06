import { memo } from 'react'
import type { Coin } from '../types'
import { PriceCard } from './PriceCard'

interface CoinGridProps {
  coins: Coin[]
  loading: boolean
  watchlist: string[]
  isCustomMap: Record<string, boolean>
  onToggleWatch: (id: string) => void
  onSelect: (id: string) => void
  onSetAlert: (id: string) => void
  onRemove: (id: string) => void
  alertCounts: Record<string, number>
  selectedId: string | null
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-crypto-border bg-crypto-surface animate-pulse">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-crypto-border" />
        <div className="space-y-1.5">
          <div className="w-12 h-3 rounded bg-crypto-border" />
          <div className="w-16 h-2.5 rounded bg-crypto-border/60" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-24 h-6 rounded bg-crypto-border" />
        <div className="w-16 h-3 rounded bg-crypto-border/60" />
      </div>
    </div>
  )
}

function CoinGridInner({
  coins,
  loading,
  watchlist,
  isCustomMap,
  onToggleWatch,
  onSelect,
  onSetAlert,
  onRemove,
  alertCounts,
  selectedId,
}: CoinGridProps) {
  if (loading && coins.every((c) => c.current_price === 0)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!loading && coins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-crypto-text-muted text-sm gap-2">
        <svg className="w-10 h-10 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" strokeLinecap="round" />
        </svg>
        <p>No coins loaded. Search above to add tokens.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {coins.map((coin) => (
        <PriceCard
          key={coin.id}
          coin={coin}
          isWatched={watchlist.includes(coin.id)}
          isCustom={isCustomMap[coin.id] ?? false}
          onToggleWatch={onToggleWatch}
          onSelect={onSelect}
          onSetAlert={onSetAlert}
          onRemove={onRemove}
          alertCount={alertCounts[coin.id] ?? 0}
          selected={selectedId === coin.id}
        />
      ))}
    </div>
  )
}

export const CoinGrid = memo(CoinGridInner)
