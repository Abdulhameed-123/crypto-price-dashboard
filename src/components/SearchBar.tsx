import { useState, useRef, useEffect, useCallback } from 'react'
import { searchCoins } from '../api/coingecko'
import type { SearchResult } from '../types'

interface SearchBarProps {
  onSelect: (id: string, symbol: string, name: string) => void
  addedIds: string[]
}

export function SearchBar({ onSelect, addedIds }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const coins = await searchCoins(q, controller.signal)
      setResults(coins)
      setOpen(true)
    } catch {
      if (!controller.signal.aborted) {
        setResults([])
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  function handleSelect(result: SearchResult) {
    onSelect(result.id, result.symbol.toUpperCase(), result.name)
    setQuery('')
    setOpen(false)
    setResults([])
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-xs">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-crypto-text-muted pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder="Search any token..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-crypto-surface border border-crypto-border rounded-lg text-white placeholder-crypto-text-muted focus:outline-none focus:border-crypto-accent transition-colors"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-crypto-accent border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-crypto-surface border border-crypto-border rounded-xl shadow-2xl overflow-hidden">
          {results.map((result) => {
            const alreadyAdded = addedIds.includes(result.id)
            return (
              <button
                key={result.id}
                onClick={() => !alreadyAdded && handleSelect(result)}
                disabled={alreadyAdded}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  alreadyAdded
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-crypto-surface-hover cursor-pointer'
                }`}
              >
                <img
                  src={result.thumb}
                  alt={result.name}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${result.symbol}&background=6366f1&color=fff&size=24`
                  }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-white">{result.symbol.toUpperCase()}</span>
                  <span className="text-xs text-crypto-text-muted ml-2">{result.name}</span>
                </div>
                {result.market_cap_rank && (
                  <span className="text-[11px] text-crypto-text-muted shrink-0">#{result.market_cap_rank}</span>
                )}
                {alreadyAdded && (
                  <span className="text-[11px] text-crypto-green shrink-0">Added</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
