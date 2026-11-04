import { computed, onScopeDispose, ref } from 'vue'
import { BehaviorSubject, Subject } from 'rxjs'
import { useIntervalFn, useWakeLock } from '@vueuse/core'
import { createDrill } from './drill'
import type { Pace, Session } from './drill'
import { randomPunch } from './punches'
import { createVoice } from './voice'

export const MODES = {
  one: { label: 'One', punches: 1, defaultDelay: 1.5, minDelay: 1 },
  two: { label: 'Two', punches: 2, defaultDelay: 2.5, minDelay: 1.75 },
  series: { label: 'Series', punches: 3, defaultDelay: 3.5, minDelay: 2.5 }
} as const

export type Mode = keyof typeof MODES

const CLAP_WARNING_MS = 10000

const formatClock = (ms: number) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export const useDrill = () => {
  const mode = ref<Mode>('one')
  const delay = ref<number>(MODES.one.defaultDelay)
  // Zero rounds means nonstop.
  const roundCount = ref(3)
  const roundMinutes = ref(3)
  const restSeconds = ref(60)
  const running = ref(false)
  const ready = ref(false)
  const failed = ref(false)
  const call = ref<{ id: number, punch: number } | null>(null)

  const phase = ref<{ kind: 'work' | 'rest', endsAt: number } | null>(null)
  const round = ref<{ number: number, count: number } | null>(null)
  const finished = ref(false)

  const minDelay = computed(() => MODES[mode.value].minDelay)
  const resting = computed(() => phase.value?.kind === 'rest')

  const now = ref(Date.now())
  useIntervalFn(() => { now.value = Date.now() }, 250)
  const clock = computed(() =>
    phase.value ? formatClock(phase.value.endsAt - now.value) : null
  )
  const closing = computed(() =>
    phase.value?.kind === 'work' && phase.value.endsAt - now.value <= CLAP_WARNING_MS
  )

  const voice = createVoice()
  voice.load().then(
    () => { ready.value = true },
    () => { failed.value = true }
  )

  const wakeLock = useWakeLock()
  const currentPace = (): Pace => ({
    punches: MODES[mode.value].punches,
    delayMs: delay.value * 1000
  })
  const session$ = new Subject<Session | null>()
  const pace$ = new BehaviorSubject<Pace>(currentPace())
  let callId = 0

  const clearDisplay = () => {
    call.value = null
    phase.value = null
    round.value = null
  }

  const finish = () => {
    running.value = false
    wakeLock.release().catch(() => {})
  }

  const subscription = createDrill(session$, pace$, randomPunch).subscribe((event) => {
    switch (event.kind) {
      case 'punch':
        call.value = { id: ++callId, punch: event.punch }
        voice.say(event.punch)
        break
      case 'clap':
        voice.clap()
        break
      case 'work':
        call.value = null
        phase.value = { kind: 'work', endsAt: Date.now() + event.ms }
        round.value = { number: event.round, count: event.count }
        voice.bell(1)
        break
      case 'rest':
        call.value = null
        phase.value = { kind: 'rest', endsAt: Date.now() + event.ms }
        voice.bell(2)
        break
      case 'done':
        clearDisplay()
        finished.value = true
        voice.bell(3)
        finish()
        break
    }
  })

  const applyPace = () => pace$.next(currentPace())

  const start = () => {
    voice.unlock()
    clearDisplay()
    finished.value = false
    running.value = true
    // Keeps the screen awake where supported. The drill still runs without it.
    if (wakeLock.isSupported.value) {
      wakeLock.request('screen').catch(() => {})
    }
    applyPace()
    session$.next({
      rounds: roundCount.value
        ? {
            count: roundCount.value,
            workMs: roundMinutes.value * 60000,
            restMs: restSeconds.value * 1000
          }
        : null
    })
  }

  const stop = () => {
    session$.next(null)
    clearDisplay()
    finished.value = false
    finish()
  }

  const setMode = (next: Mode) => {
    mode.value = next
    delay.value = MODES[next].defaultDelay
    applyPace()
  }

  onScopeDispose(() => {
    subscription.unsubscribe()
    wakeLock.release().catch(() => {})
  })

  return {
    mode,
    delay,
    roundCount,
    roundMinutes,
    restSeconds,
    minDelay,
    running,
    resting,
    finished,
    closing,
    clock,
    round,
    ready,
    failed,
    call,
    start,
    stop,
    setMode,
    applyPace
  }
}
