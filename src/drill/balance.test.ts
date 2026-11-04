import { describe, expect, it } from 'vitest'
import { createCallBalance } from './balance'

describe('createCallBalance', () => {
  it('treats every number alike before any calls', () => {
    const balance = createCallBalance()

    expect(balance.penalty(1)).toBe(balance.penalty(8))
  })

  it('holds back a number above its fair share and favors one below it', () => {
    const balance = createCallBalance()
    for (let i = 0; i < 10; i++) {
      balance.record(2)
    }

    expect(balance.penalty(2)).toBeGreaterThan(1)
    expect(balance.penalty(7)).toBeLessThan(1)
  })

  it('limits how far a neglected number is favored', () => {
    const balance = createCallBalance()
    for (let i = 0; i < 100000; i++) {
      balance.record(2)
    }

    expect(balance.penalty(7)).toBeGreaterThanOrEqual(0.001)
  })

  it('still tells numbers apart after a very long drill', () => {
    const balance = createCallBalance()
    for (let i = 0; i < 80000; i++) {
      balance.record((i % 8) + 1)
    }
    for (let i = 0; i < 2000; i++) {
      balance.record(2)
    }

    expect(balance.penalty(2)).toBeGreaterThan(balance.penalty(7))
    expect(Number.isFinite(balance.penalty(2))).toBe(true)
  })
})
