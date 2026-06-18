import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { StatsBar } from './components/StatsBar'
import { AssetDropdown } from './components/AssetDropdown'
import { PriceChart } from './components/PriceChart'
import { WatchlistPanel } from './components/WatchlistPanel'
import { AlertModal } from './components/AlertModal'
import { AlertBadge } from './components/AlertBadge'
import { SearchBar } from './components/SearchBar'
import { PortfolioInput } from './components/PortfolioInput'
import { PortfolioSummary } from './components/PortfolioSummary'
import { Footer } from './components/Footer'
import { GainersLosers } from './components/GainersLosers'
import { FearGreedGauge } from './components/FearGreedGauge'
import { usePrices } from './hooks/usePrices'
import { useChartData } from './hooks/useChartData'
import { useWatchlist } from './hooks/useWatchlist'
import { useAlerts } from './hooks/useAlerts'
import { useCustomCoins } from './hooks/useCustomCoins'
import { usePortfolio } from './hooks/usePortfolio'
import { useGlobalStats } from './hooks/useGlobalStats'
import { TRACKED_COINS } from './constants/coins'
import type { TimeRange, ChartType } from './types'

function App() {
  const { customCoins, add: addCustom } = useCustomCoins()
  const globalStats = useGlobalStats()

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
  const { setHolding, getHolding, hasHoldings, totalValue, pnl24h, pnlPercent, allocations } = usePortfolio(coins)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [days, setDays] = useState<TimeRange>('0.04167')
  const [alertCoinId, setAlertCoinId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [chartType, setChartType] = useState<ChartType>('line')
  const { chartData, candleData, loading: chartLoading, error: chartError } = useChartData(selectedId, days, chartType)
  const handleDaysChange = useCallback((d: TimeRange) => {
    setDays(d)
    if (d !== '1' && d !== 'max') setChartType('line')
  }, [])

  const selectedCoin = useMemo(
    () => coins.find((c) => c.id === selectedId) ?? null,
    [coins, selectedId]
  )

  const prevPriceRef = useRef(0)
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (!selectedCoin) return
    const prev = prevPriceRef.current
    if (prev > 0 && selectedCoin.current_price !== prev) {
      setPriceFlash(selectedCoin.current_price > prev ? 'up' : 'down')
      const t = setTimeout(() => setPriceFlash(null), 600)
      return () => clearTimeout(t)
    }
    prevPriceRef.current = selectedCoin.current_price
  }, [selectedCoin?.current_price])

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
      setSelectedId(id)
    },
    [addCustom]
  )

  const addedIds = useMemo(() => coinMetas.map((c) => c.id), [coinMetas])

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-crypto-bg">
      <Header
        alertCount={totalActiveAlerts}
        lastUpdated={lastUpdated}
        isLoading={loading}
        isStale={isStale}
        onRefresh={refetch}
        portfolioValue={totalValue}
        portfolioPnl={pnl24h}
        portfolioPnlPercent={pnlPercent}
        onToggleSidebar={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      <StatsBar
        totalMarketCap={globalStats?.totalMarketCap ?? null}
        totalVolume={globalStats?.totalVolume ?? null}
        btcDominance={globalStats?.btcDominance ?? null}
        marketCapChange24h={globalStats?.marketCapChange24h ?? null}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <div className="flex-1">
                <AssetDropdown
                  coins={coins}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  loading={loading}
                />
              </div>
              <div className="sm:w-auto">
                <SearchBar onSelect={handleSearchSelect} addedIds={addedIds} />
              </div>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-crypto-red/10 border border-crypto-red/30 rounded-xl text-sm text-crypto-red flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs sm:text-sm">
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
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <img
                      src={selectedCoin.image ?? `https://ui-avatars.com/api/?name=${selectedCoin.symbol}&background=6366f1&color=fff&size=40`}
                      alt=""
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-crypto-bg shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedCoin.symbol}&background=6366f1&color=fff&size=40`
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-white">{selectedCoin.symbol}</h2>
                        <span className="text-xs sm:text-sm text-crypto-text-muted truncate">{selectedCoin.name}</span>
                        {selectedCoin.market_cap_rank && (
                          <span className="text-[11px] text-crypto-text-muted bg-crypto-bg px-1.5 py-0.5 rounded">
                            #{selectedCoin.market_cap_rank}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 mt-0.5 flex-wrap">
                        <p className={`text-xl sm:text-2xl font-bold text-white rounded px-1 -mx-1 ${
                          priceFlash === 'up' ? 'animate-flash-green' : priceFlash === 'down' ? 'animate-flash-red' : ''
                        }`}>
                          ${selectedCoin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm font-medium ${selectedCoin.price_change_percentage_24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                          {selectedCoin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(selectedCoin.price_change_percentage_24h).toFixed(2)}%
                        </p>
                        <div className="flex gap-3 sm:gap-4 text-[11px] sm:text-xs text-crypto-text-muted">
                          <span className="hidden sm:inline">MCap ${(selectedCoin.market_cap / 1e9).toFixed(2)}B</span>
                          <span className="hidden sm:inline">Vol ${(selectedCoin.total_volume / 1e9).toFixed(2)}B</span>
                          <span>L ${selectedCoin.low_24h.toLocaleString()} / H ${selectedCoin.high_24h.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setAlertCoinId(selectedCoin.id)}
                      className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
                        alertCounts[selectedCoin.id] > 0
                          ? 'border-crypto-gold text-crypto-gold bg-crypto-gold/10'
                          : 'border-crypto-border text-crypto-text-muted hover:text-crypto-accent hover:border-crypto-accent'
                      }`}
                      title="Set price alert"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill={alertCounts[selectedCoin.id] > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleWatch(selectedCoin.id)}
                      className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
                        watchlist.includes(selectedCoin.id)
                          ? 'border-crypto-gold text-crypto-gold bg-crypto-gold/10'
                          : 'border-crypto-border text-crypto-text-muted hover:text-crypto-gold/60 hover:border-crypto-gold/30'
                      }`}
                      title={watchlist.includes(selectedCoin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill={watchlist.includes(selectedCoin.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-2 sm:mt-3">
                  <PortfolioInput
                    coinId={selectedCoin.id}
                    symbol={selectedCoin.symbol}
                    currentPrice={selectedCoin.current_price}
                    holding={getHolding(selectedCoin.id)}
                    onSetHolding={setHolding}
                  />
                </div>
              </div>
            )}

            <GainersLosers coins={coins} loading={loading} onSelect={setSelectedId} />

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
              candleData={candleData}
              loading={chartLoading}
              error={chartError}
              days={days}
              chartType={chartType}
              onDaysChange={handleDaysChange}
              onChartTypeChange={setChartType}
              symbol={selectedCoin?.symbol ?? ''}
              onRetry={handleChartRetry}
            />
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`
              fixed lg:sticky top-0 h-full lg:h-auto z-40 lg:z-auto
              w-72 bg-crypto-bg lg:bg-crypto-bg/60
              border-l border-crypto-border lg:border-l lg:border-crypto-border
              shadow-2xl lg:shadow-none
              overflow-y-auto p-4 sm:p-0
              transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="text-sm font-semibold text-white">Sidebar</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-crypto-surface transition-colors"
              >
                <svg className="w-5 h-5 text-crypto-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <FearGreedGauge />
              <PortfolioSummary
                totalValue={totalValue}
                pnl24h={pnl24h}
                pnlPercent={pnlPercent}
                allocations={allocations}
                hasHoldings={hasHoldings}
              />
              <WatchlistPanel
                coins={coins}
                watchlist={watchlist}
                onRemove={toggleWatch}
                onSelect={setSelectedId}
              />
              <AlertBadge alerts={alerts} />
            </div>
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

      <Footer />
    </div>
  )
}

export default App
