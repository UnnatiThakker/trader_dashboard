# Trader Dashboard POC - Q&A

## Question 1
**Why is `PortfolioRow` wrapped with `memo`?**

### Answer
`PortfolioRow` is memoized so React can skip re-rendering a row when its props haven’t changed.

- `PortfolioValuationGrid` may re-render often when `quantities`, `resetMessage`, or other state updates change.
- Without `memo`, every row would re-render on every parent render, even if its own `units` value stayed the same.
- With `memo`, React compares the previous and next props for that row and only re-renders if:
  - `units` changed
  - `holding` reference changed
  - `onUnitsChange` reference changed

### Why it helps
- Fewer row renders = better performance
- Especially useful in a table with multiple rows
- Keeps UI responsive when only one row is edited

### Important detail
The `onUnitsChange` callback is stable because `handleUnitsChange` is wrapped in `useCallback`, so rows won’t re-render just because the parent re-rendered.

---

## Question 2
**What is the `useThrottledData` hook doing? Explain.**

### Answer
`useThrottledData` is a custom hook that batches rapid updates and applies them to state only once every `delay` milliseconds.

#### Key behavior
- `state`
  - Holds the current aggregated value (`initialState` initially).
- `bufferRef`
  - An array that collects incoming update objects.
- `timerRef`
  - Tracks whether a flush timeout is already scheduled.
- `reducerRef`
  - Keeps the latest reducer function stable across renders.

#### How it works
1. Call `push(next)` for each incoming update.
2. Each update is appended to `bufferRef.current`.
3. If no timer exists yet:
   - schedule `setTimeout(..., delay)`.
4. When the timer fires:
   - drain the buffer into `batch`
   - clear the timer
   - call `setState(...)` once using `batch.reduce(...)`
   - the reducer merges all buffered updates into the current state

#### Why it matters
- Incoming events can arrive very fast (50 updates/sec).
- Instead of calling `setState` on every tick, the hook batches them.
- The UI updates only every `delay` ms (150ms by default).
- This reduces re-renders and keeps the ticker performant.

### Summary
`useThrottledData` is effectively:
- a buffered update queue
- a timer-based flush mechanism
- a reducer-driven state merge

It lets you accept many rapid events while updating React state at a controlled frequency.

---

## Question 3
**Why is `ErrorBoundary` implemented as a class component?**

### Answer
React error boundaries must be class components because the supported API relies on class lifecycle methods.

- The component uses `static getDerivedStateFromError()` to update state after an error.
- It uses `componentDidCatch()` to log or handle the error side effects.
- React does not provide a built-in hook equivalent for error boundaries in stable releases.

### Why this matters
- This allows the FX ticker widget to fail safely without breaking the entire app.
- The class-based boundary catches render-time errors from its children and renders fallback UI instead.

---

## Question 4
**Why use Vite and not webpack?**

### Answer
Vite is a better fit for a modern React POC because it is faster and simpler during development.

- Vite uses native ES modules in development, so it can start the dev server almost instantly instead of waiting for a full webpack bundle.
- It only transforms code on demand, so hot module replacement is much faster and more responsive.
- Vite has a much smaller config surface for React/TypeScript projects, while webpack often requires more boilerplate and plugin setup.
- The production build is still optimized: Vite uses Rollup under the hood and provides fast builds with good tree-shaking.
- For this kind of modern app, Vite reduces iteration time and complexity without sacrificing bundle quality.

### In short
Vite is faster to develop with and simpler to configure, while webpack is more heavyweight and slower for this kind of modern React app.
