export interface Coin {
  id: string
  symbol: string
  name: string
  image?: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  market_cap_rank: number | null
  total_volume: number
  high_24h: number
  low_24h: number
}

export interface CoinMeta {
  id: string
  symbol: string
  name: string
}

export interface SearchResult {
  id: string
  symbol: string
  name: string
  thumb: string
  market_cap_rank: number | null
}

export interface PriceHistory {
  prices: [number, number][]
}

export interface Alert {
  coinId: string
  targetPrice: number
  direction: 'above' | 'below'
  triggered: boolean
}

export interface Holding {
  coinId: string
  amount: number
}

export interface Allocation {
  coinId: string
  symbol: string
  value: number
  pct: number
  color: string
}

export type TimeRange = '1' | '7' | '30' | '365'
