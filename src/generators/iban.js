const { randomDigits } = require('../utils/rng')

function generate ({ country = 'FI', bank } = {}) {
  const normalizedCountry = country.toUpperCase()
  if (normalizedCountry !== 'FI') {
    throw new Error('Only FI IBAN generation is supported in phase 5A')
  }
  const bankPart = (bank ? bank.replace(/\D/g, '') : randomDigits(4)).padStart(4, '0').slice(0, 4)
  const account = bankPart + randomDigits(10)
  const checkDigits = computeChecksum(normalizedCountry, account)
  const iban = `${normalizedCountry}${checkDigits}${account}`
  return {
    value: formatIban(iban, 'compact'),
    meta: {
      country: normalizedCountry,
      bankCode: bankPart,
      account
    }
  }
}

function computeChecksum (country, bban) {
  const rearranged = `${bban}${country}00`
  const numeric = convertToNumeric(rearranged)
  const remainder = mod97(numeric)
  const check = 98 - remainder
  return check.toString().padStart(2, '0')
}

function convertToNumeric (str) {
  let result = ''
  for (const ch of str.toUpperCase()) {
    if (/[0-9]/.test(ch)) {
      result += ch
    } else {
      result += (ch.charCodeAt(0) - 55).toString()
    }
  }
  return result
}

function mod97 (numeric) {
  let remainder = 0
  const chunkSize = 9
  for (let i = 0; i < numeric.length; i += chunkSize) {
    const chunk = remainder.toString() + numeric.slice(i, i + chunkSize)
    remainder = Number(chunk) % 97
  }
  return remainder
}

function formatIban (iban, format = 'spaced') {
  const cleaned = iban.replace(/\s+/g, '')
  if (format === 'compact') return cleaned
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}

function validate (iban) {
  if (!iban) return { valid: false, reason: 'Missing value' }
  const normalized = iban.replace(/\s+/g, '').toUpperCase()
  if (!/^([A-Z]{2})(\d{2})([A-Z0-9]{1,30})$/.test(normalized)) {
    return { valid: false, reason: 'Malformed IBAN' }
  }
  const rearranged = normalized.slice(4) + normalized.slice(0, 4)
  const numeric = convertToNumeric(rearranged)
  const remainder = mod97(numeric)
  if (remainder !== 1) {
    return { valid: false, reason: 'Checksum mismatch' }
  }
  return {
    valid: true,
    normalized,
    meta: {
      country: normalized.slice(0, 2),
      checkDigits: normalized.slice(2, 4)
    }
  }
}

module.exports = {
  generate,
  validate,
  formatIban,
  computeChecksum
}
