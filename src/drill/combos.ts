import { createCallBalance } from './balance'
import { randomInt } from './punches'

interface Combo {
  call: readonly number[]
  weight: number
}

// Called on the recording of Cus's sixth bag exercise, weighted by how often he called each.
const CALLED_BY_CUS: Combo[] = [
  { call: [5, 2], weight: 12 },
  { call: [6, 1, 2], weight: 12 },
  { call: [5, 2, 1], weight: 10 },
  { call: [6, 1], weight: 10 },
  { call: [5, 1, 2], weight: 8 },
  { call: [1, 2, 1], weight: 8 },
  { call: [4, 1], weight: 6 },
  { call: [3, 2], weight: 5 },
  { call: [5, 1], weight: 5 },
  { call: [5, 6, 2], weight: 5 },
  { call: [5, 6], weight: 4 },
  { call: [5, 6, 5], weight: 4 },
  { call: [1, 2], weight: 4 },
  { call: [6, 5, 2], weight: 3 },
  { call: [6, 2], weight: 3 }
]

// Not from the recording, which has no jabs: added so every target gets trained.
const ADDED_JABS: Combo[] = [
  { call: [7, 2], weight: 8 },
  { call: [8, 2], weight: 8 },
  { call: [7, 2, 1], weight: 6 },
  { call: [8, 1, 2], weight: 6 },
  { call: [7, 8, 2], weight: 6 },
  { call: [8, 7, 2], weight: 6 },
  { call: [7, 6, 1], weight: 5 },
  { call: [8, 2, 5], weight: 5 },
  { call: [7, 4, 1], weight: 4 },
  { call: [8, 3, 2], weight: 4 }
]

// Not from the recording either. Most combinations above finish on 1 or 2, so the Equal mix
// also needs these: uppercuts, and combinations that leave 1 and 2 out.
const ADDED_FOR_EQUAL_NUMBERS: Combo[] = [
  { call: [3, 4], weight: 4 },
  { call: [4, 3], weight: 4 },
  { call: [3, 4, 1], weight: 4 },
  { call: [4, 3, 2], weight: 4 },
  { call: [7, 3, 4], weight: 4 },
  { call: [8, 4, 3], weight: 4 },
  { call: [7, 8], weight: 4 },
  { call: [8, 7], weight: 4 },
  { call: [7, 6], weight: 4 },
  { call: [8, 6], weight: 4 },
  { call: [7, 4], weight: 4 },
  { call: [8, 4], weight: 4 },
  { call: [6, 5], weight: 4 },
  { call: [7, 6, 5], weight: 4 },
  { call: [8, 6, 5], weight: 4 }
]

export const COMBOS = [...CALLED_BY_CUS, ...ADDED_JABS]
export const EQUAL_COMBOS = [...COMBOS, ...ADDED_FOR_EQUAL_NUMBERS]

const isPair = ({ call }: Combo) => call.length === 2

export const TWO_PUNCH_COMBOS = COMBOS.filter(isPair)
export const EQUAL_TWO_PUNCH_COMBOS = EQUAL_COMBOS.filter(isPair)

// Keeps integer weights precise enough after dividing them for balance.
const WEIGHT_SCALE = 1000

// Never calls the same combination twice in a row. When balanced, it favors combinations
// made of the numbers called least so far.
export const createComboPicker = (
  combos: readonly Combo[] = COMBOS,
  random: (max: number) => number = randomInt,
  balanced = false
) => {
  const balance = createCallBalance()

  const weightOf = ({ call, weight }: Combo) => {
    const penalty = balanced
      ? call.reduce((product, punch) => product * balance.penalty(punch), 1) ** (1 / call.length)
      : 1
    return Math.max(1, Math.round(WEIGHT_SCALE * weight / penalty))
  }

  let previous: readonly number[] | undefined

  return () => {
    const candidates = combos.filter(({ call }) => call !== previous)
    const weights = candidates.map(weightOf)
    let roll = random(weights.reduce((total, weight) => total + weight, 0))
    const next = candidates[weights.findIndex(weight => (roll -= weight) < 0)]!.call

    previous = next
    next.forEach(balance.record)
    return next
  }
}
