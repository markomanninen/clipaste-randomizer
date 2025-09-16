const crypto = require('crypto')

function randomInt (maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('maxExclusive must be a positive integer')
  }
  if (typeof crypto.randomInt === 'function') {
    return crypto.randomInt(maxExclusive)
  }
  const bytesNeeded = Math.ceil(Math.log2(maxExclusive) / 8)
  const maxPossible = 2 ** (bytesNeeded * 8)
  let randomValue
  do {
    randomValue = parseInt(crypto.randomBytes(bytesNeeded).toString('hex'), 16)
  } while (randomValue >= maxPossible - (maxPossible % maxExclusive))
  return randomValue % maxExclusive
}

function randomFromArray (arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Array must contain at least one element')
  }
  return arr[randomInt(arr.length)]
}

function randomDateBetween (start, end) {
  const startMs = start.getTime()
  const endMs = end.getTime()
  if (endMs <= startMs) {
    throw new Error('End date must be after start date')
  }
  const delta = endMs - startMs
  const offset = Math.floor(randomInt(delta))
  return new Date(startMs + offset)
}

function randomDigits (length) {
  const digits = []
  for (let i = 0; i < length; i++) {
    digits.push(randomInt(10))
  }
  return digits.join('')
}

module.exports = {
  randomInt,
  randomFromArray,
  randomDateBetween,
  randomDigits
}
