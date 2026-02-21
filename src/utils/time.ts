export type TimeOfDay = { hour: number; minute: number }

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatTimeOfDay24(t: TimeOfDay): string {
  return `${pad2(t.hour)}:${pad2(t.minute)}`
}

export function formatTime12h(d: Date): string {
  const h24 = d.getHours()
  const h12 = ((h24 + 11) % 12) + 1
  const ampm = h24 >= 12 ? 'PM' : 'AM'
  return `${h12}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ${ampm}`
}

export function formatTime24h(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

export function parseHHMM(value: string): TimeOfDay {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value)
  if (!m) throw new Error('Invalid time')
  return { hour: Number(m[1]), minute: Number(m[2]) }
}

export function nextOccurrence(now: Date, tod: TimeOfDay): Date {
  const candidate = new Date(now)
  candidate.setSeconds(0, 0)
  candidate.setHours(tod.hour, tod.minute, 0, 0)
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1)
  }
  return candidate
}

