import type { DaysOfWeek } from '../state/alarms'
import { DAY_KEYS } from '../utils/days'

const LABELS: Record<keyof DaysOfWeek, string> = {
  mon: 'M',
  tue: 'T',
  wed: 'W',
  thu: 'T',
  fri: 'F',
  sat: 'S',
  sun: 'S',
}

const TITLES: Record<keyof DaysOfWeek, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

export type DaysOfWeekPickerProps = {
  value: DaysOfWeek
  onChange: (next: DaysOfWeek) => void
}

export function DaysOfWeekPicker({ value, onChange }: DaysOfWeekPickerProps) {
  return (
    <div className="dow" role="group" aria-label="Days of week">
      {DAY_KEYS.map((k) => {
        const selected = value[k]
        return (
          <button
            key={k}
            type="button"
            className={selected ? 'dow__day dow__day--on' : 'dow__day'}
            onClick={() => onChange({ ...value, [k]: !selected })}
            aria-pressed={selected}
            title={TITLES[k]}
          >
            {LABELS[k]}
          </button>
        )
      })}
    </div>
  )
}

