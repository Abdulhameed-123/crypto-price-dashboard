import { memo } from 'react'
import type { Coin } from '../types'

interface PriceCardProps {
  coin: Coin
  isWatched: boolean
  isCustom: boolean
  onToggleWatch: (id: string) => void
  onSelect: (id: string) => void
  onSetAlert: (id: string) => void
  onRemove: (id: string) => void
  alertCount: number
  selected: boolean
}

function PriceCardInner({ coin, isWatched, isCustom, onToggleWatch, onSelect, onSetAlert, onRemove, alertCount, selected }: PriceCardProps) {
  const change = coin.price_change_percentage_24h
  const isUp = change >= 0
  const range = coin.high_24h - coin.low_24h
  const position = range > 0 ? ((coin.current_price - coin.low_24h) / range) * 100 : 50

  return (
    <div
      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-crypto-accent bg-crypto-surface-hover shadow-lg shadow-crypto-accent/10'
          : 'border-crypto-border bg-crypto-surface hover:border-crypto-accent/50 hover:bg-crypto-surface-hover'
      }`}
      onClick={() => onSelect(coin.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <img
            src={coin.image ?? `https://ui-avatars.com/api/?name=${coin.symbol}&background=6366f1&color=fff&size=32`}
            alt={coin.name}
            className="w-8 h-8 rounded-full bg-crypto-bg"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=6366f1&color=fff&size=32`
            }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{coin.symbol}</p>
            <p className="text-xs text-crypto-text-muted truncate">{coin.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {coin.market_cap_rank && (
            <span className="text-xs text-crypto-text-muted bg-crypto-bg px-1.5 py-0.5 rounded">
              #{coin.market_cap_rank}
            </span>
          )}
          {isCustom && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(coin.id)
              }}
              className="p-1 rounded text-crypto-text-muted hover:text-crypto-red transition-colors"
              title="Remove from dashboard"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleWatch(coin.id)
            }}
            className={`p-1 rounded transition-colors ${
              isWatched ? 'text-crypto-gold' : 'text-crypto-text-muted hover:text-crypto-gold/60'
            }`}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isWatched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-medium mt-0.5 ${isUp ? 'text-crypto-green' : 'text-crypto-red'}`}>
            <span className="inline-block mr-0.5">{isUp ? '▲' : '▼'}</span>
            {Math.abs(change).toFixed(2)}%
          </p>
        </div>
        <div className="text-right text-xs text-crypto-text-muted">
          <p>MCap ${(coin.market_cap / 1e9).toFixed(2)}B</p>
          <p className="mt-0.5">Vol ${(coin.total_volume / 1e9).toFixed(2)}B</p>
        </div>
      </div>

      {range > 0 && (
        <div className="mt-3">
          <div className="relative h-1.5 bg-crypto-bg rounded-full overflow-hidden">
            <div
              className={`absolute top-0 h-full rounded-full transition-all duration-300 ${
                isUp ? 'bg-crypto-green' : 'bg-crypto-red'
              }`}
              style={{ width: `${position}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-white rounded-full shadow"
              style={{ left: `calc(${position}% - 3px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-crypto-text-muted mt-1">
            <span>L ${coin.low_24h.toLocaleString()}</span>
            <span>H ${coin.high_24h.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation()
          onSetAlert(coin.id)
        }}
        className={`absolute top-2 right-10 p-1 rounded transition-colors ${
          alertCount > 0
            ? 'text-crypto-gold'
            : 'text-crypto-text-muted hover:text-crypto-accent'
        }`}
        title={alertCount > 0 ? `${alertCount} alert(s) set` : 'Set price alert'}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={alertCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      </button>
    </div>
  )
}

export const PriceCard = memo(PriceCardInner)
