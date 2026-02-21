import type { Alarm, AlarmConfig, AlarmRuntime } from './alarms'
import { createDefaultAlarm, weekdays, everyDay } from './alarms'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeRuntime(raw: unknown, enabled: boolean): AlarmRuntime {
  const base: AlarmRuntime = { status: enabled ? 'armed' : 'idle', snoozeUntilMs: null }
  if (!isObject(raw)) return base

  const status = raw.status
  const snoozeUntilMs = raw.snoozeUntilMs

  const nextStatus: AlarmRuntime['status'] =
    status === 'ringing' || status === 'snoozed' || status === 'armed' || status === 'idle'
      ? status
      : base.status

  return {
    status: nextStatus,
    snoozeUntilMs: typeof snoozeUntilMs === 'number' ? snoozeUntilMs : null,
  }
}

function normalizeDays(raw: unknown) {
  if (!isObject(raw)) return weekdays()

  const mon = Boolean(raw.mon)
  const tue = Boolean(raw.tue)
  const wed = Boolean(raw.wed)
  const thu = Boolean(raw.thu)
  const fri = Boolean(raw.fri)
  const sat = Boolean(raw.sat)
  const sun = Boolean(raw.sun)

  // if it's all false (common for bad/missing data), fall back to weekdays
  if (!(mon || tue || wed || thu || fri || sat || sun)) return weekdays()

  return { mon, tue, wed, thu, fri, sat, sun }
}

export function normalizeAlarms(raw: unknown): Alarm[] {
  if (!Array.isArray(raw)) return [createDefaultAlarm({ label: 'Alarm 1' })]

  const out: Alarm[] = []
  for (const item of raw) {
    if (!isObject(item)) continue
    const configRaw = item.config
    const runtimeRaw = item.runtime

    if (!isObject(configRaw)) continue

    const id = typeof configRaw.id === 'string' ? configRaw.id : undefined
    const label = typeof configRaw.label === 'string' ? configRaw.label : 'Alarm'
    const enabled = Boolean(configRaw.enabled)

    const timeRaw = configRaw.time
    const hour = isObject(timeRaw) && typeof timeRaw.hour === 'number' ? timeRaw.hour : 7
    const minute = isObject(timeRaw) && typeof timeRaw.minute === 'number' ? timeRaw.minute : 30

    const toneId = typeof configRaw.toneId === 'string' ? (configRaw.toneId as AlarmConfig['toneId']) : 'beep'
    const playDurationSec =
      configRaw.playDurationSec === 'untilStop' || typeof configRaw.playDurationSec === 'number'
        ? (configRaw.playDurationSec as AlarmConfig['playDurationSec'])
        : 30
    const snoozeMinutes = typeof configRaw.snoozeMinutes === 'number' ? configRaw.snoozeMinutes : 7

    // migration: add days if missing
    const days = normalizeDays((configRaw as Record<string, unknown>).days)

    const normalized: Alarm = {
      config: {
        id: id ?? createDefaultAlarm().config.id,
        label,
        enabled,
        time: { hour, minute },
        days,
        toneId,
        playDurationSec,
        snoozeMinutes,
      },
      runtime: normalizeRuntime(runtimeRaw, enabled),
    }

    // If user had previously no days field but enabled alarm, we keep it enabled and default to weekdays.
    // (Optionally: everyDay). To be less surprising, keep weekdays.
    out.push(normalized)
  }

  return out.length ? out : [createDefaultAlarm({ label: 'Alarm 1', days: everyDay() })]
}

