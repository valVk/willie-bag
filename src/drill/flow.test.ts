import { describe, expect, it } from 'vitest'
import { MOVE_MEMORY, createFlowWalker, followUps } from './flow'
import { randomInt } from './punches'

// Seeded, so tests about shares give the same result every run (mulberry32).
const seededRandom = (seed: number) => (max: number) => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return Math.floor((((t ^ (t >>> 14)) >>> 0) / 2 ** 32) * max)
}

const walk = (steps: number, random: (max: number) => number = randomInt, balanced = true) => {
  const next = createFlowWalker(random, balanced)
  return Array.from({ length: steps }, () => next()[0]!)
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8]

describe('flow table', () => {
  it('follows 5 with 2, 1 or 6', () => {
    expect(followUps(5).sort()).toEqual([1, 2, 6])
  })

  it('always offers at least two ways on, and never the same punch', () => {
    for (const punch of NUMBERS) {
      expect(followUps(punch).length).toBeGreaterThanOrEqual(2)
      expect(followUps(punch)).not.toContain(punch)
    }
  })

  it('can reach every number from every number', () => {
    for (const start of NUMBERS) {
      const reached = new Set([start])
      const queue = [start]
      while (queue.length > 0) {
        for (const next of followUps(queue.pop()!)) {
          if (!reached.has(next)) {
            reached.add(next)
            queue.push(next)
          }
        }
      }
      expect(reached.size).toBe(8)
    }
  })
})

describe('createFlowWalker', () => {
  it('calls one number at a time, only along allowed moves', () => {
    const run = walk(5000)

    for (let i = 1; i < run.length; i++) {
      expect(followUps(run[i - 1]!)).toContain(run[i])
    }
  })

  it('reaches every number', () => {
    expect([...new Set(walk(2000))].sort()).toEqual(NUMBERS)
  })

  it('gives every number close to an equal share over a long run', () => {
    const run = walk(40000, seededRandom(1))

    for (const number of NUMBERS) {
      const share = run.filter(punch => punch === number).length / run.length
      expect(share).toBeGreaterThan(0.12)
      expect(share).toBeLessThan(0.13)
    }
  })

  it('stays roughly even within a 3-minute round', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const run = walk(118, seededRandom(seed))

      for (const number of NUMBERS) {
        const calls = run.filter(punch => punch === number).length
        expect(calls).toBeGreaterThanOrEqual(10)
        expect(calls).toBeLessThanOrEqual(20)
      }
    }
  })

  it('still varies: no move takes over from a number', () => {
    const run = walk(40000, seededRandom(2))
    const moves = new Map<string, number>()
    for (let i = 1; i < run.length; i++) {
      const move = `${run[i - 1]}-${run[i]}`
      moves.set(move, (moves.get(move) ?? 0) + 1)
    }

    for (const number of NUMBERS) {
      const fromNumber = followUps(number).map(to => moves.get(`${number}-${to}`) ?? 0)
      const total = fromNumber.reduce((sum, count) => sum + count, 0)
      expect(Math.max(...fromNumber) / total).toBeLessThan(0.55)
    }
  })

  it('does not take a move again while it remembers it, if another is free', () => {
    const run = walk(5000)
    const moves = run.slice(1).map((to, i) => `${run[i]}-${to}`)

    moves.forEach((move, i) => {
      const from = Number(move.split('-')[0])
      const recent = moves.slice(Math.max(0, i - MOVE_MEMORY), i)
      const freeOption = followUps(from).some(option => !recent.includes(`${from}-${option}`))
      if (recent.includes(move)) {
        expect(freeOption).toBe(false)
      }
    })
  })

  for (const [name, random] of [
    ['always the first option', () => 0],
    ['always the last option', (max: number) => max - 1]
  ] as const) {
    it(`never bounces between two numbers, even when picking ${name}`, () => {
      const run = walk(2000, random)

      for (let i = 3; i < run.length; i++) {
        const bouncing = run[i] === run[i - 2] && run[i - 1] === run[i - 3]
        expect(bouncing).toBe(false)
      }
    })

    it(`keeps moving through many numbers when picking ${name}`, () => {
      expect(new Set(walk(2000, random)).size).toBeGreaterThanOrEqual(4)
    })
  }

  it('uses the natural odds when not balanced', () => {
    const run = walk(40000, seededRandom(3), false)
    const share = (number: number) => run.filter(punch => punch === number).length / run.length

    expect(share(2)).toBeGreaterThan(0.18)
    expect(share(3)).toBeLessThan(0.1)
  })
})
