import { EMPTY, concat, exhaustMap, ignoreElements, map, merge, of, switchMap, take, takeUntil, timer } from 'rxjs'
import type { Observable } from 'rxjs'

// Longest spoken number ends 0.79s into its clip and the earliest starts at 0.08s,
// so calls this far apart never talk over each other.
export const PUNCH_GAP_MS = 750

// No number starts this close to the end of a round, so none talks over the bell.
export const BELL_CLEARANCE_MS = 800

// Time to get set between the starting bell and the first number.
export const BELL_LEAD_MS = 2000

export const CLAP_COUNT = 10
const CLAP_INTERVAL_MS = 1000

export interface Pace {
  punches: number
  delayMs: number
}

export interface RoundPlan {
  count: number
  workMs: number
  restMs: number
}

// Rounds set to null run punches nonstop.
export interface Session {
  rounds: RoundPlan | null
}

export type DrillEvent =
  | { kind: 'punch', punch: number }
  | { kind: 'clap' }
  | { kind: 'work', ms: number, round: number, count: number }
  | { kind: 'rest', ms: number }
  | { kind: 'done' }

const wait = (ms: number) => timer(ms).pipe(ignoreElements())

const callPunches = (
  { punches, delayMs }: Pace,
  pick: () => number,
  firstCallMs = delayMs
): Observable<DrillEvent> =>
  timer(firstCallMs, delayMs).pipe(
    exhaustMap(() =>
      timer(0, PUNCH_GAP_MS).pipe(
        take(punches),
        map((): DrillEvent => ({ kind: 'punch', punch: pick() }))
      )
    )
  )

const followPace = (pace$: Observable<Pace>, pick: () => number) =>
  pace$.pipe(switchMap(pace => callPunches(pace, pick)))

// Subscribes after the lead, so a pace change during it just sets the pace used.
const followPaceAfterBell = (pace$: Observable<Pace>, pick: () => number) =>
  concat(
    wait(BELL_LEAD_MS),
    pace$.pipe(switchMap((pace, i) => callPunches(pace, pick, i === 0 ? 0 : pace.delayMs)))
  )

const claps = (workMs: number): Observable<DrillEvent> =>
  timer(workMs - CLAP_COUNT * CLAP_INTERVAL_MS, CLAP_INTERVAL_MS).pipe(
    take(CLAP_COUNT),
    map((): DrillEvent => ({ kind: 'clap' }))
  )

const runRound = (plan: RoundPlan, round: number, pace$: Observable<Pace>, pick: () => number) =>
  concat(
    of<DrillEvent>({ kind: 'work', ms: plan.workMs, round, count: plan.count }),
    merge(
      followPaceAfterBell(pace$, pick).pipe(takeUntil(timer(plan.workMs - BELL_CLEARANCE_MS))),
      claps(plan.workMs),
      wait(plan.workMs)
    )
  )

const runRounds = (plan: RoundPlan, pace$: Observable<Pace>, pick: () => number) =>
  concat(
    ...Array.from({ length: plan.count }, (_, i) => {
      const round = runRound(plan, i + 1, pace$, pick)
      return i + 1 < plan.count
        ? concat(round, of<DrillEvent>({ kind: 'rest', ms: plan.restMs }), wait(plan.restMs))
        : round
    }),
    of<DrillEvent>({ kind: 'done' })
  )

// Everything timed lives inside switchMap, so stopping cancels calls already in
// progress. Null means stopped. Pace changes only restart the punch timing, never
// the round clock. pace$ must replay its latest value to new subscribers.
export const createDrill = (
  session$: Observable<Session | null>,
  pace$: Observable<Pace>,
  pick: () => number
): Observable<DrillEvent> =>
  session$.pipe(
    switchMap((session) => {
      if (!session) {
        return EMPTY
      }
      return session.rounds
        ? runRounds(session.rounds, pace$, pick)
        : followPace(pace$, pick)
    })
  )
