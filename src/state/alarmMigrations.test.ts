import { describe, expect, it } from 'vitest'
import { normalizeAlarms } from './alarmMigrations'

describe('normalizeAlarms', () => {
  it('recovers an alarm persisted as ringing after a page reload', () => {
    const [alarm] = normalizeAlarms([
      {
        config: {
          id: 'morning',
          label: 'Morning',
          enabled: true,
          time: { hour: 7, minute: 30 },
          days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true },
          toneId: 'beep',
          playDurationSec: 30,
          snoozeMinutes: 5,
        },
        runtime: { status: 'ringing', snoozeUntilMs: null },
      },
    ])

    expect(alarm.runtime).toEqual({ status: 'armed', snoozeUntilMs: null })
  })

  it('recovers a disabled alarm as idle', () => {
    const [alarm] = normalizeAlarms([
      {
        config: {
          id: 'disabled',
          label: 'Disabled',
          enabled: false,
          time: { hour: 7, minute: 30 },
          days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true },
          toneId: 'beep',
          playDurationSec: 30,
          snoozeMinutes: 5,
        },
        runtime: { status: 'ringing', snoozeUntilMs: null },
      },
    ])

    expect(alarm.runtime).toEqual({ status: 'idle', snoozeUntilMs: null })
  })
})
