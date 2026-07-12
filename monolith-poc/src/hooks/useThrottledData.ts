import { useCallback, useEffect, useRef, useState } from 'react'

type Reducer<T, U> = (current: T, next: U) => T

export default function useThrottledData<T, U = T>(
  initialState: T,
  delay = 150,
  reducer: Reducer<T, U>,
) {
  const [state, setState] = useState(initialState)
  const bufferRef = useRef<U[]>([])
  const timerRef = useRef<number | null>(null)
  const reducerRef = useRef(reducer)

  useEffect(() => {
    reducerRef.current = reducer
  }, [reducer])

  const push = useCallback(
    (next: U) => {
      bufferRef.current.push(next)

      if (timerRef.current === null) {
        timerRef.current = window.setTimeout(() => {
          const batch = bufferRef.current.splice(0, bufferRef.current.length)
          timerRef.current = null

          setState((currentState) =>
            batch.reduce((updated, item) => reducerRef.current(updated, item), currentState),
          )
        }, delay)
      }
    },
    [delay],
  )

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    },
    [],
  )

  return [state, push] as const
}
