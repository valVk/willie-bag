import { BehaviorSubject, Subject } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { describe, expect, it } from 'vitest'
import { BELL_CLEARANCE_MS, BELL_LEAD_MS, PUNCH_GAP_MS, createDrill } from './drill'
import type { DrillEvent, Pace, RoundPlan, Session } from './drill'

const counter = () => {
  let calls = 0
  return () => ++calls
}

const describeEvent = (event: DrillEvent) => {
  switch (event.kind) {
    case 'punch': return event.punch
    case 'work': return `round ${event.round}/${event.count}`
    default: return event.kind
  }
}

interface Script {
  pace: Pace
  sessions?: Array<[number, Session | null]>
  paces?: Array<[number, Pace]>
  untilMs: number
}

// Runs the drill on virtual time and returns [ms, punch or phase] pairs.
const run = ({ pace, sessions = [], paces = [], untilMs }: Script) => {
  const emitted: Array<[number, number | string]> = []
  const scheduler = new TestScheduler(() => {})

  scheduler.run(({ flush }) => {
    const session$ = new Subject<Session | null>()
    const pace$ = new BehaviorSubject<Pace>(pace)
    const subscription = createDrill(session$, pace$, counter()).subscribe(event =>
      emitted.push([scheduler.now(), describeEvent(event)])
    )
    sessions.forEach(([at, session]) => scheduler.schedule(() => session$.next(session), at))
    paces.forEach(([at, next]) => scheduler.schedule(() => pace$.next(next), at))
    scheduler.schedule(() => subscription.unsubscribe(), untilMs)
    flush()
  })

  return emitted
}

const without = (emitted: Array<[number, number | string]>, kind: string) =>
  emitted.filter(([, what]) => what !== kind)

const NONSTOP: Session = { rounds: null }
const ONE = { punches: 1, delayMs: 1000 }

describe('nonstop drill', () => {
  it('stays silent until started', () => {
    expect(run({ pace: ONE, untilMs: 10000 })).toEqual([])
  })

  it('calls one punch every delay, starting after the first delay', () => {
    expect(run({
      pace: { punches: 1, delayMs: 1500 },
      sessions: [[0, NONSTOP]],
      untilMs: 4600
    })).toEqual([
      [1500, 1],
      [3000, 2],
      [4500, 3]
    ])
  })

  it('spaces a series by the punch gap and measures delay from start to start', () => {
    const times = run({
      pace: { punches: 3, delayMs: 3500 },
      sessions: [[0, NONSTOP]],
      untilMs: 7100
    }).map(([at]) => at)

    expect(times).toEqual([
      3500,
      3500 + PUNCH_GAP_MS,
      3500 + 2 * PUNCH_GAP_MS,
      7000
    ])
  })

  it('cancels the rest of a series on stop', () => {
    expect(run({
      pace: { punches: 3, delayMs: 3500 },
      sessions: [[0, NONSTOP], [3600, null]],
      untilMs: 20000
    })).toEqual([[3500, 1]])
  })

  it('restarts on the new timing when the pace changes', () => {
    const emitted = run({
      pace: ONE,
      sessions: [[0, NONSTOP]],
      paces: [[1500, { punches: 1, delayMs: 2000 }]],
      untilMs: 5600
    })

    expect(emitted.map(([at]) => at)).toEqual([1000, 3500, 5500])
  })

  it('can start again after a stop', () => {
    const emitted = run({
      pace: ONE,
      sessions: [[0, NONSTOP], [1100, null], [5000, NONSTOP]],
      untilMs: 6100
    })

    expect(emitted.map(([at]) => at)).toEqual([1000, 6000])
  })
})

