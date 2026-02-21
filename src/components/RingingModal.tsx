import type { AlarmConfig } from '../state/alarms'

export type RingingModalProps = {
  open: boolean
  config: AlarmConfig
  onSnooze: () => void
  onStop: () => void
}

export function RingingModal({ open, config, onSnooze, onStop }: RingingModalProps) {
  if (!open) return null

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Alarm ringing">
      <div className="modal">
        <div className="modal__title">{config.label || 'Alarm'}</div>
        <div className="modal__subtitle">Wake up gently. You’ve got this.</div>

        <div className="modal__info">
          <div>
            <div className="label">Tone</div>
            <div className="mono">{config.toneId}</div>
          </div>
          <div>
            <div className="label">Snooze</div>
            <div className="mono">{config.snoozeMinutes} min</div>
          </div>
        </div>

        <div className="row" style={{ marginTop: 14, gap: 10 }}>
          <button className="btn btn--primary" onClick={onSnooze}>
            Snooze
          </button>
          <button className="btn btn--danger" onClick={onStop}>
            Stop
          </button>
        </div>

        <div className="muted" style={{ marginTop: 10 }}>
          If audio didn’t start, click “Stop” then “Test tone” in settings to allow audio.
        </div>
      </div>
    </div>
  )
}
