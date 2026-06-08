interface HeaderProps {
  alertCount: number
  lastUpdated: string | null
  isLoading: boolean
  isStale: boolean
  onRefresh: () => void
  portfolioValue: number
  portfolioPnl: number
  portfolioPnlPercent: number
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function Header({
  alertCount, lastUpdated, isLoading, isStale, onRefresh,
  portfolioValue, portfolioPnl, portfolioPnlPercent,
  onToggleSidebar, sidebarOpen,
}: HeaderProps) {
  const isPnlUp = portfolioPnl >= 0

  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-crypto-border">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-crypto-surface transition-colors"
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg className="w-5 h-5 text-crypto-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-crypto-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M9 9h6M9 15h6" strokeLinecap="round" />
        </svg>
        <h1 className="text-base sm:text-xl font-bold text-white truncate">Crypto Dashboard</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-crypto-text-muted">
        {portfolioValue > 0 && (
          <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-crypto-surface rounded-lg">
            <span className="text-xs text-crypto-text-muted">Portfolio</span>
            <span className="text-sm font-semibold text-white">{formatCompact(portfolioValue)}</span>
            <span className={`text-xs font-medium ${isPnlUp ? 'text-crypto-green' : 'text-crypto-red'}`}>
              {isPnlUp ? '▲' : '▼'} {isPnlUp ? '+' : ''}{portfolioPnlPercent.toFixed(2)}%
            </span>
          </span>
        )}

        <span className="hidden sm:flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isStale ? 'bg-crypto-gold' : 'bg-crypto-green'}`} />
          {isLoading ? (
            'Loading...'
          ) : lastUpdated ? (
            <span>{isStale ? 'Stale — ' : ''}{lastUpdated}</span>
          ) : null}
        </span>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-crypto-surface transition-colors disabled:opacity-40"
          title="Refresh now"
        >
          <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {alertCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium text-crypto-gold bg-crypto-surface rounded-full">
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 8h2v2h-2zm0-6h2v4h-2z" />
            </svg>
            <span className="hidden sm:inline">{alertCount} alert{alertCount !== 1 ? 's' : ''}</span>
            <span className="sm:hidden">{alertCount}</span>
          </span>
        )}
      </div>
    </header>
  )
}
