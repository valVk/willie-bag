export const PUNCH_COUNT = 8

// Largest multiple of PUNCH_COUNT that fits in a byte. Bytes at or above it are
// redrawn so every punch is equally likely.
const UNBIASED_LIMIT = 256 - (256 % PUNCH_COUNT)

export const randomPunch = (): number => {
  const byte = new Uint8Array(1)
  do {
    crypto.getRandomValues(byte)
  } while (byte[0]! >= UNBIASED_LIMIT)

  return (byte[0]! % PUNCH_COUNT) + 1
}
