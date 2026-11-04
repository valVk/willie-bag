# Willie bag

Calls out Cus D'Amato's punch numbers at random while you work the heavy bag.

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # type-checks, then outputs to dist/
```

To train from your phone, run `npm run dev -- --host` and open the Network URL.
Browsers only allow screen wake lock over HTTPS or localhost, so on a plain
local address the screen may turn off during a drill.

## How it works

- `src/drill/drill.ts`: the RxJS timing pipeline, covered by virtual-time tests
- `src/drill/punches.ts`: picks a number from 1 to 8 with equal odds
- `src/drill/voice.ts`: plays the clips through Web Audio
- `src/drill/useDrill.ts`: connects these to Vue state
- `src/drill/PunchChart.vue`: the chart of what each number means
- `src/drill/signals.ts`: synthesizes the 10-second claps
- `public/sounds/` holds the spoken punch numbers, `01` to `08`, and the bells: `bell-1` starts a round, `bell-2` ends one, `bell-3` ends the workout
- `source-audio/boxing-bell.mp3` is the uncut recording the bells came from
