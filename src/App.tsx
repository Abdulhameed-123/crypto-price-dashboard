import { useState, useCallback, useMemo, useEffect } from 'react'
import { Header } from './components/Header'
import { AssetDropdown } from './components/AssetDropdown'
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
  const { customCoins, add: addCustom } = useCustomCoins()

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
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1">
                <AssetDropdown
                  coins={coins}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  loading={loading}
                />
              </div>
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

            {selectedCoin && (
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://assets.coingecko.com/coins/images/1/small/${selectedCoin.id}.png`}
                    alt=""
                    className="w-10 h-10 rounded-full bg-crypto-bg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedCoin.symbol}&background=6366f1&color=fff&size=40`
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{selectedCoin.symbol}</h2>
                      <span className="text-sm text-crypto-text-muted">{selectedCoin.name}</span>
                      {selectedCoin.market_cap_rank && (
                        <span className="text-xs text-crypto-text-muted bg-crypto-bg px-1.5 py-0.5 rounded">
                          Rank #{selectedCoin.market_cap_rank}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                      <p className="text-2xl font-bold text-white">
                        ${selectedCoin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-sm font-medium ${selectedCoin.price_change_percentage_24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                        {selectedCoin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(selectedCoin.price_change_percentage_24h).toFixed(2)}%
                      </p>
                      <div className="flex gap-4 text-xs text-crypto-text-muted">
                        <span>MCap ${(selectedCoin.market_cap / 1e9).toFixed(2)}B</span>
                        <span>Vol ${(selectedCoin.total_volume / 1e9).toFixed(2)}B</span>
                        <span>24H L ${selectedCoin.low_24h.toLocaleString()} / H ${selectedCoin.high_24h.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setAlertCoinId(selectedCoin.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      alertCounts[selectedCoin.id] > 0
                        ? 'border-crypto-gold text-crypto-gold bg-crypto-gold/10'
                        : 'border-crypto-border text-crypto-text-muted hover:text-crypto-accent hover:border-crypto-accent'
                    }`}
                    title="Set price alert"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={alertCounts[selectedCoin.id] > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleWatch(selectedCoin.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      watchlist.includes(selectedCoin.id)
                        ? 'border-crypto-gold text-crypto-gold bg-crypto-gold/10'
                        : 'border-crypto-border text-crypto-text-muted hover:text-crypto-gold/60 hover:border-crypto-gold/30'
                    }`}
                    title={watchlist.includes(selectedCoin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={watchlist.includes(selectedCoin.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-crypto-text-muted">
                {lastUpdated && (
                  <span className={`${isStale ? 'text-crypto-gold' : ''}`}>
                    {isStale ? '⚠ ' : ''}Updated {lastUpdated}
                  </span>
                )}
              </div>
            </div>

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
