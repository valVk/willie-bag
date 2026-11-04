import { afterEach, describe, expect, it, vi } from 'vitest'
import { randomPunch } from './punches'

const stubBytes = (...bytes: number[]) => {
  const queue = [...bytes]
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    (array as Uint8Array)[0] = queue.shift()!
    return array
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('randomPunch', () => {
  it('maps bytes onto 1 to 8', () => {
    stubBytes(0)
    expect(randomPunch()).toBe(1)
    stubBytes(7)
    expect(randomPunch()).toBe(8)
    stubBytes(8)
    expect(randomPunch()).toBe(1)
  })

  it('gives every punch the same share of bytes', () => {
    const counts = new Map<number, number>()
    for (let byte = 0; byte < 256; byte++) {
      stubBytes(byte)
      const punch = randomPunch()
      counts.set(punch, (counts.get(punch) ?? 0) + 1)
    }

    expect([...counts.keys()].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(new Set(counts.values())).toEqual(new Set([32]))
  })
})
