import { useEffect, useMemo, useRef } from 'react'
import type { Alarm } from '../state/alarms'
import { isAnyDaySelected } from '../state/alarms'
import { nextOccurrence } from '../utils/time'
import { dayKeyForDate } from '../utils/days'

export type DueAlarm = {
  alarmId: string
  dueAtMs: number
}

function nextOccurrenceOnSelectedDay(now: Date, a: Alarm): number | null {
  if (!isAnyDaySelected(a.config.days)) return null

  // Start with today's occurrence; if today not selected, advance to next selected day.
  let candidate = nextOccurrence(now, a.config.time)

  // nextOccurrence returns today if in the future, else tomorrow.
  for (let i = 0; i < 7; i++) {
    const key = dayKeyForDate(candidate)
    if (a.config.days[key]) return candidate.getTime()
    candidate = new Date(candidate.getTime())
    candidate.setDate(candidate.getDate() + 1)
    candidate.setHours(a.config.time.hour, a.config.time.minute, 0, 0)
  }

  return null
}

export function computeNextDueAlarm(now: Date, alarms: Alarm[]): DueAlarm | null {
  let best: DueAlarm | null = null

  for (const a of alarms) {
    if (!a.config.enabled) continue
    if (a.runtime.status === 'ringing') continue

    const dueAtMs =
      a.runtime.snoozeUntilMs ??
      nextOccurrenceOnSelectedDay(now, a)

    if (!dueAtMs) continue

    if (!best || dueAtMs < best.dueAtMs) {
      best = { alarmId: a.config.id, dueAtMs }
    }
  }

  return best
}

export function useMultiAlarmScheduler(now: Date, alarms: Alarm[], onRing: (alarmId: string) => void) {
  const due = useMemo(() => computeNextDueAlarm(now, alarms), [now, alarms])
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (!due) return

    const delay = Math.max(0, due.dueAtMs - Date.now())
    timerRef.current = window.setTimeout(() => {
      onRing(due.alarmId)
    }, delay)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [due, onRing])

  return { nextDue: due }
}
