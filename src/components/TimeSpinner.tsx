import type { TimeOfDay } from '../utils/time'
import { pad2 } from '../utils/time'

export type TimeSpinnerProps = {
  value: TimeOfDay
  onChange: (t: TimeOfDay) => void
  disabled?: boolean
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

export function TimeSpinner({ value, onChange, disabled }: TimeSpinnerProps) {
  const setHour = (h: number) => onChange({ ...value, hour: mod(h, 24) })
  const setMinute = (m: number) => onChange({ ...value, minute: mod(m, 60) })

  return (
    <div className="timeSpinner" aria-label="Time picker">
      <label className="field" style={{ margin: 0 }}>
        <span className="field__label">Hour</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={23}
          step={1}
          value={value.hour}
          disabled={disabled}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (Number.isNaN(n)) return
            setHour(clamp(n, 0, 23))
          }}
          onWheel={(e) => {
            if (disabled) return
            e.preventDefault()
            e.stopPropagation()
            // Blur helps prevent the page from scrolling in some browsers when the input is focused.
            e.currentTarget.blur()
            setHour(value.hour + (e.deltaY < 0 ? 1 : -1))
          }}
        />
      </label>

      <div className="timeSpinner__sep" aria-hidden="true">
        :
      </div>

      <label className="field" style={{ margin: 0 }}>
        <span className="field__label">Minute</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          step={1}
          value={value.minute}
          disabled={disabled}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (Number.isNaN(n)) return
            setMinute(clamp(n, 0, 59))
          }}
          onWheel={(e) => {
            if (disabled) return
            e.preventDefault()
            e.stopPropagation()
            e.currentTarget.blur()
            setMinute(value.minute + (e.deltaY < 0 ? 1 : -1))
          }}
        />
        <div className="field__hint">{pad2(value.hour)}:{pad2(value.minute)}</div>
      </label>
    </div>
  )
}
