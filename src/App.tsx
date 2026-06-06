import { useState, useCallback, useMemo, useEffect } from 'react'
import { Header } from './components/Header'
import { CoinGrid } from './components/CoinGrid'
import { PriceChart } from './components/PriceChart'
import { WatchlistPanel } from './components/WatchlistPanel'
import { AlertModal } from './components/AlertModal'
import { AlertBadge } from './components/AlertBadge'
import { SearchBar } from './components/SearchBar'
import { usePrices } from './hooks/usePrices'
import { useChartData } from './hooks/useChartData'
import { useWatchlist } from './hooks/useWatchlist'
import { useAlerts } from './hooks/useAlerts'
import { useCustomCoins } from './hooks/useCustomCoins'
import { TRACKED_COINS } from './constants/coins'
import type { TimeRange } from './types'

function App() {
  const { customCoins, add: addCustom, remove: removeCustom, isCustom } = useCustomCoins()

  const coinMetas = useMemo(() => {
    const ids = new Set<string>()
    const all = [...TRACKED_COINS, ...customCoins]
    return all.filter((c) => {
      if (ids.has(c.id)) return false
      ids.add(c.id)
      return true
    })
  }, [customCoins])

  const { coins, loading, error, lastUpdated, refetch, isStale } = usePrices(coinMetas)
  const { watchlist, toggle: toggleWatch } = useWatchlist()
  const { alerts, addAlert, getAlertsForCoin, checkAlerts } = useAlerts()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [days, setDays] = useState<TimeRange>('7')
  const [alertCoinId, setAlertCoinId] = useState<string | null>(null)

  const { chartData, loading: chartLoading, error: chartError } = useChartData(selectedId, days)

  const selectedCoin = useMemo(
    () => coins.find((c) => c.id === selectedId) ?? null,
    [coins, selectedId]
  )

  useEffect(() => {
    if (coins.length > 0 && !selectedId) {
      setSelectedId(coins[0].id)
    }
  }, [coins, selectedId])

  useEffect(() => {
    coins.forEach((coin) => {
      checkAlerts(coin.id, coin.current_price)
    })
  }, [coins, checkAlerts])

  const isCustomMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    coins.forEach((c) => { map[c.id] = isCustom(c.id) })
    return map
  }, [coins, isCustom])

  const alertCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    coins.forEach((coin) => {
      counts[coin.id] = getAlertsForCoin(coin.id).length
    })
    return counts
  }, [coins, getAlertsForCoin])

  const totalActiveAlerts = useMemo(
    () => alerts.filter((a) => !a.triggered).length,
    [alerts]
  )

  const handleSetAlert = useCallback(
    (coinId: string, targetPrice: number, direction: 'above' | 'below') => {
      addAlert({ coinId, targetPrice, direction })
    },
    [addAlert]
  )

  const alertModalCoin = useMemo(
    () => coins.find((c) => c.id === alertCoinId) ?? null,
    [coins, alertCoinId]
  )

  const handleChartRetry = useCallback(() => {
    refetch()
  }, [refetch])

  const handleSearchSelect = useCallback(
    (id: string, symbol: string, name: string) => {
      addCustom({ id, symbol, name })
    },
    [addCustom]
  )

  const addedIds = useMemo(() => coinMetas.map((c) => c.id), [coinMetas])

  return (
    <div className="min-h-screen bg-crypto-bg">
      <Header
        alertCount={totalActiveAlerts}
        lastUpdated={lastUpdated}
        isLoading={loading}
        isStale={isStale}
        onRefresh={refetch}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-5">
          <SearchBar onSelect={handleSearchSelect} addedIds={addedIds} />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-crypto-red/10 border border-crypto-red/30 rounded-xl text-sm text-crypto-red flex items-center justify-between">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              {error}
            </span>
            <button
              onClick={refetch}
              className="text-xs font-medium text-white bg-crypto-accent px-2.5 py-1 rounded-lg hover:opacity-90 transition-opacity shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-crypto-text-muted uppercase tracking-wider">
                All Assets
                <span className="ml-2 font-normal text-crypto-text-muted/60">{coins.length}</span>
              </h2>
              <div className="flex items-center gap-3 text-xs text-crypto-text-muted">
                {lastUpdated && (
                  <span className={`${isStale ? 'text-crypto-gold' : ''}`}>
                    {isStale ? '⚠ ' : ''}Updated {lastUpdated}
                  </span>
                )}
              </div>
            </div>

            <CoinGrid
              coins={coins}
              loading={loading}
              watchlist={watchlist}
              isCustomMap={isCustomMap}
              onToggleWatch={toggleWatch}
              onSelect={setSelectedId}
              onSetAlert={setAlertCoinId}
              onRemove={removeCustom}
              alertCounts={alertCounts}
              selectedId={selectedId}
            />

            <div className="mt-6">
              <PriceChart
                data={chartData}
                loading={chartLoading}
                error={chartError}
                days={days}
                onDaysChange={setDays}
                symbol={selectedCoin?.symbol ?? ''}
                onRetry={handleChartRetry}
              />
            </div>
          </div>

          <aside className="w-full lg:w-72 space-y-4 flex-shrink-0">
            <WatchlistPanel
              coins={coins}
              watchlist={watchlist}
              onRemove={toggleWatch}
              onSelect={setSelectedId}
            />
            <AlertBadge alerts={alerts} />
          </aside>
        </div>
      </main>

      {alertModalCoin && (
        <AlertModal
          coin={alertModalCoin}
          onClose={() => setAlertCoinId(null)}
          onSubmit={handleSetAlert}
        />
      )}
    </div>
  )
}

export default App
