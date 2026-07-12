# Trader Dashboard POC

A small React UI proof of concept for a portfolio-focused dashboard shell.

## Overview

This repo contains two implementations of the same dashboard concept:

- `monolith-poc` — a traditional monolithic React app.
- `micro-frontend-poc` — a host shell that loads a remote FX ticker widget at runtime.

Both implementations use React 19, Vite, TypeScript, and Tailwind CSS.

## What was implemented in the micro-frontend version

The micro-frontend version splits the app into two separate Vite apps:

- `host-app` — renders the dashboard layout, host shell, and local portfolio valuation grid.
- `remote-app` — exposes a remote FX ticker widget via Vite module federation.

Key capabilities:

- Dynamic runtime loading of the remote widget with `import('remoteApp/RemoteWidget')`
- Shared singleton dependencies for `react` and `react-dom`
- Error isolation via a host `ErrorBoundary`
- Local portfolio grid and remote ticker separation
- Throttled live price updates from the remote widget using `useThrottledData`

## Why this approach was chosen

We chose a micro-frontend architecture to demonstrate how a dashboard can be decomposed into independently developed and deployed pieces.

Advantages:

- Independent deployment of host and remote apps
- Better failure isolation for widget crashes
- Runtime composition of remote widgets into the shell
- Separate lifecycle for updating the ticker widget without redeploying the host
- Shared dependencies to avoid duplicate React instances

## Monolith vs Micro-frontend

### Monolith approach

- Single app bundle containing all components
- Easier initial setup
- Single build and deploy pipeline
- Tighter coupling between widgets
- A runtime failure in one widget may affect the entire page

### Micro-frontend approach

- Separate host and remote bundles
- Remote widget loaded dynamically at runtime
- Better isolation and independent releases
- Additional configuration complexity around federation and proxying
- More flexible architecture for teams owning separate widgets

### Comparison

| Approach | Pros | Cons |
|---|---|---|
| Monolith | Simple setup, single deployment, easier local dev | Coupling, larger bundles, shared failure surface |
| Micro-frontend | Independent deployment, runtime isolation, team ownership | Federation configuration, proxy complexity, network load |

## Project structure

### `monolith-poc`

- `src/App.tsx` — monolith shell and layout
- `src/components/LiveFxTicker.tsx` — ticker widget
- `src/components/PortfolioValuationGrid.tsx` — portfolio grid
- `src/components/ErrorBoundary.tsx` — crash isolation
- `src/hooks/useThrottledData.ts` — update batching

### `micro-frontend-poc`

- `host-app/src/App.tsx` — shell and remote loader
- `host-app/src/components/PortfolioValuationGrid.tsx` — portfolio grid
- `host-app/src/components/ErrorBoundary.tsx` — remote widget isolation
- `remote-app/src/RemoteWidget.tsx` — remote widget entry
- `remote-app/src/LiveFxTicker.tsx` — live pricing widget
- `remote-app/src/useThrottledData.ts` — remote update batching

## Run locally

### Monolith

```bash
cd monolith-poc
npm install
npm run dev
```

### Micro-frontend

1. Start the remote app preview server on port 4175:

```bash
cd micro-frontend-poc/remote-app
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 4175
```

2. Start the host app in a second terminal:

```bash
cd micro-frontend-poc/host-app
npm install
npm run dev -- --host 0.0.0.0 --port 4174
```

3. Open the host app in the browser at `http://127.0.0.1:4174`

The host will load the remote widget from `http://127.0.0.1:4175`.

## Documentation

- `micro-frontend-poc/MICRO_FRONTEND_EXPLANATION.md` — detailed implementation notes and architecture comparison.