describe('rounds', () => {
  const plan: RoundPlan = { count: 2, workMs: 12000, restMs: 2000 }
  const session: Session = { rounds: plan }
  const SLOW = { punches: 1, delayMs: 5000 }

  it('runs the set number of rounds with rest between them, then finishes', () => {
    const emitted = run({
      pace: SLOW,
      sessions: [[0, session]],
      untilMs: 60000
    })

    expect(without(emitted, 'clap')).toEqual([
      [0, 'round 1/2'],
      [2000, 1],
      [7000, 2],
      [12000, 'rest'],
      [14000, 'round 2/2'],
      [16000, 3],
      [21000, 4],
      [26000, 'done']
    ])
  })

  it('claps once a second through the last 10 seconds of each round', () => {
    const claps = run({ pace: SLOW, sessions: [[0, session]], untilMs: 60000 })
      .filter(([, what]) => what === 'clap')
      .map(([at]) => at)

    const lastTen = (end: number) => Array.from({ length: 10 }, (_, i) => end - 10000 + i * 1000)

    expect(claps).toEqual([...lastTen(12000), ...lastTen(26000)])
  })

  it('calls the first number 2 seconds after the bell, whatever the delay', () => {
    for (const delayMs of [1000, 5750]) {
      const emitted = run({
        pace: { punches: 1, delayMs },
        sessions: [[0, { rounds: { ...plan, count: 1 } }]],
        untilMs: 20000
      })

      expect(without(emitted, 'clap')[1]).toEqual([BELL_LEAD_MS, 1])
      expect(without(emitted, 'clap')[2]?.[0]).toBe(BELL_LEAD_MS + delayMs)
    }
  })

  it('uses a pace changed during the lead, without calling early', () => {
    const emitted = run({
      pace: ONE,
      sessions: [[0, { rounds: { ...plan, count: 1 } }]],
      paces: [[500, { punches: 1, delayMs: 3000 }]],
      untilMs: 20000
    })

    expect(without(emitted, 'clap').map(([at]) => at)).toEqual([0, 2000, 5000, 8000, 11000, 12000])
  })

  it('skips rest after a single round', () => {
    const emitted = run({
      pace: SLOW,
      sessions: [[0, { rounds: { ...plan, count: 1 } }]],
      untilMs: 60000
    })

    expect(without(emitted, 'clap').map(([, what]) => what)).toEqual(['round 1/1', 1, 2, 'done'])
  })

  it('calls no punch right before the bell', () => {
    const emitted = run({
      pace: { punches: 1, delayMs: 12000 - BELL_CLEARANCE_MS + 100 - BELL_LEAD_MS },
      sessions: [[0, { rounds: { ...plan, count: 1 } }]],
      untilMs: 20000
    })

    expect(without(emitted, 'clap')).toEqual([
      [0, 'round 1/1'],
      [BELL_LEAD_MS, 1],
      [12000, 'done']
    ])
  })

  it('cuts a series short when the round ends', () => {
    const emitted = run({
      pace: { punches: 3, delayMs: 8500 },
      sessions: [[0, { rounds: { ...plan, count: 1 } }]],
      untilMs: 20000
    })

    expect(without(emitted, 'clap')).toEqual([
      [0, 'round 1/1'],
      [2000, 1],
      [2000 + PUNCH_GAP_MS, 2],
      [2000 + 2 * PUNCH_GAP_MS, 3],
      [10500, 4],
      [12000, 'done']
    ])
  })

  it('keeps the round clock when the pace changes', () => {
    const emitted = run({
      pace: SLOW,
      sessions: [[0, { rounds: { ...plan, count: 1 } }]],
      paces: [[6000, { punches: 1, delayMs: 2000 }]],
      untilMs: 20000
    })

    expect(without(emitted, 'clap')).toEqual([
      [0, 'round 1/1'],
      [2000, 1],
      [8000, 2],
      [10000, 3],
      [12000, 'done']
    ])
  })

  it('stays silent after a stop during rest', () => {
    const emitted = run({
      pace: SLOW,
      sessions: [[0, session], [13000, null]],
      untilMs: 60000
    })

    expect(emitted.at(-1)).toEqual([12000, 'rest'])
  })

  it('can run again after finishing', () => {
    const emitted = run({
      pace: SLOW,
      sessions: [[0, { rounds: { ...plan, count: 1 } }], [20000, { rounds: { ...plan, count: 1 } }]],
      untilMs: 33000
    })

    expect(without(emitted, 'clap').filter(([, what]) => typeof what === 'string')).toEqual([
      [0, 'round 1/1'],
      [12000, 'done'],
      [20000, 'round 1/1'],
      [32000, 'done']
    ])
  })
})
