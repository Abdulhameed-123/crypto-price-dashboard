import { useState } from 'react'

interface PortfolioInputProps {
  coinId: string
  symbol: string
  currentPrice: number
  holding: number
  onSetHolding: (coinId: string, amount: number) => void
}

export function PortfolioInput({ coinId, symbol, currentPrice, holding, onSetHolding }: PortfolioInputProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(holding > 0 ? String(holding) : '')

  function handleSave() {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      onSetHolding(coinId, num)
    }
    setEditing(false)
  }

  function handleCancel() {
    setValue(holding > 0 ? String(holding) : '')
    setEditing(false)
  }

  function addAmount(amount: number) {
    const current = parseFloat(value) || 0
    const next = Math.max(0, current + amount)
    setValue(String(next))
  }

  const holdingValue = holding * currentPrice

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        {holding > 0 ? (
          <>
            <span className="text-sm text-crypto-text-muted">
              Holdings: <span className="text-white font-medium">{holding} {symbol}</span>
            </span>
            <span className="text-xs text-crypto-text-muted">
              (${holdingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </span>
          </>
        ) : (
          <span className="text-sm text-crypto-text-muted">No holdings</span>
        )}
        <button
          onClick={() => setEditing(true)}
          className="p-1 rounded text-crypto-text-muted hover:text-crypto-accent hover:bg-crypto-bg transition-colors"
          title="Edit holdings"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => addAmount(-1)}
          className="w-8 h-8 rounded-lg bg-crypto-bg border border-crypto-border text-white font-bold hover:border-crypto-accent transition-colors"
        >
          −
        </button>
        <div className="relative">
          <input
            type="number"
            step="any"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
            className="w-28 px-3 py-1.5 bg-crypto-bg border border-crypto-border rounded-lg text-white text-sm text-center focus:outline-none focus:border-crypto-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            autoFocus
            placeholder="0"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-crypto-text-muted pointer-events-none">
            {symbol}
          </span>
        </div>
        <button
          onClick={() => addAmount(1)}
          className="w-8 h-8 rounded-lg bg-crypto-bg border border-crypto-border text-white font-bold hover:border-crypto-accent transition-colors"
        >
          +
        </button>
        <button
          onClick={() => addAmount(0.1)}
          className="px-2 h-8 rounded-lg bg-crypto-bg border border-crypto-border text-xs text-crypto-text-muted hover:border-crypto-accent hover:text-white transition-colors"
        >
          +0.1
        </button>
      </div>
      <div className="flex items-center gap-2">
        {parseFloat(value) > 0 && (
          <span className="text-xs text-crypto-text-muted">
            Value: ${(parseFloat(value) * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
        <div className="flex gap-1.5 ml-auto">
          <button
            onClick={handleSave}
            className="px-2.5 py-1 text-xs font-medium text-white bg-crypto-accent rounded-lg hover:opacity-90 transition-opacity"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-2.5 py-1 text-xs font-medium text-crypto-text-muted bg-crypto-bg rounded-lg hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
