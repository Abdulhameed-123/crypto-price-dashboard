import { memo } from 'react'
import type { Coin } from '../types'

interface WatchlistPanelProps {
  coins: Coin[]
  watchlist: string[]
  onRemove: (id: string) => void
  onSelect: (id: string) => void
}

function WatchlistPanelInner({ coins, watchlist, onRemove, onSelect }: WatchlistPanelProps) {
  const watchedCoins = coins.filter((c) => watchlist.includes(c.id))

  if (watchedCoins.length === 0) return null

  return (
    <div className="bg-crypto-surface border border-crypto-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-crypto-gold" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <h2 className="text-sm font-semibold text-white">Watchlist</h2>
        <span className="text-xs text-crypto-text-muted ml-auto">{watchedCoins.length} coin{watchedCoins.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
        {watchedCoins.map((coin) => (
          <div
            key={coin.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-crypto-bg cursor-pointer hover:bg-crypto-surface-hover transition-colors group"
            onClick={() => onSelect(coin.id)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-white">{coin.symbol}</span>
              <span className="text-xs text-crypto-text-muted">
                ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-medium shrink-0 ${coin.price_change_percentage_24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(coin.id)
              }}
              className="text-crypto-text-muted opacity-0 group-hover:opacity-100 hover:text-crypto-red transition-all"
              title="Remove from watchlist"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export const WatchlistPanel = memo(WatchlistPanelInner)
