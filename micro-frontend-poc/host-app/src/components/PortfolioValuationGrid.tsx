import { memo, useCallback, useEffect, useMemo, useState } from 'react'

type Holding = {
  id: string
  asset: string
  currency: string
  price: number
  units: number
}

type PortfolioRowProps = {
  holding: Holding
  units: number
  onUnitsChange: (id: string, nextUnits: number) => void
}

const initialHoldings: Holding[] = [
  { id: '1', asset: 'EUR/USD', currency: 'EUR', price: 1.08725, units: 110000 },
  { id: '2', asset: 'USD/JPY', currency: 'JPY', price: 154.125, units: 9250000 },
  { id: '3', asset: 'GBP/USD', currency: 'GBP', price: 1.26245, units: 78000 },
  { id: '4', asset: 'AUD/USD', currency: 'AUD', price: 0.64382, units: 145000 },
  { id: '5', asset: 'USD/CHF', currency: 'CHF', price: 0.88512, units: 98000 },
]

const PortfolioRow = memo(function PortfolioRow({ holding, units, onUnitsChange }: PortfolioRowProps) {
  const value = units * holding.price

  return (
    <tr className="border-t border-slate-200 even:bg-slate-50">
      <td className="px-4 py-3 text-left text-sm text-slate-700">{holding.asset}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-700">{holding.currency}</td>
      <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">{holding.price.toFixed(5)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-700">
        <input
          type="number"
          min="0"
          value={units}
          onChange={(event) => onUnitsChange(holding.id, Number(event.target.value))}
          className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
    </tr>
  )
}, (prev, next) => prev.units === next.units && prev.holding === next.holding && prev.onUnitsChange === next.onUnitsChange)

export default function PortfolioValuationGrid() {
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(initialHoldings.map((holding) => [holding.id, holding.units])),
  )
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const handleUnitsChange = useCallback((id: string, nextUnits: number) => {
    setResetMessage(null)
    setQuantities((current) => ({ ...current, [id]: Number.isFinite(nextUnits) ? nextUnits : current[id] }))
  }, [])

  useEffect(() => {
    if (!resetMessage) {
      return
    }

    const timeout = window.setTimeout(() => setResetMessage(null), 3000)
    return () => window.clearTimeout(timeout)
  }, [resetMessage])

  const totalValue = useMemo(
    () =>
      initialHoldings.reduce((sum, holding) => {
        const units = quantities[holding.id] ?? holding.units
        return sum + units * holding.price
      }, 0),
    [quantities],
  )

  const resetQuantities = useCallback(() => {
    setQuantities(Object.fromEntries(initialHoldings.map((holding) => [holding.id, holding.units])))
    setResetMessage('Quantities reset to default values.')
  }, [])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Portfolio valuation</p>
          <h2 className="text-2xl font-semibold text-slate-900">Interactive grid</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Edit the quantities for each position and see total value update instantly.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            onClick={resetQuantities}
          >
            Reset quantities
          </button>
          {resetMessage ? <p className="text-sm text-slate-600">{resetMessage}</p> : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200">
        <table className="min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3 text-right">Currency</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Units</th>
              <th className="px-4 py-3 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {initialHoldings.map((holding) => (
              <PortfolioRow
                key={holding.id}
                holding={holding}
                units={quantities[holding.id] ?? holding.units}
                onUnitsChange={handleUnitsChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-2 rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-slate-900">Total portfolio value</p>
        <p className="text-lg font-semibold text-slate-900">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
    </section>
  )
}
