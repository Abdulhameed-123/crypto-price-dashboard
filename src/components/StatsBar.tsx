interface StatsBarProps {
  totalMarketCap: number | null
  totalVolume: number | null
  btcDominance: number | null
  marketCapChange24h: number | null
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  return `$${n.toLocaleString()}`
}

export function StatsBar({ totalMarketCap, totalVolume, btcDominance, marketCapChange24h }: StatsBarProps) {
  const isUp = marketCapChange24h != null && marketCapChange24h >= 0

  return (
    <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-2.5 bg-crypto-surface/50 border-b border-crypto-border overflow-x-auto text-xs text-crypto-text-muted scrollbar-none">
      {totalMarketCap != null && (
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="text-crypto-text-muted">Market Cap</span>
          <span className="font-semibold text-white">{formatCompact(totalMarketCap)}</span>
          {marketCapChange24h != null && (
            <span className={`font-medium ${isUp ? 'text-crypto-green' : 'text-crypto-red'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(marketCapChange24h).toFixed(2)}%
            </span>
          )}
        </span>
      )}

      {totalVolume != null && (
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="text-crypto-text-muted">24h Volume</span>
          <span className="font-semibold text-white">{formatCompact(totalVolume)}</span>
        </span>
      )}

      {btcDominance != null && (
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="text-crypto-text-muted">BTC Dominance</span>
          <span className="font-semibold text-white">{btcDominance.toFixed(1)}%</span>
        </span>
      )}

      <span className="flex items-center gap-1.5 shrink-0 ml-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-crypto-green animate-pulse" />
        <span className="text-crypto-text-muted">Live</span>
      </span>
    </div>
  )
}
