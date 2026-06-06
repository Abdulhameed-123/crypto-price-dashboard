import type { Coin, PriceHistory, SearchResult, TimeRange } from '../types'

const BASE_URL = '/api'
const MAX_RETRIES = 3
const TIMEOUT_MS = 12_000
const RETRY_BASE_MS = 1_000

const DAYS_MAP: Record<TimeRange, string> = {
  '1': '1',
  '7': '7',
  '30': '30',
  '365': '365',
}

class ApiError extends Error {
  status: number
  retryable: boolean
  constructor(message: string, status: number, retryable: boolean) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.retryable = retryable
  }
}

async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  const combinedSignal = signal
    ? combineAbortSignals(signal, controller.signal)
    : controller.signal

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: combinedSignal,
    })
    return res
  } finally {
    clearTimeout(timeoutId)
  }
}

function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()
  for (const sig of signals) {
    if (sig.aborted) {
      controller.abort(sig.reason)
      return controller.signal
    }
    sig.addEventListener('abort', () => controller.abort(sig.reason), { once: true })
  }
  return controller.signal
}

async function fetchJson<T>(url: string, retries = MAX_RETRIES, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, signal)

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '5', 10)
        if (attempt < retries) {
          await sleep(retryAfter * 1000)
          continue
        }
        throw new ApiError('Rate limited. Retrying...', 429, true)
      }

      if (!res.ok) {
        const retryable = res.status >= 500 || res.status === 0
        throw new ApiError(
          `API error: ${res.status} ${res.statusText}`,
          res.status,
          retryable
        )
      }

      return res.json()
    } catch (err) {
      if (err instanceof ApiError && !err.retryable) throw err
      if (attempt < retries && !signal?.aborted) {
        const delay = RETRY_BASE_MS * Math.pow(2, attempt) + Math.random() * 500
        await sleep(delay)
        continue
      }
      if (signal?.aborted) throw err
      throw err instanceof ApiError ? err : new ApiError('Network error. Check your connection.', 0, true)
    }
  }
  throw new ApiError('Request failed after retries', 0, true)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchCoins(ids: string[], signal?: AbortSignal): Promise<Coin[]> {
  if (ids.length === 0) return []
  const idsParam = ids.join(',')
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
  const data = await fetchJson<Coin[]>(url, MAX_RETRIES, signal)
  return data.filter((c) => ids.includes(c.id))
}

export async function fetchPriceHistory(id: string, days: TimeRange, signal?: AbortSignal): Promise<PriceHistory> {
  const url = `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${DAYS_MAP[days]}`
  return fetchJson<PriceHistory>(url, MAX_RETRIES, signal)
}

export async function searchCoins(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const url = `${BASE_URL}/search?query=${encodeURIComponent(query)}`
  const data = await fetchJson<{ coins: SearchResult[] }>(url, 1, signal)
  return data.coins.slice(0, 10)
}
