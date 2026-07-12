import { useEffect, useMemo, useRef, useState } from 'react'
import useThrottledData from './useThrottledData'

type PriceTick = {
  symbol: string
  price: number
}

const symbols = ['EUR/USD', 'USD/JPY', 'GBP/USD', 'AUD/USD', 'USD/CHF']
const initialPrices: Record<string, number> = {
  'EUR/USD': 1.08725,
  'USD/JPY': 154.125,
  'GBP/USD': 1.26245,
  'AUD/USD': 0.64382,
  'USD/CHF': 0.88512,
}

function randomPrice(base: number) {
  const move = (Math.random() - 0.5) * 0.002
  return Number((base * (1 + move)).toFixed(5))
}

export default function LiveFxTicker() {
  const [shouldCrash, setShouldCrash] = useState(false)
  const [prices, enqueueTick] = useThrottledData<Record<string, number>, PriceTick>(
    initialPrices,
    150,
    (current, next) => ({ ...current, [next.symbol]: next.price }),
  )
  const pricesRef = useRef(prices)

  useEffect(() => {
    pricesRef.current = prices
  }, [prices])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const base = pricesRef.current[symbol] ?? initialPrices[symbol]
      enqueueTick({ symbol, price: randomPrice(base) })
    }, 20)

    return () => window.clearInterval(interval)
  }, [enqueueTick])

  if (shouldCrash) {
    throw new Error('Simulated FX crash')
  }

  const quoteRows = useMemo(
    () =>
      symbols.map((symbol) => ({
        symbol,
        price: prices[symbol] ?? initialPrices[symbol],
      })),
    [prices],
  )

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Live FX Ticker</p>
          <h2 className="text-2xl font-semibold text-slate-900">Real-time pricing</h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          onClick={() => setShouldCrash(true)}
        >
          Simulate Crash
        </button>
      </div>

      <div className="grid gap-3">
        {quoteRows.map((quote) => (
          <div
            key={quote.symbol}
            className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-slate-600">{quote.symbol}</p>
            </div>
            <p className="font-mono text-lg text-slate-900">{quote.price.toFixed(5)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
