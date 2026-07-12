# Micro Frontend POC

This proof of concept demonstrates a host portal shell loading a remote banking/FX widget from a separate Vite app at runtime.

## Architecture

- `host-app` — portal shell running on `http://localhost:4174`
- `remote-app` — widget served on `http://localhost:4175`

## What it proves

- The host dynamically pulls the remote widget over `localhost`
- The remote widget is loaded at runtime via module federation
- `react` and `react-dom` are shared as singleton dependencies

## Run locally

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

3. Open `http://localhost:4174`

The host will load the remote widget from `http://localhost:4175`.
