import { PUNCH_COUNT } from './punches'

// Keeps the first few calls from swinging the shares too hard.
const SMOOTHING = 8

// How strongly a number above its fair share is held back.
const STRENGTH = 40

// Limits how far a number behind its fair share is favored, which keeps pickers' weights
// small enough for a random draw however far behind it falls.
const MIN_PENALTY = 0.001

// Counts calls per number, so pickers can favor the numbers called least so far.
export const createCallBalance = () => {
  const calls = Array.from({ length: PUNCH_COUNT + 1 }, () => 0)
  let total = 0

  return {
    record: (punch: number) => {
      calls[punch] = calls[punch]! + 1
      total += 1
    },
    // Above 1 for a number over its fair share, below 1 for one under it. Being relative to
    // the fair share, it stays meaningful however long a drill runs.
    penalty: (punch: number) => {
      const fairShare = total / PUNCH_COUNT
      return Math.max(MIN_PENALTY, ((calls[punch]! + SMOOTHING) / (fairShare + SMOOTHING)) ** STRENGTH)
    }
  }
}
