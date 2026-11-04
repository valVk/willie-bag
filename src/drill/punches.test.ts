import { afterEach, describe, expect, it, vi } from 'vitest'
import { randomInt, randomPunch } from './punches'

const stubDraws = (...draws: number[]) => {
  const queue = [...draws]
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    (array as Uint32Array)[0] = queue.shift()!
    return array
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('randomPunch', () => {
  it('maps draws onto 1 to 8', () => {
    stubDraws(0)
    expect(randomPunch()).toBe(1)
    stubDraws(7)
    expect(randomPunch()).toBe(8)
    stubDraws(8)
    expect(randomPunch()).toBe(1)
  })

  it('gives every punch the same share of draws', () => {
    const counts = new Map<number, number>()
    for (let draw = 0; draw < 256; draw++) {
      stubDraws(draw)
      const punch = randomPunch()
      counts.set(punch, (counts.get(punch) ?? 0) + 1)
    }

    expect([...counts.keys()].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(new Set(counts.values())).toEqual(new Set([32]))
  })
})

describe('randomInt', () => {
  it('redraws values that would favor some results', () => {
    // 2^32 leaves a remainder of 1 when divided by 3, so the very top draw is thrown away.
    stubDraws(2 ** 32 - 1, 4)

    expect(randomInt(3)).toBe(1)
  })

  it('refuses a range it could never draw from, instead of hanging', () => {
    expect(() => randomInt(2 ** 33)).toThrow(RangeError)
  })
})
