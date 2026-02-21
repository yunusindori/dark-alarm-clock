import { useEffect, useState } from 'react'

export function useNow(tickMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number | null = null

    const schedule = () => {
      const d = new Date()
      setNow(d)
      const drift = d.getTime() % tickMs
      const delay = Math.max(10, tickMs - drift)
      timer = window.setTimeout(schedule, delay)
    }

    schedule()
    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [tickMs])

  return now
}

