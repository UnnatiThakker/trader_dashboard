# Trader Dashboard POC

A small React UI proof of concept for a portfolio-focused dashboard shell.

## Overview

This POC demonstrates building isolated dashboard widgets using React 19, Vite, and Tailwind CSS.

Key features:

- Single-page shell with two independent sections:
  - **Live FX Ticker** with simulated real-time price updates
  - **Portfolio Valuation Grid** with editable position units and live valuation
- Custom `ErrorBoundary` wrapper for widget isolation
  - A runtime crash in the FX ticker only affects that widget
  - Portfolio grid remains functional when the ticker fails
- High-frequency mock price stream at 50 updates/second
- Custom `useThrottledData` hook to batch updates and reduce render frequency to every 150ms
- `React.memo` used for portfolio row components to minimize unnecessary re-renders

## Tech Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS

## Project Structure

- `trader-dashboard-poc/src/App.tsx` — dashboard shell and layout
- `trader-dashboard-poc/src/components/LiveFxTicker.tsx` — isolated ticker widget
- `trader-dashboard-poc/src/components/PortfolioValuationGrid.tsx` — interactive portfolio grid
- `trader-dashboard-poc/src/components/ErrorBoundary.tsx` — custom error boundary
- `trader-dashboard-poc/src/hooks/useThrottledData.ts` — throttled batching hook

## Run locally

```bash
cd trader-dashboard-poc
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Validation

Build the project to verify type safety and bundle output:

```bash
cd trader-dashboard-poc
npm run build
```

## Notes

- The portfolio grid is editable and uses memoized rows so only edited rows re-render.
- The FX ticker is isolated with an `ErrorBoundary`, so widget crashes do not break the full page.
- The app uses a mock 50 Hz price feed, but UI updates are batched to every 150ms for smoother rendering.
- Use the `Restart ticker` button in the fallback UI to recover the ticker widget after a simulated crash.
