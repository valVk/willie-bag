export const PUNCH_COUNT = 8

const UINT32_RANGE = 2 ** 32

// Returns a whole number from 0 up to max. Draws at or above the largest multiple of
// max are redrawn so every result is equally likely.
export const randomInt = (max: number): number => {
  // Past this range every draw would be redrawn, forever.
  if (max > UINT32_RANGE) {
    throw new RangeError(`randomInt can't draw from a range of ${max}`)
  }

  const limit = UINT32_RANGE - (UINT32_RANGE % max)
  const draw = new Uint32Array(1)
  do {
    crypto.getRandomValues(draw)
  } while (draw[0]! >= limit)

  return draw[0]! % max
}

export const randomPunch = (): number => randomInt(PUNCH_COUNT) + 1
