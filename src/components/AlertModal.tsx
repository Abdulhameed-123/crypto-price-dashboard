import { useState } from 'react'
import type { Coin } from '../types'

interface AlertModalProps {
  coin: Coin
  onClose: () => void
  onSubmit: (coinId: string, targetPrice: number, direction: 'above' | 'below') => void
}

export function AlertModal({ coin, onClose, onSubmit }: AlertModalProps) {
  const [price, setPrice] = useState(String(Math.round(coin.current_price)))
  const [direction, setDirection] = useState<'above' | 'below'>('above')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseFloat(price)
    if (isNaN(target) || target <= 0) return
    onSubmit(coin.id, target, direction)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-crypto-surface border border-crypto-border rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-1">
          Price Alert — {coin.symbol}
        </h3>
        <p className="text-xs text-crypto-text-muted mb-4">
          Current price: ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-crypto-text-muted mb-1.5">Direction</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDirection('above')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  direction === 'above'
                    ? 'border-crypto-green text-crypto-green bg-crypto-green/10'
                    : 'border-crypto-border text-crypto-text-muted hover:border-crypto-green/30'
                }`}
              >
                Above ↑
              </button>
              <button
                type="button"
                onClick={() => setDirection('below')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  direction === 'below'
                    ? 'border-crypto-red text-crypto-red bg-crypto-red/10'
                    : 'border-crypto-border text-crypto-text-muted hover:border-crypto-red/30'
                }`}
              >
                Below ↓
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-crypto-text-muted mb-1.5">Target Price (USD)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 bg-crypto-bg border border-crypto-border rounded-lg text-white text-sm focus:outline-none focus:border-crypto-accent transition-colors"
              placeholder="Enter target price"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-crypto-text-muted bg-crypto-bg rounded-lg hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-medium text-white bg-crypto-accent rounded-lg hover:opacity-90 transition-opacity"
            >
              Set Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
