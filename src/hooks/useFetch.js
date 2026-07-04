// src/hooks/useFetch.js
import { useState, useEffect } from 'react'

// Runs `asyncFn` (which returns a promise) and tracks data/loading/error.
// `deps` controls when it re-runs (like useEffect's dependency array).
export function useFetch(asyncFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true        // guards against stale responses
    setLoading(true)
    setError(null)

    asyncFn()
      .then((result) => { if (active) setData(result) })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }   // cleanup: ignore this call's result if deps changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
