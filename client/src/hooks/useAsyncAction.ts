import { useCallback, useState } from 'react'
import { getErrorMessage } from '../lib/errors'

export function useAsyncAction() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const run = useCallback(
    async <T>(action: () => Promise<T>, fallbackMessage: string): Promise<T | null> => {
      setError(null)
      setLoading(true)
      try {
        return await action()
      } catch (err) {
        setError(getErrorMessage(err, fallbackMessage))
        return null
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { error, loading, run, setError }
}
