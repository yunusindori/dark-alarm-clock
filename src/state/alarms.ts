import type { TimeOfDay } from '../utils/time'
import type { ToneId } from '../services/toneCatalog'

export type AlarmId = string

export type DaysOfWeek = {
  mon: boolean
  tue: boolean
  wed: boolean
  thu: boolean
  fri: boolean
  sat: boolean
  sun: boolean
}

export function everyDay(): DaysOfWeek {
  return { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true }
}

export function weekdays(): DaysOfWeek {
  return { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }
}

export function weekend(): DaysOfWeek {
  return { mon: false, tue: false, wed: false, thu: false, fri: false, sat: true, sun: true }
}

export function isAnyDaySelected(d: DaysOfWeek): boolean {
  return d.mon || d.tue || d.wed || d.thu || d.fri || d.sat || d.sun
}

export type AlarmConfig = {
  id: AlarmId
  label: string
  enabled: boolean
  time: TimeOfDay
  days: DaysOfWeek
  toneId: ToneId
  playDurationSec: number | 'untilStop'
  snoozeMinutes: number
}

export type AlarmRuntime = {
  status: 'idle' | 'armed' | 'snoozed' | 'ringing'
  snoozeUntilMs: number | null
}

export type Alarm = {
  config: AlarmConfig
  runtime: AlarmRuntime
}

export function createAlarmId(): AlarmId {
  // good-enough unique id for local app
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function createDefaultAlarm(partial?: Partial<AlarmConfig>): Alarm {
  const id = partial?.id ?? createAlarmId()
  return {
    config: {
      id,
      label: partial?.label ?? 'Alarm',
      enabled: partial?.enabled ?? false,
      time: partial?.time ?? { hour: 7, minute: 30 },
      days: partial?.days ?? weekdays(),
      toneId: partial?.toneId ?? 'beep',
      playDurationSec: partial?.playDurationSec ?? 30,
      snoozeMinutes: partial?.snoozeMinutes ?? 7,
    },
    runtime: {
      status: partial?.enabled ? 'armed' : 'idle',
      snoozeUntilMs: null,
    },
  }
}
