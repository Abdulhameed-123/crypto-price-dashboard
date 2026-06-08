export const TRACKED_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'aerodrome-finance', symbol: 'AERO', name: 'Aerodrome' },
  { id: 'degen-base', symbol: 'DEGEN', name: 'Degen' },
  { id: 'brett-based', symbol: 'BRETT', name: 'Brett' },
  { id: 'toshi', symbol: 'TOSHI', name: 'Toshi' },
  { id: 'mochi-base', symbol: 'MOCHI', name: 'Mochi' },
  { id: 'well3', symbol: 'WELL3', name: 'WELL3' },
  { id: 'based-brett', symbol: 'BASED', name: 'Based Brett' },
  { id: 'rocket-pool-eth', symbol: 'RETH', name: 'Rocket Pool ETH' },
  { id: 'ondo-finance', symbol: 'ONDO', name: 'Ondo' },
]

export const TIME_RANGES = [
  { value: '0.01042' as const, label: '15m' },
  { value: '0.02083' as const, label: '30m' },
  { value: '0.04167' as const, label: '1H' },
  { value: '0.16667' as const, label: '4H' },
  { value: '1' as const, label: '1D' },
  { value: 'max' as const, label: 'ALL' },
]
