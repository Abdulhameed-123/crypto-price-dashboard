import { useState, useRef, useEffect, useMemo } from 'react'
import type { Coin } from '../types'

interface AssetDropdownProps {
  coins: Coin[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading: boolean
}

export function AssetDropdown({ coins, selectedId, onSelect, loading }: AssetDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => coins.find((c) => c.id === selectedId), [coins, selectedId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-crypto-surface border border-crypto-border rounded-xl hover:border-crypto-accent/50 transition-colors text-left"
        disabled={loading && coins.every((c) => c.current_price === 0)}
      >
        {loading && coins.every((c) => c.current_price === 0) ? (
          <span className="text-sm text-crypto-text-muted">Loading assets...</span>
        ) : selected ? (
          <>
            <img
              src={selected.image ?? `https://ui-avatars.com/api/?name=${selected.symbol}&background=6366f1&color=fff&size=32`}
              alt=""
              className="w-8 h-8 rounded-full bg-crypto-bg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selected.symbol}&background=6366f1&color=fff&size=32`
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white">{selected.symbol}</span>
                {selected.market_cap_rank && (
                  <span className="text-xs text-crypto-text-muted bg-crypto-bg px-1.5 py-0.5 rounded">
                    #{selected.market_cap_rank}
                  </span>
                )}
              </div>
              <p className="text-xs text-crypto-text-muted truncate">{selected.name}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-white">
                ${selected.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-xs font-medium ${selected.price_change_percentage_24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {selected.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(selected.price_change_percentage_24h).toFixed(2)}%
              </p>
            </div>
            <svg className={`w-4 h-4 text-crypto-text-muted transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        ) : (
          <span className="text-sm text-crypto-text-muted">Select an asset</span>
        )}
      </button>

      {open && (
        <div className="absolute z-40 mt-1.5 w-full bg-crypto-surface border border-crypto-border rounded-xl shadow-2xl overflow-hidden max-h-[360px] overflow-y-auto">
          {coins.map((coin) => {
            const isUp = coin.price_change_percentage_24h >= 0
            return (
              <button
                key={coin.id}
                onClick={() => {
                  onSelect(coin.id)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-crypto-surface-hover ${
                  coin.id === selectedId ? 'bg-crypto-accent/10 border-l-2 border-crypto-accent' : ''
                }`}
              >
                <img
                  src={coin.image ?? `https://ui-avatars.com/api/?name=${coin.symbol}&background=6366f1&color=fff&size=28`}
                  alt=""
                  className="w-7 h-7 rounded-full bg-crypto-bg shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=6366f1&color=fff&size=28`
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">{coin.symbol}</span>
                    <span className="text-xs text-crypto-text-muted truncate">{coin.name}</span>
                  </div>
                  <p className="text-[11px] text-crypto-text-muted">
                    MCap ${(coin.market_cap / 1e9).toFixed(2)}B · Vol ${(coin.total_volume / 1e9).toFixed(2)}B
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">
                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-xs font-medium ${isUp ? 'text-crypto-green' : 'text-crypto-red'}`}>
                    {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
