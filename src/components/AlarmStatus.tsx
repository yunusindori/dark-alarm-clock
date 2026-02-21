export type AlarmStatusProps = {
  enabledCount: number
  nextDueAtMs: number | null
  nextLabel: string | null
}

export function AlarmStatus({ enabledCount, nextDueAtMs, nextLabel }: AlarmStatusProps) {
  const nextTime = nextDueAtMs ? new Date(nextDueAtMs) : null

  return (
    <section className="card" aria-label="Alarm status">
      <div className="row row--split">
        <div>
          <div className="label">Status</div>
          <div className="statusLine">
            {enabledCount > 0 ? <span className="pill pill--ok">{enabledCount} enabled</span> : <span className="pill">All off</span>}
          </div>
          {nextLabel ? <div className="muted" style={{ marginTop: 6 }}>Next: {nextLabel}</div> : null}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="label">Next</div>
          <div className="mono">
            {nextTime ? nextTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '—'}
          </div>
          {nextTime ? <div className="muted">{nextTime.toLocaleDateString()}</div> : null}
        </div>
      </div>
    </section>
  )
}
