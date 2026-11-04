import { describe, expect, it } from 'vitest'
import { COMBOS, EQUAL_COMBOS, EQUAL_TWO_PUNCH_COMBOS, TWO_PUNCH_COMBOS, createComboPicker } from './combos'
import { PUNCH_COUNT, randomInt } from './punches'

// Seeded, so tests about shares give the same result every run (mulberry32).
const seededRandom = (seed: number) => (max: number) => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return Math.floor((((t ^ (t >>> 14)) >>> 0) / 2 ** 32) * max)
}

const sharesOf = (next: () => readonly number[], calls: number) => {
  const counts = Array.from({ length: PUNCH_COUNT }, () => 0)
  for (let i = 0; i < calls; i++) {
    for (const punch of next()) {
      counts[punch - 1] = counts[punch - 1]! + 1
    }
  }
  const total = counts.reduce((sum, count) => sum + count, 0)
  return counts.map(count => count / total)
}

describe('COMBOS', () => {
  it('only uses real punch numbers', () => {
    for (const { call } of COMBOS) {
      for (const punch of call) {
        expect(punch).toBeGreaterThanOrEqual(1)
        expect(punch).toBeLessThanOrEqual(PUNCH_COUNT)
      }
    }
  })

  it('trains every target, including both jabs', () => {
    const used = new Set(COMBOS.flatMap(({ call }) => call))

    expect([...used].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('has no combination listed twice', () => {
    const calls = COMBOS.map(({ call }) => call.join('-'))

    expect(new Set(calls).size).toBe(calls.length)
  })
})

describe('createComboPicker', () => {
  it('never repeats a combination back to back', () => {
    const next = createComboPicker()
    let previous = next()

    for (let i = 0; i < 2000; i++) {
      const current = next()
      expect(current).not.toBe(previous)
      previous = current
    }
  })

  it('gives every combination a share of rolls equal to its weight', () => {
    const total = COMBOS.reduce((sum, { weight }) => sum + weight, 0)
    const counts = new Map<readonly number[], number>()

    // Weights are scaled by 1000 inside the picker.
    for (let roll = 0; roll < total; roll++) {
      const call = createComboPicker(COMBOS, () => roll * 1000)()
      counts.set(call, (counts.get(call) ?? 0) + 1)
    }

    for (const { call, weight } of COMBOS) {
      expect(counts.get(call)).toBe(weight)
    }
  })

  it('only calls listed combinations with real randomness', () => {
    const next = createComboPicker(COMBOS, randomInt)
    const calls = Array.from({ length: 500 }, next)

    expect(calls.every(call => COMBOS.some(combo => combo.call === call))).toBe(true)
  })

  it('sticks to the list it is given', () => {
    const next = createComboPicker(TWO_PUNCH_COMBOS)
    const calls = Array.from({ length: 500 }, next)

    expect(calls.every(call => call.length === 2)).toBe(true)
  })
})

describe('TWO_PUNCH_COMBOS', () => {
  it('still trains every target', () => {
    const used = new Set(TWO_PUNCH_COMBOS.flatMap(({ call }) => call))

    expect([...used].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})

describe('Equal numbers', () => {
  it('has only real, unrepeated combinations', () => {
    const calls = EQUAL_COMBOS.map(({ call }) => call.join('-'))

    expect(new Set(calls).size).toBe(calls.length)
    expect(EQUAL_COMBOS.flatMap(({ call }) => call).every(punch => punch >= 1 && punch <= PUNCH_COUNT)).toBe(true)
  })

  for (const [name, combos] of [['Combos', EQUAL_COMBOS], ['Two', EQUAL_TWO_PUNCH_COMBOS]] as const) {
    it(`evens out the numbers in ${name}`, () => {
      const shares = sharesOf(createComboPicker(combos, seededRandom(1), true), 30000)

      for (const share of shares) {
        expect(share).toBeGreaterThan(0.11)
        expect(share).toBeLessThan(0.14)
      }
    })

    it(`keeps ${name} varied`, () => {
      const next = createComboPicker(combos, seededRandom(2), true)
      const counts = new Map<readonly number[], number>()
      for (let i = 0; i < 30000; i++) {
        const call = next()
        counts.set(call, (counts.get(call) ?? 0) + 1)
      }

      expect(counts.size).toBe(combos.length)
      expect(Math.max(...counts.values()) / 30000).toBeLessThan(0.15)
    })
  }

  it('leaves the recording-weighted list uneven when off', () => {
    const shares = sharesOf(createComboPicker(COMBOS, seededRandom(3)), 30000)

    expect(shares[1]!).toBeGreaterThan(0.25)
    expect(shares[2]!).toBeLessThan(0.05)
  })

  it('survives a long drill with the worst possible rolls', () => {
    for (const random of [() => 0, (max: number) => max - 1]) {
      const next = createComboPicker(EQUAL_COMBOS, random, true)
      expect(() => Array.from({ length: 5000 }, next)).not.toThrow()
    }
  })
})
