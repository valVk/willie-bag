import { PUNCH_COUNT } from './punches'
import { playClap } from './signals'

const PUNCH_CLIPS = Array.from({ length: PUNCH_COUNT }, (_, i) => `0${i + 1}`)
const BELL_CLIPS = ['bell-1', 'bell-2', 'bell-3']
const REST_CLIP = 'rest'

export type BellDings = 1 | 2 | 3

// Web Audio plays decoded buffers with no load delay, unlike a new Audio() per call.
export const createVoice = () => {
  const context = new AudioContext()
  const clips = new Map<string, AudioBuffer>()

  const loadClip = async (clip: string) => {
    const response = await fetch(`${import.meta.env.BASE_URL}sounds/${clip}.mp3`)
    if (!response.ok) {
      throw new Error(`Sound ${clip} failed with status ${response.status}`)
    }
    clips.set(clip, await context.decodeAudioData(await response.arrayBuffer()))
  }

  const load = () =>
    Promise.all([...PUNCH_CLIPS, ...BELL_CLIPS, REST_CLIP].map(loadClip))

  // Browsers keep audio suspended until a user gesture, so call this from a click.
  const unlock = () => context.resume()

  const play = (clip: string) => {
    const source = context.createBufferSource()
    source.buffer = clips.get(clip)!
    source.connect(context.destination)
    source.start()
  }

  return {
    load,
    unlock,
    say: (punch: number) => play(`0${punch}`),
    bell: (dings: BellDings) => play(`bell-${dings}`),
    sayRest: () => play(REST_CLIP),
    clap: () => playClap(context)
  }
}
