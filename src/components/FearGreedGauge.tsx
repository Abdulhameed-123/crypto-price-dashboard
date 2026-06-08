import { useFearGreed } from '../hooks/useFearGreed'

function getColor(value: number): string {
  if (value <= 25) return '#ef4444'
  if (value <= 45) return '#f97316'
  if (value <= 55) return '#eab308'
  if (value <= 75) return '#84cc16'
  return '#22c55e'
}

export function FearGreedGauge() {
  const data = useFearGreed()

  if (!data) return null

  const pct = data.value
  const color = getColor(pct)

  return (
    <div className="bg-crypto-surface border border-crypto-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-crypto-text-muted uppercase tracking-wider">
          Fear &amp; Greed
        </span>
        <span className="text-lg font-bold text-white">{data.value}</span>
      </div>

      <div className="relative h-6 mb-2">
        <div className="absolute inset-0 rounded-full overflow-hidden" style={{
          background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)',
        }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
          style={{ left: `${pct}%` }}
        >
          <div className="w-4 h-4 rounded-full bg-white border-2 border-crypto-bg shadow-md" />
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-crypto-text-muted mb-2">
        <span>Fear</span>
        <span>Neutral</span>
        <span>Greed</span>
      </div>

      <div className="text-center">
        <span
          className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          {data.classification}
        </span>
      </div>
    </div>
  )
}
