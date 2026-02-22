# Dark Alarm Clock (React)

A simple React alarm clock with a low-glare dark theme, for the ones who tend to fall asleep at their desk.

https://yunusindori.github.io/dark-alarm-clock/

## Features

- Live clock + date
- Multiple alarms
  - Add/remove alarms
  - Select an alarm to edit
- Time picker with rolling inputs
  - Type values or use mouse wheel/spinner arrows for hour/minute
- Per-alarm schedule
  - Select days of week (with quick presets: Weekdays / Weekend / Every day)
- Tone selection (synthesized via Web Audio)
- Choose how long to play the tone (10s / 30s / 60s / 2m / until stopped)
- Snooze (3–15 minutes)
  - Snoozed status is shown in the alarm list
  - You can stop a snoozed alarm from the list
- Settings persist in `localStorage`

## Important: Save / Apply workflow

Edits in the alarm editor are **not persisted immediately**.

- Make changes in the editor (this is a local draft)
- Click **Save / Apply** to store the changes to `localStorage`
- Click **Cancel** to discard draft changes and revert to the last saved state

This prevents inadvertent changes.

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
