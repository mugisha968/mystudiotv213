import { useCallback, useEffect, useRef, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[],
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true,
  })
  const [tick, setTick] = useState(0)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    let mounted = true

    setState((prev) => ({ ...prev, loading: true, error: null }))

    asyncFn()
      .then((data) => {
        if (mounted && !cancelledRef.current) {
          setState({ data, error: null, loading: false })
        }
      })
      .catch((err: unknown) => {
        if (mounted && !cancelledRef.current) {
          const message =
            err instanceof Error ? err.message : 'Unexpected error'
          setState({ data: null, error: message, loading: false })
        }
      })

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => {
    cancelledRef.current = true
    setTick((value) => value + 1)
  }, [])

  return { ...state, reload }
}