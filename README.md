# Willie bag

Calls out Cus D'Amato's punch numbers at random while you work the heavy bag, with a boxing round timer built in.

Cus built the original Willie bag from mattresses, drew a boxer's outline on it and numbered the targets. It's named after Willie Pastrano, whom José Torres was preparing to fight in 1965.

## Punch numbers

| Number | Punch |
| ------ | ----- |
| 1 | Left hook to the head |
| 2 | Cross or right hook to the head |
| 3 | Left uppercut |
| 4 | Right uppercut |
| 5 | Left hook to the body |
| 6 | Right hook to the body |
| 7 | Jab to the head |
| 8 | Jab to the body |

The app shows this on a drawn bag: press **What the numbers mean** on the main screen.

## Using it

Set these, then press **Start**:

- **Punches per call:** One, Two or Series (three numbers, 0.75 s apart).
- **Time between calls:** from the start of one call to the start of the next. You can change this and punches per call during a drill without resetting the round clock.
- **Rounds:** 1 to 12, or Nonstop for no rounds and no bells.
- **Length:** 1, 2 or 3 minutes per round.
- **Rest:** 30 seconds or 1 minute between rounds.

Rounds, Length and Rest lock while a drill is running.

### What you'll hear

| Sound | When |
| ----- | ---- |
| 1 ding | A round starts. The first number comes 2 seconds later. |
| Claps | Once a second through the last 10 seconds of a round. |
| 2 dings | A round ends and rest begins. |
| 3 dings | The last round ends. The drill stops by itself. |

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # type-checks, then outputs to dist/
```

To train from your phone, run `npm run dev -- --host` and open the Network URL. Browsers only allow screen wake lock over HTTPS or localhost, so on a plain local address the screen may turn off during a drill.

## How it works

Built with Vue 3, Nuxt UI and RxJS.

- `src/App.vue`: the screen and its controls
- `src/drill/drill.ts`: the RxJS timing pipeline for calls, rounds and claps, covered by virtual-time tests
- `src/drill/useDrill.ts`: connects the drill to Vue state, sound and screen wake lock
- `src/drill/punches.ts`: picks a number from 1 to 8 with equal odds
- `src/drill/voice.ts`: plays the clips through Web Audio
- `src/drill/signals.ts`: synthesizes the claps
- `src/drill/PunchChart.vue`: the chart of what each number means
- `public/sounds/`: the spoken numbers, `01` to `08`, and the bells, `bell-1` to `bell-3`
- `source-audio/boxing-bell.mp3`: the uncut recording the bells came from. It isn't shipped with the app.

Timing values such as the 2-second wait after the bell are constants at the top of `src/drill/drill.ts`.
