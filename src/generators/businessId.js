const { randomDigits } = require('../utils/rng')

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2]

function generate () {
  while (true) {
    const base = randomDigits(7)
    const check = calculateCheckDigit(base)
    if (check === null) continue
    return {
      value: `${base}-${check}`,
      meta: {
        base,
        checkDigit: check
      }
    }
  }
}

function calculateCheckDigit (base) {
  if (!/^\d{7}$/.test(base)) {
    throw new Error('Base must be 7 digits')
  }
  const digits = base.split('').map(Number)
  const sum = digits.reduce((total, digit, idx) => total + digit * WEIGHTS[idx], 0)
  const remainder = sum % 11
  if (remainder === 0) return 0
  if (remainder === 1) return null
  return 11 - remainder
}

function validate (id) {
  if (!id) return { valid: false, reason: 'Missing value' }
  const normalized = id.replace(/[^0-9]/g, '')
  if (!/^\d{8}$/.test(normalized)) {
    return { valid: false, reason: 'Malformed business ID' }
  }
  const base = normalized.slice(0, 7)
  const checkDigit = Number(normalized.slice(7))
  const expected = calculateCheckDigit(base)
  if (expected === null || expected !== checkDigit) {
    return { valid: false, reason: 'Checksum mismatch' }
  }
  return {
    valid: true,
    normalized: `${base}-${checkDigit}`,
    meta: {
      base,
      checkDigit
    }
  }
}

module.exports = {
  generate,
  validate,
  calculateCheckDigit
}
