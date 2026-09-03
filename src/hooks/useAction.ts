import { useCallback, useRef, useState } from 'react'

interface ActionState<T> {
  value: T | null
  error: string | null
  busy: boolean
}

export interface ActionHandle<T> extends ActionState<T> {
  run: (fn: () => Promise<T>) => Promise<T | null>
  resetError: () => void
}

export function useAction<T = unknown>(): ActionHandle<T> {
  const [state, setState] = useState<ActionState<T>>({
    value: null,
    error: null,
    busy: false,
  })
  const mountedRef = useRef(true)

  const run = useCallback(async (fn: () => Promise<T>) => {
    setState({ value: null, error: null, busy: true })
    try {
      const value = await fn()
      if (mountedRef.current) setState({ value, error: null, busy: false })
      return value
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      if (mountedRef.current) setState({ value: null, error: message, busy: false })
      return null
    }
  }, [])

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return { ...state, run, resetError }
}