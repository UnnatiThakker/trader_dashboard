import { ComponentType, useCallback, useEffect, useMemo, useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import PortfolioValuationGrid from './components/PortfolioValuationGrid'

async function loadRemoteWidget() {
  const module = await import('remoteApp/RemoteWidget')
  return module.default as ComponentType
}

function App() {
  const [RemoteWidget, setRemoteWidget] = useState<null | ComponentType>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const resetRemoteWidget = useCallback(() => {
    setRefreshKey((current) => current + 1)
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setRemoteWidget(null)

    loadRemoteWidget()
      .then((Component) => {
        setRemoteWidget(() => Component)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => setLoading(false))
  }, [refreshKey])

  const widgetContent = useMemo(() => {
    if (loading) return <p>Loading live widget...</p>
    if (error) return <p className="text-rose-700">{error}</p>
    if (RemoteWidget) return <RemoteWidget />
    return <p>No remote widget available.</p>
  }, [RemoteWidget, loading, error])

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dashboard shell</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Micro frontend FX dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The host renders the portfolio grid locally while the live FX ticker is loaded as a remote micro-frontend widget.
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(360px,0.8fr)_minmax(440px,1.2fr)]">
          <div className="space-y-8 xl:max-w-none">
            <ErrorBoundary
              resetKey={refreshKey}
              fallbackRender={({ resetErrorBoundary }) => (
                <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-rose-900">Live widget unavailable</h2>
                  <p className="mt-2 text-sm leading-6 text-rose-700">
                    The live FX micro-frontend failed to load. Refreshing the widget will not affect the portfolio section.
                  </p>
                  <button
                    type="button"
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    onClick={resetErrorBoundary}
                  >
                    Reload widget
                  </button>
                </section>
              )}
            >
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Live</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Remote FX ticker</h2>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    onClick={resetRemoteWidget}
                  >
                    Reload remote widget
                  </button>
                </div>
                <div className="mt-6 rounded-3xl bg-slate-50 p-6">
                  {widgetContent}
                </div>
              </section>
            </ErrorBoundary>
          </div>

          <PortfolioValuationGrid />
        </div>
      </div>
    </div>
  )
}

export default App
