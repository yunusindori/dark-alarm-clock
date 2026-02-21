import { describe, expect, it } from 'vitest'
import { computeNextDueAlarm } from '../useMultiAlarmScheduler'
import type { Alarm } from '../../state/alarms'
import { everyDay } from '../../state/alarms'

function alarm(id: string, enabled: boolean, hour: number, minute: number): Alarm {
  return {
    config: {
      id,
      label: id,
      enabled,
      time: { hour, minute },
      days: everyDay(),
      toneId: 'beep',
      playDurationSec: 30,
      snoozeMinutes: 5,
    },
    runtime: {
      status: enabled ? 'armed' : 'idle',
      snoozeUntilMs: null,
    },
  }
}

describe('computeNextDueAlarm', () => {
  it('returns null when no alarms enabled', () => {
    const now = new Date('2026-02-20T08:00:00')
    const due = computeNextDueAlarm(now, [alarm('a', false, 9, 0)])
    expect(due).toBeNull()
  })

  it('returns the earliest due alarm among enabled', () => {
    const now = new Date('2026-02-20T08:00:00')
    const due = computeNextDueAlarm(now, [alarm('a', true, 9, 0), alarm('b', true, 8, 30)])
    expect(due?.alarmId).toBe('b')
  })

  it('prefers snoozed time over scheduled time', () => {
    const now = new Date('2026-02-20T08:00:00')
    const a = alarm('a', true, 9, 0)
    a.runtime.snoozeUntilMs = now.getTime() + 2 * 60_000

    const due = computeNextDueAlarm(now, [a])
    expect(due?.dueAtMs).toBe(a.runtime.snoozeUntilMs)
  })
})
