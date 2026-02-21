import type { DaysOfWeek } from '../state/alarms'

export const DAY_KEYS: Array<keyof DaysOfWeek> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export function dayKeyForDate(d: Date): keyof DaysOfWeek {
  // JS: 0=Sun..6=Sat
  switch (d.getDay()) {
    case 0:
      return 'sun'
    case 1:
      return 'mon'
    case 2:
      return 'tue'
    case 3:
      return 'wed'
    case 4:
      return 'thu'
    case 5:
      return 'fri'
    case 6:
      return 'sat'
    default:
      return 'mon'
  }
}

export function formatDaysShort(days: DaysOfWeek | undefined | null): string {
  if (!days) return '—'
  const parts: string[] = []
  if (days.mon) parts.push('Mon')
  if (days.tue) parts.push('Tue')
  if (days.wed) parts.push('Wed')
  if (days.thu) parts.push('Thu')
  if (days.fri) parts.push('Fri')
  if (days.sat) parts.push('Sat')
  if (days.sun) parts.push('Sun')
  return parts.length ? parts.join(' ') : '—'
}
