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

The app shows this on a drawn bag: press **Punch chart** at the bottom of the controls, any time, even during a drill.

## Using it

Set these, then press **Start**:

- **Calls:** Combos, Two (only the two-punch combinations) or One (a nonstop flow of single numbers, with no "rest").
- **Number mix:** Equal, the default, gives all 8 numbers close to equal work in every mode. Natural uses the mix described below. You can change this during a drill.
- **Time between calls:** from the start of one call to the start of the next. You can change this and the calls during a drill without resetting the round clock.
- **Rounds:** 1 to 12, or Nonstop for no rounds and no bells.
- **Length:** 1, 2, 3 or 4 minutes per round.
- **Rest:** 30 seconds or 1 minute between rounds.

Rounds, Length and Rest lock while a drill is running.

### Combos

Cus called set combinations rather than random numbers. Combos plays a weighted list from `src/drill/combos.ts`, with numbers 0.75 s apart, never the same combination twice in a row, and says "rest" after each. Two works the same way, using only the two-punch combinations:

- **From a recording of his sixth bag exercise:** combinations such as 5-2 and 6-1-2, weighted by how often he called them. They were taken from a machine transcript, so the counts are approximate.
- **Added jabs:** that recording has no jabs, so combinations such as 7-2 and 8-1-2 are added to train every target. These aren't from Cus.

With the Equal mix, it also uses added uppercut and body combinations such as 3-4 and 7-6-5, and favors combinations made of the numbers called least so far. These aren't from Cus either, and the mix moves further from the recording. With Natural, it uses only the two lists above with their weights.

### One

One keeps going without a break. Each number can only lead to punches that naturally follow it: after 5 comes 2, 1 or 6. It remembers its last 6 moves and picks a different branch, so a run doesn't get stuck on one path such as 1-2-1-2. With the Equal mix, it also favors the numbers called least so far, so all 8 get close to equal work. The moves are in `src/drill/flow.ts`.

### What you'll hear

| Sound | When |
| ----- | ---- |
| 1 ding | A round starts. The first number comes 2 seconds later. |
| "Rest" | After each combination in Combos and Two. |
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

To train from your phone, run `npm run dev -- --host` and open the Network URL. Browsers only allow screen wake lock over HTTPS or localhost, so on a plain local address the screen may turn off during a drill. The published site uses HTTPS, so it doesn't have this limit.

## Releases and GitHub Pages

The app is published at https://valvk.github.io/willie-bag/.

- `npm run release:patch` (or `release:minor`, `release:major`) bumps the version in `package.json`, commits `chore(release): vX.Y.Z`, tags `vX.Y.Z` and pushes. Run it with a clean working tree.
- The tag starts `.github/workflows/release.yml`. It runs the type check and unit tests (`ci.yml`), creates a GitHub release with generated notes, then `pages.yml` builds with the repository base path and deploys to Pages.
- `pages.yml` can also be run by hand from the Actions tab to redeploy without a new version.

Pages needs setting up once in the repository settings:

1. **Settings > Pages > Build and deployment:** set Source to **GitHub Actions**.
2. **Settings > Environments > github-pages > Deployment branches and tags:** add a tag rule for `v*`. Without it, tag deployments are rejected by the environment's protection rules.

## Install it

The app can be installed from the published site and works with no signal once it has loaded:

- **iPhone:** in Safari, tap Share, then Add to Home Screen.
- **Android or desktop Chrome:** choose Install from the browser menu.

A new version downloads in the background and applies the next time the app is reopened, so it never reloads during a drill.

## How it works

Built with Vue 3, Nuxt UI and RxJS.

- `src/App.vue`: the screen and its controls
- `src/drill/drill.ts`: the RxJS timing pipeline for calls, rounds and claps, covered by virtual-time tests
- `src/drill/useDrill.ts`: connects the drill to Vue state, sound and screen wake lock
- `src/drill/combos.ts`: the combination list and how it's picked
- `src/drill/flow.ts`: which punch can follow which, for the nonstop One mode
- `src/drill/balance.ts`: tracks calls per number for the Equal mix
- `src/drill/punches.ts`: picks a number from 1 to 8 with equal odds
- `src/drill/voice.ts`: plays the clips through Web Audio
- `src/drill/signals.ts`: synthesizes the claps
- `src/drill/PunchChart.vue`: the chart of what each number means
- `public/sounds/`: the spoken numbers, `01` to `08`, and the bells, `bell-1` to `bell-3`, and `rest`
- `public/icon.svg`: source of the app icons. Run `npm run icons` after changing it.
- `source-audio/boxing-bell.mp3`: the uncut recording the bells came from. It isn't shipped with the app.

Timing values such as the 2-second wait after the bell are constants at the top of `src/drill/drill.ts`.
