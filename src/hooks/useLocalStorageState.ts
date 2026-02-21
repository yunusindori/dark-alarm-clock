import { useEffect, useState } from 'react'

export function useLocalStorageState<T>(key: string, initial: T, normalize?: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initial
      const parsed: unknown = JSON.parse(raw)
      return normalize ? normalize(parsed) : (parsed as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore storage failures
    }
  }, [key, value])

  return [value, setValue] as const
}
