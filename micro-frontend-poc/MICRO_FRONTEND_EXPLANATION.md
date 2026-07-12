# Micro Frontend Explanation

## What we implemented

This micro-frontend proof of concept splits the FX dashboard into two separate apps:

- `host-app` — the portal shell that renders the dashboard layout and the portfolio valuation grid.
- `remote-app` — the live FX ticker widget that is loaded dynamically at runtime.

The host app uses Vite module federation to import the remote widget with:

- `import('remoteApp/RemoteWidget')`

The remote app exposes the widget from `./src/RemoteWidget.tsx` as `remoteApp/RemoteWidget`.

Shared dependencies are configured so `react` and `react-dom` are singletons, avoiding duplicate React instances in the host and remote.

The host also includes an `ErrorBoundary` around the remote widget, so a crash inside the remote ticker does not break the entire dashboard.

### Host responsibilities

- Renders the dashboard shell and layout
- Loads the remote widget dynamically
- Hosts the local `PortfolioValuationGrid` component
- Provides a runtime fallback and reload button for the remote widget

### Remote responsibilities

- Simulates live FX prices in `LiveFxTicker`
- Updates prices continuously and uses `useThrottledData` to batch state updates for smooth rendering
- Exposes a single remote module that the host can import dynamically

## Why we chose this approach

This architecture was chosen to demonstrate the benefits of a micro-frontend pattern:

- **Independent deployment**: `host-app` and `remote-app` can be built and deployed separately.
- **Failure isolation**: a remote widget failure is contained inside the host's `ErrorBoundary`.
- **Runtime composition**: the host can load the remote widget at runtime instead of bundling it ahead of time.
- **Shared runtime dependencies**: React is shared as a singleton so the host and remote use the same React copy.
- **Clear separation of concerns**: the host manages layout and parent state, while the remote focuses on its widget logic.

This approach is especially useful for large teams or dashboard platforms where different teams own different widgets.

## How the host and remote are connected

- `host-app/vite.config.ts` configures a proxy and module federation remotes.
- `remote-app/vite.config.ts` configures module federation exposes and remote server settings.
- At runtime, the host fetches the remote entry bundle from the remote server and then renders its default component.

## How module federation works

Module federation allows one app to load code from another app at runtime.

- The remote app exposes specific modules in its `vite.config.ts` using `exposes`.
- The host app declares those remote modules under `remotes` so the bundle knows where to load them from.
- When the host executes `import('remoteApp/RemoteWidget')`, Vite resolves the remote’s entry script and downloads it.
- The remote entry script registers the exposed module and provides a loader for the requested export.
- Shared dependencies like `react` and `react-dom` are configured as singletons to avoid multiple copies.

This means the host can dynamically import the remote widget without bundling it ahead of time, while still reusing common libraries across both apps.

## Why the remote app uses preview in this repo

In this repo, the remote widget is loaded from a built preview server because the Vite dev server does not always expose the federation entry file at the same URL that the host expects.

- `npm run build` generates the actual federation artifact at `dist/assets/remoteEntry.js`.
- `npm run preview` serves that file directly as a static asset.
- In dev mode, the remote app can still return the SPA HTML page for unknown routes, causing requests for `remoteEntry.js` to fail.

So the preview-based flow ensures the host can fetch a real JS entry file from the remote app, not a redirected HTML page.

## UAT and production behavior

In UAT and production, the remote app should be built and deployed as a static asset package, not served by the Vite development server.

- The remote app build output (`dist/assets/remoteEntry.js` and related chunks) is published to a stable host or CDN.
- The host app is built with the remote asset URL that points to that deployed remote bundle.
- This is the same runtime federation pattern as the preview workaround, but with production-grade hosting.
- The host and remote can be independently released, and the host loads the remote widget dynamically at runtime.

### Example deployment pipeline configuration

Use an environment variable in `host-app/vite.config.ts` so the remote URL is injected at build time.

```ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const remoteEntryUrl =
    env.VITE_REMOTE_ENTRY_URL ||
    'http://localhost:4175/assets/remoteEntry.js'

  return {
    server: {
      host: '0.0.0.0',
      port: 4174,
    },
    plugins: [
      react(),
      federation({
        remotes: {
          remoteApp: remoteEntryUrl,
        },
        shared: {
          react: { singleton: true, requiredVersion: '^19.2.7' },
          'react-dom': { singleton: true, requiredVersion: '^19.2.7' },
        },
      }),
    ],
  }
})
```

#### GitHub Actions example

```yaml
jobs:
  build-host:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install host dependencies
        run: cd micro-frontend-poc/host-app && npm install
      - name: Build host for UAT
        run: |
          cd micro-frontend-poc/host-app
          VITE_REMOTE_ENTRY_URL="https://uat-static.example.com/remote-app/assets/remoteEntry.js" npm run build
```

For production, use the production remote URL instead:

```yaml
      - name: Build host for production
        run: |
          cd micro-frontend-poc/host-app
          VITE_REMOTE_ENTRY_URL="https://cdn.example.com/remote-app/assets/remoteEntry.js" npm run build
```

#### Alternate .env files

You can also define environment files for each stage:

`.env.uat`
```env
VITE_REMOTE_ENTRY_URL=https://uat-static.example.com/remote-app/assets/remoteEntry.js
```

`.env.production`
```env
VITE_REMOTE_ENTRY_URL=https://cdn.example.com/remote-app/assets/remoteEntry.js
```

Then build with the appropriate mode:

```bash
cd micro-frontend-poc/host-app
npm run build -- --mode uat
```

or

```bash
npm run build -- --mode production
```

This keeps the remote URL out of source control and lets the deployment pipeline choose the correct UAT or production remote asset location.

## Comparison: Monolith vs Micro-frontend

### Monolith approach

In the monolithic version (`monolith-poc`):

- The entire dashboard is built as a single React app.
- `LiveFxTicker` and `PortfolioValuationGrid` are compiled together.
- A crash or dependency issue in one component can affect the whole app.
- Build and deploy are simpler because there is only one app.

### Micro-frontend approach

In the micro-frontend version (`micro-frontend-poc`):

- The dashboard shell and the live ticker are separate apps.
- The host loads the remote widget dynamically using federation.
- The remote app can be updated independently of the host.
- The host can provide a recovery path when the remote widget fails.

### Pros and cons

| Approach | Pros | Cons |
|---|---|---|
| Monolith | Simple setup and local tooling; one bundle; no runtime remote loading | Tighter coupling; larger bundle; crashes can affect the whole app | 
| Micro-frontend | Independent widget deployment; better failure isolation; runtime composition | More configuration; proxy / federation complexity; versioning coordination |

## Why this is useful for dashboards

Dashboards often contain many independent widgets and data sources. A micro-frontend pattern allows:

- separate teams to own different widgets
- isolated upgrades for high-risk features
- reduced blast radius for widget bugs
- the shell to remain responsive while remote widgets load asynchronously

## Project mapping

- `host-app/src/App.tsx` — host shell and remote loader
- `host-app/src/components/PortfolioValuationGrid.tsx` — local portfolio grid
- `host-app/src/components/ErrorBoundary.tsx` — remote crash recovery
- `remote-app/src/RemoteWidget.tsx` — remote entry component
- `remote-app/src/LiveFxTicker.tsx` — remote ticker UI and live pricing
- `remote-app/src/useThrottledData.ts` — price update batching

## Local development notes

By default in this repo, the host expects the remote bundle to be available via the remote app running locally. This is a typical pattern for development and integration testing with micro-frontends.
