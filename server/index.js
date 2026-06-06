import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

const cache = new Map()
const CACHE_TTL = 15_000

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

const app = express()
app.use(cors())

app.use(express.static(join(__dirname, '..', 'dist')))

async function proxyCoinGecko(req, res) {
  const url = COINGECKO_BASE + req.path.replace('/api', '') + req.url.replace(req.path, '')
  const cacheKey = url

  const cached = getCached(cacheKey)
  if (cached) {
    res.set('X-Cache', 'HIT')
    return res.json(cached)
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: `CoinGecko error: ${response.status} ${response.statusText}`,
      })
    }

    const data = await response.json()
    setCache(cacheKey, data)
    res.set('X-Cache', 'MISS')
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach CoinGecko' })
  }
}

app.get('/api/coins/markets', proxyCoinGecko)
app.get('/api/simple/price', proxyCoinGecko)
app.get('/api/coins/*/market_chart', proxyCoinGecko)

app.get('*', (req, res) => {
  const indexPath = join(__dirname, '..', 'dist', 'index.html')
  if (existsSync(indexPath)) {
    res.set('Content-Type', 'text/html').send(readFileSync(indexPath, 'utf-8'))
  } else {
    res.status(200).json({ status: 'API server running', note: 'Build the frontend with `npm run build` to serve the UI' })
  }
})

createServer(app).listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
