import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Updater<T, U> = (current: T, next: U) => T

export default function useThrottledData<T, U>(
  initialValue: T,
  intervalMs: number,
  reducer: Updater<T, U>,
): [T, (next: U) => void] {
  const [value, setValue] = useState(initialValue)
  const bufferRef = useRef<U[]>([])
  const currentRef = useRef(value)

  useEffect(() => {
    currentRef.current = value
  }, [value])

  const enqueue = useCallback((next: U) => {
    bufferRef.current.push(next)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!bufferRef.current.length) {
        return
      }

      setValue((current) => {
        const nextValue = bufferRef.current.reduce(reducer, current)
        bufferRef.current = []
        currentRef.current = nextValue
        return nextValue
      })
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [intervalMs, reducer])

  return [value, enqueue]
}
