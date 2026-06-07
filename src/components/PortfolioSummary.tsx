import { memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { Allocation } from '../types'

interface PortfolioSummaryProps {
  totalValue: number
  pnl24h: number
  pnlPercent: number
  allocations: Allocation[]
  hasHoldings: boolean
}

function PortfolioSummaryInner({ totalValue, pnl24h, pnlPercent, allocations, hasHoldings }: PortfolioSummaryProps) {
  if (!hasHoldings) return null

  const isPnlUp = pnl24h >= 0

  return (
    <div className="bg-crypto-surface border border-crypto-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-crypto-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
        </svg>
        <h2 className="text-sm font-semibold text-white">Portfolio</h2>
      </div>

      <p className="text-2xl font-bold text-white">
        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className={`text-sm font-medium mt-0.5 ${isPnlUp ? 'text-crypto-green' : 'text-crypto-red'}`}>
        {isPnlUp ? '▲' : '▼'} ${Math.abs(pnl24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        <span className="ml-1">({isPnlUp ? '+' : ''}{pnlPercent.toFixed(2)}%)</span>
        <span className="text-xs text-crypto-text-muted ml-1.5">24h</span>
      </p>

      {allocations.length > 0 && (
        <div className="mt-4">
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocations}
                  dataKey="value"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={48}
                  stroke="none"
                >
                  {allocations.map((a) => (
                    <Cell key={a.coinId} fill={a.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-3">
            {allocations.map((a) => (
              <div key={a.coinId}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                    <span className="text-white font-medium">{a.symbol}</span>
                  </div>
                  <span className="text-crypto-text-muted">
                    ${a.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="ml-1">({a.pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-crypto-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${a.pct}%`, backgroundColor: a.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const PortfolioSummary = memo(PortfolioSummaryInner)
