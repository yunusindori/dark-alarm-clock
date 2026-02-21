import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { LiveClock } from './components/LiveClock'
import { AlarmForm } from './components/AlarmForm/AlarmForm'
import { AlarmStatus } from './components/AlarmStatus'
import { RingingModal } from './components/RingingModal'
import { useNow } from './hooks/useNow'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { useMultiAlarmScheduler } from './hooks/useMultiAlarmScheduler'
import { createDefaultAlarm, type Alarm, type AlarmConfig, type AlarmId } from './state/alarms'
import { normalizeAlarms } from './state/alarmMigrations'
import { audioEngine } from './services/audioEngine'
import { formatDaysShort } from './utils/days'

function App() {
  const now = useNow(1000)

  const [alarms, setAlarms] = useLocalStorageState<Alarm[]>('alarms.v1', [createDefaultAlarm({ label: 'Alarm 1' })], normalizeAlarms)
  const [selectedAlarmId, setSelectedAlarmId] = useLocalStorageState<AlarmId | null>('alarms.selected.v1', alarms[0]?.config.id ?? null)

  const [ringingAlarmId, setRingingAlarmId] = useState<AlarmId | null>(null)
  const [testPlaying, setTestPlaying] = useState(false)

  // Keep selection valid if alarms change
  useEffect(() => {
    if (selectedAlarmId && alarms.some((a) => a.config.id === selectedAlarmId)) return
    setSelectedAlarmId(alarms[0]?.config.id ?? null)
  }, [alarms, selectedAlarmId, setSelectedAlarmId])

  const selectedAlarm = useMemo(() => alarms.find((a) => a.config.id === selectedAlarmId) ?? null, [alarms, selectedAlarmId])
  // Draft editor state (not persisted). Resets when selected alarm changes.
  const [draftConfig, setDraftConfig] = useState<AlarmConfig | null>(selectedAlarm ? selectedAlarm.config : null)

  // Ensure draft stays in sync when selection changes by resetting via key on AlarmForm below.
  const draftKey = selectedAlarm?.config.id ?? 'none'

  const isDirty = useMemo(() => {
    if (!selectedAlarm || !draftConfig) return false
    return JSON.stringify(selectedAlarm.config) !== JSON.stringify(draftConfig)
  }, [selectedAlarm, draftConfig])

  const ringingAlarm = useMemo(() => alarms.find((a) => a.config.id === ringingAlarmId) ?? null, [alarms, ringingAlarmId])

  const enabledCount = useMemo(() => alarms.filter((a) => a.config.enabled).length, [alarms])

  const stopAudio = useCallback(() => {
    audioEngine.stop()
    setTestPlaying(false)
  }, [])

  const onRing = useCallback(
    (alarmId: string) => {
      setAlarms((prev) =>
        prev.map((a) =>
          a.config.id === alarmId
            ? {
                ...a,
                runtime: { ...a.runtime, status: 'ringing', snoozeUntilMs: null },
              }
            : a,
        ),
      )
      setRingingAlarmId(alarmId)
    },
    [setAlarms],
  )

  const { nextDue } = useMultiAlarmScheduler(now, alarms, onRing)

  const nextLabel = useMemo(() => {
    if (!nextDue) return null
    return alarms.find((a) => a.config.id === nextDue.alarmId)?.config.label ?? 'Alarm'
  }, [alarms, nextDue])

  // Start/stop audio when an alarm is ringing
  useEffect(() => {
    if (!ringingAlarm) {
      audioEngine.stop()
      return
    }

    const cfg = ringingAlarm.config
    const durationMs = cfg.playDurationSec === 'untilStop' ? undefined : cfg.playDurationSec * 1000

    audioEngine.play(cfg.toneId, { durationMs, volume: 0.22 }).catch(() => {
      // If audio fails (no gesture), we still show the modal.
    })

    if (typeof durationMs === 'number') {
      const t = window.setTimeout(() => {
        setAlarms((prev) =>
          prev.map((a) =>
            a.config.id === cfg.id && a.runtime.status === 'ringing'
              ? { ...a, runtime: { ...a.runtime, status: a.config.enabled ? 'armed' : 'idle' } }
              : a,
          ),
        )
        setRingingAlarmId(null)
      }, durationMs)
      return () => window.clearTimeout(t)
    }

    return
  }, [ringingAlarm, setAlarms])

  const updateAlarmConfig = useCallback(
    (id: AlarmId, nextConfig: AlarmConfig) => {
      setAlarms((prev) =>
        prev.map((a) => {
          if (a.config.id !== id) return a
          const nextEnabled = nextConfig.enabled
          const nextStatus =
            a.runtime.status === 'ringing'
              ? 'ringing'
              : a.runtime.status === 'snoozed'
                ? 'snoozed'
                : nextEnabled
                  ? 'armed'
                  : 'idle'
          return { ...a, config: nextConfig, runtime: { ...a.runtime, status: nextStatus } }
        }),
      )
    },
    [setAlarms],
  )

  const saveDraft = useCallback(() => {
    if (!selectedAlarm || !draftConfig) return
    updateAlarmConfig(selectedAlarm.config.id, draftConfig)
  }, [selectedAlarm, draftConfig, updateAlarmConfig])

  const cancelDraft = useCallback(() => {
    if (!selectedAlarm) {
      setDraftConfig(null)
      return
    }
    setDraftConfig(selectedAlarm.config)
  }, [selectedAlarm])

  const selectAlarm = useCallback(
    (id: AlarmId) => {
      setSelectedAlarmId(id)
      const saved = alarms.find((a) => a.config.id === id)
      if (saved) setDraftConfig(saved.config)
    },
    [alarms, setSelectedAlarmId],
  )

  const addAlarm = useCallback(() => {
    const nextIndex = alarms.length + 1
    const a = createDefaultAlarm({ label: `Alarm ${nextIndex}` })
    setAlarms((prev) => [...prev, a])
    setSelectedAlarmId(a.config.id)
    setDraftConfig(a.config)
  }, [alarms.length, setAlarms, setSelectedAlarmId])

  const removeAlarm = useCallback(
    (id: AlarmId) => {
      // If removing ringing alarm, stop audio/modal.
      if (ringingAlarmId === id) {
        stopAudio()
        setRingingAlarmId(null)
      }

      setAlarms((prev) => prev.filter((a) => a.config.id !== id))
    },
    [ringingAlarmId, setAlarms, stopAudio],
  )

  const onTestTone = useCallback(() => {
    if (!selectedAlarm) return
    const durationMs = 1500
    setTestPlaying(true)
    audioEngine
      .play(selectedAlarm.config.toneId, { durationMs, volume: 0.2 })
      .catch(() => {
        setTestPlaying(false)
      })
      .finally(() => {
        window.setTimeout(() => setTestPlaying(false), durationMs)
      })
  }, [selectedAlarm])

  const onStopTest = useCallback(() => {
    stopAudio()
  }, [stopAudio])

  const onSnooze = useCallback(() => {
    if (!ringingAlarm) return
    stopAudio()

    const ms = Math.max(1, ringingAlarm.config.snoozeMinutes) * 60_000
    const until = Date.now() + ms

    setAlarms((prev) =>
      prev.map((a) =>
        a.config.id === ringingAlarm.config.id
          ? { ...a, runtime: { ...a.runtime, status: 'snoozed', snoozeUntilMs: until } }
          : a,
      ),
    )
    setRingingAlarmId(null)
  }, [ringingAlarm, setAlarms, stopAudio])

  const stopAlarm = useCallback(
    (alarmId: AlarmId) => {
      stopAudio()
      setAlarms((prev) =>
        prev.map((a) =>
          a.config.id === alarmId
            ? { ...a, runtime: { ...a.runtime, status: a.config.enabled ? 'armed' : 'idle', snoozeUntilMs: null } }
            : a,
        ),
      )
      if (ringingAlarmId === alarmId) setRingingAlarmId(null)
    },
    [ringingAlarmId, setAlarms, stopAudio],
  )

  const onStop = useCallback(() => {
    if (!ringingAlarm) return
    stopAlarm(ringingAlarm.config.id)
  }, [ringingAlarm, stopAlarm])

  const use24h = false

  return (
    <div className="container">
      <div className="header">
        <div className="title">Dark Alarm Clock</div>
        <div className="muted">No-stress theme • Local-only • Synth tones</div>
      </div>

      <div className="mainScroll">
        <div className="page">
          <div className="gridLayout">
            <div className="card">
              <LiveClock now={now} use24h={use24h} />
              <div className="muted" style={{ marginTop: 12 }}>
                Keep this tab open. Some browsers may throttle timers in background tabs.
              </div>
            </div>

            <AlarmStatus enabledCount={enabledCount} nextDueAtMs={nextDue?.dueAtMs ?? null} nextLabel={nextLabel} />
          </div>

          <div className="bottomRow">
            {selectedAlarm ? (
              <AlarmForm
                key={draftKey}
                config={draftConfig ?? selectedAlarm.config}
                onChange={setDraftConfig}
                onSave={saveDraft}
                onCancel={cancelDraft}
                isDirty={isDirty}
                onRemove={() => removeAlarm(selectedAlarm.config.id)}
                onTestTone={onTestTone}
                onStopTest={onStopTest}
                isRinging={Boolean(ringingAlarmId) || testPlaying}
              />
            ) : (
              <section className="card">
                <div className="muted">No alarms yet. Create one.</div>
              </section>
            )}

            <section className="card" aria-label="Alarms list">
              <div className="row row--split">
                <div>
                  <div className="label">Alarms</div>
                  <div className="muted">Select one to edit. Only one will ring at a time (the next due).</div>
                </div>
                <button className="btn btn--primary" type="button" onClick={addAlarm}>
                  + Add alarm
                </button>
              </div>

              <div className="panelScroll" style={{ marginTop: 12 }}>
                <div className="row" style={{ flexWrap: 'wrap' }}>
                  {alarms.map((a) => {
                    const status = a.runtime.status
                    return (
                      <button
                        key={a.config.id}
                        type="button"
                        className="btn"
                        style={{
                          borderColor: a.config.id === selectedAlarmId ? 'rgba(125, 211, 252, 0.45)' : undefined,
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 6,
                          minWidth: 170,
                        }}
                        onClick={() => selectAlarm(a.config.id)}
                      >
                        <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
                          <span className="mono">{String(a.config.label || 'Alarm')}</span>
                          <span className="muted">
                            {String(a.config.time.hour).padStart(2, '0')}:{String(a.config.time.minute).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="muted">{formatDaysShort(a.config.days)}</div>

                        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                          {a.config.enabled ? <span className="pill pill--ok">On</span> : <span className="pill">Off</span>}
                          {status === 'ringing' ? <span className="pill pill--danger">Ringing</span> : null}
                          {status === 'snoozed' ? <span className="pill">Snoozed</span> : null}
                          {status === 'armed' ? <span className="pill">Armed</span> : null}
                          {status === 'snoozed' ? (
                            <button
                              type="button"
                              className="btn btn--danger"
                              onClick={(e) => {
                                e.stopPropagation()
                                stopAlarm(a.config.id)
                              }}
                            >
                              Stop
                            </button>
                          ) : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>

        {ringingAlarm ? <RingingModal open={true} config={ringingAlarm.config} onSnooze={onSnooze} onStop={onStop} /> : null}
      </div>
    </div>
  )
}

export default App
