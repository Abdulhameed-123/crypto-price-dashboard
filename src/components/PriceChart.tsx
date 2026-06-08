import { memo, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush,
  ReferenceLine,
} from 'recharts'
import type { TimeRange, ChartType, OhlcData } from '../types'
import { TIME_RANGES } from '../constants/coins'

interface PriceChartProps {
  data: { time: number; price: number }[]
  candleData: OhlcData[]
  loading: boolean
  error: string | null
  days: TimeRange
  chartType: ChartType
  onDaysChange: (days: TimeRange) => void
  onChartTypeChange: (type: ChartType) => void
  symbol: string
  onRetry: () => void
}

function formatTime(time: number, days: TimeRange): string {
  const d = new Date(time)
  switch (days) {
    case '0.01042':
    case '0.02083':
    case '0.04167':
    case '0.16667':
    case '1':
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    case 'max':
      return d.toLocaleDateString([], { year: 'numeric', month: 'short' })
  }
}

function formatFullTime(time: number): string {
  const d = new Date(time)
  const now = new Date()
  const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays < 1) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays < 365) {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const CustomCursor = (props: any) => {
  const { points, height } = props
  if (!points?.length) return null
  return (
    <line
      x1={points[0].x}
      y1={0}
      x2={points[0].x}
      y2={height}
      stroke="#6366f1"
      strokeWidth={1}
      strokeDasharray="4 4"
    />
  )
}

const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const price = payload[0].value
  return (
    <div className="bg-crypto-surface border border-crypto-border rounded-lg px-3 py-2.5 shadow-xl animate-fade-in-up">
      <p className="text-xs text-crypto-text-muted mb-1.5">{formatFullTime(label)}</p>
      <p className="text-base font-bold text-white">
        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}

const CandleTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  const isUp = d.close >= d.open
  return (
    <div className="bg-crypto-surface border border-crypto-border rounded-lg px-3 py-2.5 shadow-xl animate-fade-in-up min-w-[130px]">
      <p className="text-xs text-crypto-text-muted mb-1.5">{formatFullTime(d.time)}</p>
      <div className="space-y-1 text-xs">
        <p className="flex justify-between gap-3">
          <span className="text-crypto-text-muted">O</span>
          <span className="text-white font-medium">${d.open.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="flex justify-between gap-3">
          <span className="text-crypto-text-muted">H</span>
          <span className="text-crypto-green font-medium">${d.high.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="flex justify-between gap-3">
          <span className="text-crypto-text-muted">L</span>
          <span className="text-crypto-red font-medium">${d.low.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="flex justify-between gap-3 border-t border-crypto-border pt-1">
          <span className="text-crypto-text-muted">C</span>
          <span className={`font-medium ${isUp ? 'text-crypto-green' : 'text-crypto-red'}`}>
            ${d.close.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </p>
        <p className={`text-[11px] ${isUp ? 'text-crypto-green' : 'text-crypto-red'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(((d.close - d.open) / d.open) * 100).toFixed(2)}%
        </p>
      </div>
    </div>
  )
}

function CandleShape(props: any) {
  const { x, y, width, height, payload, yMin } = props
  if (!payload) return null
  const { open, high, low, close } = payload
  if (close === yMin) return null
  const isUp = close >= open
  const color = isUp ? '#22c55e' : '#ef4444'

  const pixelScale = height / (close - yMin)
  const centerX = x + width / 2
  const candleWidth = Math.max(3, width * 0.7)
  const bodyX = centerX - candleWidth / 2

  const wickTopY = y - (high - close) * pixelScale
  const wickBottomY = y + (close - low) * pixelScale

  const bodyTop = Math.max(open, close)
  const bodyBottom = Math.min(open, close)
  const bodyY = y - (bodyTop - close) * pixelScale
  const bodyH = Math.max(1, (bodyTop - bodyBottom) * pixelScale)

  return (
    <g>
      <line
        x1={centerX}
        y1={wickTopY}
        x2={centerX}
        y2={wickBottomY}
        stroke={color}
        strokeWidth={1.5}
      />
      <rect
        x={bodyX}
        y={bodyY}
        width={candleWidth}
        height={bodyH}
        fill={color}
        rx={1}
      />
    </g>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-[350px] text-crypto-text-muted text-sm animate-pulse">
      <span className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-crypto-accent animate-ping" />
        Loading chart...
      </span>
    </div>
  )
}

function ChartEmpty({ symbol }: { symbol: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[350px] text-crypto-text-muted text-sm gap-2">
      <svg className="w-8 h-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18M7 16l4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {symbol ? <p>Chart data unavailable for {symbol}</p> : <p>Select a coin to view chart</p>}
    </div>
  )
}

function PriceChartInner({ data, candleData, loading, error, days, chartType, onDaysChange, onChartTypeChange, symbol, onRetry }: PriceChartProps) {
  const isLine = chartType === 'line'
  const chartData = isLine ? data : candleData

  const isUp = isLine
    ? data.length >= 2 && data[data.length - 1].price >= data[0].price
    : candleData.length >= 2 && candleData[candleData.length - 1].close >= candleData[0].open

  const color = isUp ? '#22c55e' : '#ef4444'

  const stats = useMemo(() => {
    if (isLine) {
      if (data.length === 0) return null
      const prices = data.map((d) => d.price)
      const high = Math.max(...prices)
      const low = Math.min(...prices)
      const open = prices[0]
      const close = prices[prices.length - 1]
      const change = close - open
      const changePercent = open > 0 ? (change / open) * 100 : 0
      return { high, low, open, close, change, changePercent }
    }
    if (candleData.length === 0) return null
    const open = candleData[0].open
    const close = candleData[candleData.length - 1].close
    const high = Math.max(...candleData.map((d) => d.high))
    const low = Math.min(...candleData.map((d) => d.low))
    const change = close - open
    const changePercent = open > 0 ? (change / open) * 100 : 0
    return { high, low, open, close, change, changePercent }
  }, [data, candleData, isLine])

  const candleDomain = useMemo(() => {
    if (candleData.length === 0) return [0, 0]
    const allPrices = candleData.flatMap((d) => [d.high, d.low, d.open, d.close])
    const min = Math.min(...allPrices)
    const max = Math.max(...allPrices)
    const pad = (max - min) * 0.05 || min * 0.05 || 50
    return [min - pad, max + pad]
  }, [candleData])

  return (
    <div className="bg-crypto-surface border border-crypto-border rounded-xl p-4 sm:p-5">
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{symbol} / USD</h3>
          <div className="flex bg-crypto-bg rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => onChartTypeChange('line')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                chartType === 'line'
                  ? 'bg-crypto-accent text-white'
                  : 'text-crypto-text-muted hover:text-white'
              }`}
              title="Line chart"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18M7 16l4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => onChartTypeChange('candle')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                chartType === 'candle'
                  ? 'bg-crypto-accent text-white'
                  : 'text-crypto-text-muted hover:text-white'
              }`}
              title="Candlestick chart"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="6" width="3" height="12" rx="0.5" />
                <rect x="10" y="3" width="3" height="18" rx="0.5" />
                <rect x="16" y="8" width="3" height="8" rx="0.5" />
              </svg>
            </button>
          </div>
        </div>
        {stats && (
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-crypto-text-muted flex-wrap">
            <span>
              O <span className="text-white font-medium">${stats.open.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </span>
            <span>
              H <span className="text-crypto-green font-medium">${stats.high.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </span>
            <span>
              L <span className="text-crypto-red font-medium">${stats.low.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </span>
            <span className={stats.change >= 0 ? 'text-crypto-green' : 'text-crypto-red'}>
              {stats.change >= 0 ? '▲' : '▼'} {Math.abs(stats.changePercent).toFixed(2)}%
            </span>
          </div>
        )}
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr.value}
              onClick={() => onDaysChange(tr.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                days === tr.value
                  ? 'bg-crypto-accent text-white shadow-sm'
                  : 'bg-crypto-bg text-crypto-text-muted hover:text-white hover:bg-crypto-border'
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-[350px] text-crypto-red text-sm gap-3">
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
      ) : chartData.length === 0 ? (
        <ChartEmpty symbol={symbol} />
      ) : isLine ? (
        <>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
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
                minTickGap={50}
              />
              <YAxis
                domain={['dataMin - 50', 'dataMax + 50']}
                tickFormatter={(v) => '$' + v.toLocaleString()}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={75}
              />
              <Tooltip content={<LineTooltip />} cursor={<CustomCursor />} />
              <ReferenceLine
                y={data[data.length - 1]?.price}
                stroke={color}
                strokeDasharray="6 3"
                strokeWidth={1}
                strokeOpacity={0.5}
                label={{
                  value: `$${data[data.length - 1]?.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  fill: color,
                  fontSize: 11,
                  position: 'right',
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${symbol})`}
                animationBegin={0}
                animationDuration={600}
                activeDot={{ r: 4, strokeWidth: 0, fill: color }}
              />
              <Brush
                dataKey="time"
                height={30}
                stroke="#2a2e42"
                fill="#1a1d2e"
                travellerWidth={8}
                gap={5}
                tickFormatter={(t: number) => formatTime(t, days)}
                style={{ fontSize: 10, color: '#94a3b8' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-3 text-[11px] text-crypto-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-[1px] bg-crypto-accent inline-block" />
              Hover to crosshair · Drag to zoom
            </span>
            <span>{data.length.toLocaleString()} data points</span>
          </div>
        </>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={candleData}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e42" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(t) => formatTime(t, days)}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={50}
              />
              <YAxis
                domain={[candleDomain[0], candleDomain[1]]}
                tickFormatter={(v) => '$' + v.toLocaleString()}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={75}
              />
              <Tooltip content={<CandleTooltip />} cursor={<CustomCursor />} />
              <ReferenceLine
                y={candleData[candleData.length - 1]?.close}
                stroke={color}
                strokeDasharray="6 3"
                strokeWidth={1}
                strokeOpacity={0.5}
                label={{
                  value: `$${candleData[candleData.length - 1]?.close.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  fill: color,
                  fontSize: 11,
                  position: 'right',
                }}
              />
              <Bar
                dataKey="close"
                shape={<CandleShape yMin={candleDomain[0]} />}
                isAnimationActive={false}
              />
              <Brush
                dataKey="time"
                height={30}
                stroke="#2a2e42"
                fill="#1a1d2e"
                travellerWidth={8}
                gap={5}
                tickFormatter={(t: number) => formatTime(t, days)}
                style={{ fontSize: 10, color: '#94a3b8' }}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-3 text-[11px] text-crypto-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-crypto-green inline-block rounded-sm" />
              <span className="w-1.5 h-1.5 bg-crypto-red inline-block rounded-sm ml-1" />
              <span className="ml-1">Hover to crosshair · Drag to zoom</span>
            </span>
            <span>{candleData.length.toLocaleString()} candles</span>
          </div>
        </>
      )}
    </div>
  )
}

export const PriceChart = memo(PriceChartInner)
