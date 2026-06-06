interface HeaderProps {
  alertCount: number
  lastUpdated: string | null
  isLoading: boolean
  isStale: boolean
  onRefresh: () => void
}

export function Header({ alertCount, lastUpdated, isLoading, isStale, onRefresh }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-crypto-border">
      <div className="flex items-center gap-3">
        <svg className="w-8 h-8 text-crypto-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M9 9h6M9 15h6" strokeLinecap="round" />
        </svg>
        <h1 className="text-xl font-bold text-white">Crypto Dashboard</h1>
      </div>

      <div className="flex items-center gap-4 text-sm text-crypto-text-muted">
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-crypto-accent animate-pulse" />
            Loading...
          </span>
        ) : lastUpdated ? (
          <span className={`flex items-center gap-1.5 ${isStale ? 'text-crypto-gold' : ''}`}>
            <span className={`w-2 h-2 rounded-full ${isStale ? 'bg-crypto-gold' : 'bg-crypto-green'}`} />
            {isStale ? 'Stale data — ' : ''}Updated {lastUpdated}
          </span>
        ) : null}

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-lg hover:bg-crypto-surface transition-colors disabled:opacity-40"
          title="Refresh now"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {alertCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-crypto-gold bg-crypto-surface rounded-full">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 8h2v2h-2zm0-6h2v4h-2z" />
            </svg>
            {alertCount} alert{alertCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </header>
  )
}
