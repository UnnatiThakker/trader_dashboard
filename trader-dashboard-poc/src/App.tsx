import { useCallback, useState } from 'react'
import './App.css'
import ErrorBoundary from './components/ErrorBoundary'
import LiveFxTicker from './components/LiveFxTicker'
import PortfolioValuationGrid from './components/PortfolioValuationGrid'

function App() {
  const [tickerResetKey, setTickerResetKey] = useState(0)

  const resetTicker = useCallback(() => {
    setTickerResetKey((current) => current + 1)
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Trading dashboard shell</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Isolated widgets with fault tolerance</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The Live FX Ticker is isolated behind a custom React ErrorBoundary. A simulated crash will only affect that widget, while the portfolio grid remains fully interactive.
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(320px,0.75fr)_minmax(480px,1.25fr)]">
          <div className="space-y-8 xl:max-w-none">
            <ErrorBoundary
              resetKey={tickerResetKey}
              onReset={resetTicker}
              fallbackRender={({ resetErrorBoundary }) => (
                <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-rose-900">FX Ticker Unavailable</h2>
                  <p className="mt-2 text-sm leading-6 text-rose-700">
                    Something went wrong with the live pricing widget. Restarting the widget will restore the ticker without affecting the portfolio grid.
                  </p>
                  <button
                    type="button"
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    onClick={resetErrorBoundary}
                  >
                    Restart ticker
                  </button>
                </section>
              )}
            >
              <LiveFxTicker key={tickerResetKey} />
            </ErrorBoundary>
          </div>

          <PortfolioValuationGrid />
        </div>
      </div>
    </div>
  )
}

export default App
