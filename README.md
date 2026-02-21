# Dark Alarm Clock (React)

A simple React alarm clock with a low-glare dark theme.

## Features

- Live clock + date
- Set an alarm time (HH:MM)
- Select a tone (synthesized via Web Audio)
- Choose how long to play the tone (10s / 30s / 60s / 2m / until stopped)
- Snooze (3–15 minutes)
- Test tone button (helps satisfy browser “user gesture” audio requirement)
- Persists settings in `localStorage`

## Run locally

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test:run
```

## Notes / limitations

- Browsers may throttle timers in background tabs. For best reliability, keep the tab open.
- Audio playback typically requires a user interaction after load. Click **Test tone** once.
