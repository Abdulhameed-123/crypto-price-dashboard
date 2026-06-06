import { memo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { TimeRange } from '../types'

interface PriceChartProps {
  data: { time: number; price: number }[]
  loading: boolean
  error: string | null
  days: TimeRange
  onDaysChange: (days: TimeRange) => void
  symbol: string
  onRetry: () => void
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1', label: '24H' },
  { value: '7', label: '7D' },
  { value: '30', label: '1M' },
  { value: '365', label: '1Y' },
]

function formatTime(time: number, days: TimeRange): string {
  const d = new Date(time)
  switch (days) {
    case '1':
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    case '7':
      return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit' })
    case '30':
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    case '365':
      return d.toLocaleDateString([], { month: 'short', year: '2-digit' })
  }
}

function PriceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-crypto-surface border border-crypto-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-crypto-text-muted mb-1">
        {new Date(label).toLocaleString()}
      </p>
      <p className="text-sm font-semibold text-white">
        ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-[300px] text-crypto-text-muted text-sm animate-pulse">
      <span className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-crypto-accent animate-ping" />
        Loading chart...
      </span>
    </div>
  )
}

function ChartEmpty({ symbol }: { symbol: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-crypto-text-muted text-sm gap-2">
      <svg className="w-8 h-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18M7 16l4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {symbol ? <p>Chart data unavailable for {symbol}</p> : <p>Select a coin to view chart</p>}
    </div>
  )
}

function PriceChartInner({ data, loading, error, days, onDaysChange, symbol, onRetry }: PriceChartProps) {
  const isUp = data.length >= 2 && data[data.length - 1].price >= data[0].price
  const color = isUp ? '#22c55e' : '#ef4444'

  return (
    <div className="bg-crypto-surface border border-crypto-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">
          {symbol} / USD Chart
        </h3>
        <div className="flex gap-1">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr.value}
              onClick={() => onDaysChange(tr.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                days === tr.value
                  ? 'bg-crypto-accent text-white'
                  : 'bg-crypto-bg text-crypto-text-muted hover:text-white hover:bg-crypto-border'
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-crypto-red text-sm gap-3">
          <p>{error}</p>
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-xs font-medium bg-crypto-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <ChartSkeleton />
      ) : data.length === 0 ? (
        <ChartEmpty symbol={symbol} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e42" vertical={false} />
            <XAxis
              dataKey="time"
              tickFormatter={(t) => formatTime(t, days)}
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={40}
            />
            <YAxis
              domain={['dataMin - 100', 'dataMax + 100']}
              tickFormatter={(v) => '$' + v.toLocaleString()}
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<PriceTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export const PriceChart = memo(PriceChartInner)
