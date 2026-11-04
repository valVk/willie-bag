import { createCallBalance } from './balance'
import { PUNCH_COUNT, randomInt } from './punches'

// Which punches can follow each number, and how often. Five of the eight numbers are thrown
// with the left, so equal work needs some left-after-left moves as well as hand switches.
const FLOW: Readonly<Record<number, Readonly<Record<number, number>>>> = {
  1: { 2: 4, 6: 3, 4: 2, 5: 1 },
  2: { 1: 2, 5: 2, 7: 2, 8: 2, 3: 2 },
  3: { 2: 3, 4: 2, 1: 2, 6: 1 },
  4: { 1: 3, 5: 2, 7: 2, 8: 2, 3: 1 },
  5: { 2: 4, 1: 3, 6: 3 },
  6: { 1: 3, 5: 2, 7: 2, 8: 2, 2: 1 },
  7: { 2: 3, 1: 2, 8: 2, 6: 1, 4: 1 },
  8: { 2: 3, 1: 2, 3: 2, 6: 1, 7: 1 }
}

// How many past moves can't be taken again, which is what keeps a run from looping.
export const MOVE_MEMORY = 6

export const followUps = (punch: number) => Object.keys(FLOW[punch]!).map(Number)

// Keeps integer weights precise enough after dividing them for balance.
const WEIGHT_SCALE = 1000

// Each call walks one move from the last punch. When balanced, it favors the numbers called
// least so far so that every target gets close to the same work, even within one round.
export const createFlowWalker = (
  random: (max: number) => number = randomInt,
  balanced = true
) => {
  let current = random(PUNCH_COUNT) + 1
  let recentMoves: string[] = []
  let isFirst = true
  const balance = createCallBalance()
  balance.record(current)

  const weightOf = (option: number) => {
    const penalty = balanced ? balance.penalty(option) : 1
    return Math.max(1, Math.round(WEIGHT_SCALE * FLOW[current]![option]! / penalty))
  }

  const pickWeighted = (options: number[]) => {
    const weights = options.map(weightOf)
    let roll = random(weights.reduce((total, weight) => total + weight, 0))
    return options.find((_, i) => (roll -= weights[i]!) < 0)!
  }

  const moveName = (to: number) => `${current}-${to}`

  return () => {
    if (isFirst) {
      isFirst = false
      return [current]
    }

    const options = followUps(current)
    const fresh = options.filter(option => !recentMoves.includes(moveName(option)))
    // When every move was used recently, the one used longest ago is the least loopy.
    const next = fresh.length > 0
      ? pickWeighted(fresh)
      : options.reduce((oldest, option) =>
          recentMoves.indexOf(moveName(option)) < recentMoves.indexOf(moveName(oldest)) ? option : oldest)

    recentMoves = [...recentMoves, moveName(next)].slice(-MOVE_MEMORY)
    current = next
    balance.record(next)
    return [next]
  }
}
