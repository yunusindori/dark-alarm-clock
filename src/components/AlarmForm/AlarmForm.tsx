import type { AlarmConfig } from '../../state/alarms'
import { TONES } from '../../services/toneCatalog'
import { TimeSpinner } from '../TimeSpinner'
import { DaysOfWeekPicker } from '../DaysOfWeekPicker'
import { everyDay, weekdays, weekend } from '../../state/alarms'

export type AlarmFormProps = {
  config: AlarmConfig
  onChange: (next: AlarmConfig) => void
  onRemove: () => void
  onTestTone: () => void
  onStopTest: () => void
  isRinging: boolean
}

const DURATION_OPTIONS: Array<{ label: string; value: AlarmConfig['playDurationSec'] }> = [
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '60 seconds', value: 60 },
  { label: '2 minutes', value: 120 },
  { label: 'Until you stop it', value: 'untilStop' },
]

const SNOOZE_OPTIONS_MIN = [3, 5, 7, 10, 15]

export function AlarmForm({ config, onChange, onRemove, onTestTone, onStopTest, isRinging }: AlarmFormProps) {
  return (
    <section className="card" aria-label={`Alarm settings: ${config.label}`}>
      <div className="row row--split">
        <div>
          <div className="label">Alarm</div>
          <div className="muted">Set a time, pick a tone, and it’ll ring while this tab is open.</div>
        </div>
        <label className="switch" title={config.enabled ? 'Disable alarm' : 'Enable alarm'}>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
            aria-label={config.enabled ? 'Alarm enabled' : 'Alarm disabled'}
          />
          <span className="switch__track" />
        </label>
      </div>

      <div className="grid">
        <label className="field">
          <span className="field__label">Label</span>
          <input
            type="text"
            value={config.label}
            onChange={(e) => onChange({ ...config, label: e.target.value })}
            placeholder="Morning"
          />
        </label>

        <div className="field">
          <span className="field__label">Time</span>
          <TimeSpinner value={config.time} onChange={(t) => onChange({ ...config, time: t })} />
        </div>

        <label className="field">
          <span className="field__label">Tone</span>
          <select value={config.toneId} onChange={(e) => onChange({ ...config, toneId: e.target.value as AlarmConfig['toneId'] })}>
            {TONES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="field__hint">{TONES.find((t) => t.id === config.toneId)?.description}</span>
        </label>

        <label className="field">
          <span className="field__label">Play for</span>
          <select
            value={String(config.playDurationSec)}
            onChange={(e) => {
              const v = e.target.value
              const next: AlarmConfig['playDurationSec'] = v === 'untilStop' ? 'untilStop' : Number(v)
              onChange({ ...config, playDurationSec: next })
            }}
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field field--compact">
          <span className="field__label">Snooze</span>
          <select
            className="select--compact"
            value={String(config.snoozeMinutes)}
            onChange={(e) => onChange({ ...config, snoozeMinutes: Number(e.target.value) })}
          >
            {SNOOZE_OPTIONS_MIN.map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span className="field__label">Days</span>
          <DaysOfWeekPicker value={config.days} onChange={(days) => onChange({ ...config, days })} />
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn--ghost" onClick={() => onChange({ ...config, days: weekdays() })}>
              Weekdays
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => onChange({ ...config, days: weekend() })}>
              Weekend
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => onChange({ ...config, days: everyDay() })}>
              Every day
            </button>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 12, justifyContent: 'space-between' }}>
        <div className="row">
          <button type="button" className="btn" onClick={onTestTone} disabled={isRinging}>
            Test tone
          </button>
          <button type="button" className="btn btn--ghost" onClick={onStopTest}>
            Stop test
          </button>
        </div>

        <button type="button" className="btn btn--danger" onClick={onRemove} disabled={isRinging}>
          Remove
        </button>
      </div>

      <div className="muted" style={{ marginTop: 10 }}>
        Tip: browsers require interaction before audio can play. Use “Test tone” once after loading the page.
      </div>
    </section>
  )
}
