import { formatTime12h, formatTime24h } from '../utils/time'

export type LiveClockProps = {
  now: Date
  use24h?: boolean
}

export function LiveClock({ now, use24h }: LiveClockProps) {
  const text = use24h ? formatTime24h(now) : formatTime12h(now)

  return (
    <div className="liveClock" aria-label="Current time">
      <div className="liveClock__time">{text}</div>
      <div className="liveClock__date">
        {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}

