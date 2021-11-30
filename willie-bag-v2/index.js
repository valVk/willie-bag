import { timer, fromEvent, merge, EMPTY, of } from 'rxjs';
import { mapTo, map, switchMap, delay, concatMap, exhaustMap } from 'rxjs/operators';


const playSound = (punchNumber) => {
  const audio = new Audio(`./assets/sounds/0${punchNumber}.mp3`);
  audio.play();
};

const random = (elementsAmount) => {
  const uint8Array = new Uint8Array(elementsAmount)
  window.crypto.getRandomValues(uint8Array)
  return uint8Array.reduce((acc, v) => {
    const punchNumber = summator(v);

    return [...acc, (punchNumber === 0 || punchNumber === 9 || punchNumber === 10)
      ? 1
      : punchNumber]
  }, []);
}


const summator = (value) => {
  let sum = 0
  while (value) {
    sum += value % 10
    value = Math.floor(value / 10)
    if (sum > 10) {
      sum = summator(sum)
    }
  }
  return sum
}

const startButton = document.getElementById(
  'start'
);

const stopButton = document.getElementById(
  'stop'
);

const ELEMENTS_AMOUNT = 3;
const CONTER_TICKS_EVERY = 4000;
const DELAY_WITHIN_COUNTER = CONTER_TICKS_EVERY / ELEMENTS_AMOUNT;

const counter$ = timer(0, CONTER_TICKS_EVERY);
const startClick$ = fromEvent(startButton, 'click')
const stopClick$ = fromEvent(stopButton, 'click')

merge(
  startClick$.pipe(mapTo(true)),
  stopClick$.pipe(mapTo(false)),
).pipe(
  switchMap((shouldStart) => shouldStart ? counter$ : EMPTY),
  exhaustMap(() => of(...random(ELEMENTS_AMOUNT))),
  concatMap((v) => {
    return of(v).pipe(
      delay(DELAY_WITHIN_COUNTER),
      map(() => playSound(v))
    );
  }),
).subscribe();
