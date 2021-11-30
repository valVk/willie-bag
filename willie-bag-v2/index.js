import { timer, fromEvent, merge, EMPTY } from 'rxjs';
import { scan, mapTo, takeWhile, startWith, switchMap } from 'rxjs/operators';


const countdown = document.getElementById(
  'countdown'
);

const message = document.getElementById(
  'message'
);

const startButton = document.getElementById(
  'start'
);

const pauseButton = document.getElementById(
  'pause'
);

const counter$ = timer(0, 1000);
const startClick$ = fromEvent(startButton, 'click')
const pauseClick$ = fromEvent(pauseButton, 'click')

const COUNTDOWN_FROM = 10;
merge(
  startClick$.pipe(mapTo(true)),
  pauseClick$.pipe(mapTo(false)),
).pipe(
  switchMap((shouldStart) => shouldStart ? counter$ : EMPTY),
  mapTo(-1),
  scan((acc, curr) => acc + curr, 10),
  takeWhile(v => v >= 0),
  startWith(COUNTDOWN_FROM)
).subscribe(v => {
  countdown.innerHTML = v;
  if(!v) {
    message.innerHTML = 'Liftoff!';
  }
});
