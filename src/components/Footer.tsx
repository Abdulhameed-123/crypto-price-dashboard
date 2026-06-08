export function Footer() {
  return (
    <footer className="mt-8 border-t border-crypto-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-crypto-text-muted">
          <p>
            Data provided by{' '}
            <a
              href="https://www.coingecko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-crypto-accent hover:underline"
            >
              CoinGecko
            </a>
          </p>
          <p>
            Prices refresh every 30s &middot; Not financial advice
          </p>
        </div>
      </div>
    </footer>
  )
}
