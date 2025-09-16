const { randomInt, randomDateBetween } = require('../utils/rng')

const CHECKSUM_TABLE = '0123456789ABCDEFHJKLMNPRSTUVWXY'

function generate ({ born, ageRange = '18-65', gender = 'any', format = 'short' } = {}) {
  const date = born ? parseISODate(born) : sampleDateFromAge(ageRange)
  const individualNumber = sampleIndividualNumber(gender)
  const base = formatDatePart(date) + individualNumber
  const checksum = CHECKSUM_TABLE[Number(base) % 31]
  const centurySign = getCenturySign(date.getFullYear())
  const shortForm = `${formatDatePart(date)}${centurySign}${individualNumber}${checksum}`
  const output = format === 'long' ? formatLong(shortForm) : shortForm

  return {
    value: output,
    meta: {
      dateOfBirth: date.toISOString().slice(0, 10),
      gender: inferGender(individualNumber),
      individualNumber,
      checksum,
      centurySign
    }
  }
}

function sampleDateFromAge (range) {
  const [minAge, maxAge] = parseAgeRange(range)
  const today = new Date()
  const maxDate = new Date(today)
  maxDate.setFullYear(today.getFullYear() - minAge)
  const minDate = new Date(today)
  minDate.setFullYear(today.getFullYear() - maxAge)
  return randomDateBetween(minDate, maxDate)
}

function parseAgeRange (range) {
  if (typeof range === 'string' && range.includes('-')) {
    const [min, max] = range.split('-').map(Number)
    if (Number.isFinite(min) && Number.isFinite(max) && max >= min) {
      return [min, max]
    }
  }
  if (Array.isArray(range) && range.length === 2) {
    return range.map(Number)
  }
  return [18, 65]
}

function sampleIndividualNumber (gender) {
  while (true) {
    const number = (randomInt(900) + 2).toString().padStart(3, '0')
    const isEven = Number(number) % 2 === 0
    if (gender === 'female' && !isEven) continue
    if (gender === 'male' && isEven) continue
    return number
  }
}

function parseISODate (value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid born date')
  }
  return date
}

function formatDatePart (date) {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  return `${dd}${mm}${yy}`
}

function getCenturySign (year) {
  if (year >= 2000) return 'A'
  if (year >= 1900) return '-'
  return '+'
}

function inferGender (individualNumber) {
  return Number(individualNumber) % 2 === 0 ? 'female' : 'male'
}

function formatLong (hetu) {
  return `${hetu.slice(0, 6)}.${hetu.slice(6, 7)}${hetu.slice(7, 10)}-${hetu.slice(10)}`
}

function validate (value) {
  if (!value) {
    return { valid: false, reason: 'Missing value' }
  }
  const normalized = value.replace(/[^0-9A-Za-z+-]/g, '').toUpperCase()
  const match = normalized.match(/^(\d{6})([+-A])(\d{3})([0-9A-Z])$/)
  if (!match) {
    return { valid: false, reason: 'Malformed HETU' }
  }
  const [, datePart, century, individual, checksum] = match
  const year = parseCenturyYear(datePart.slice(4), century)
  const month = Number(datePart.slice(2, 4))
  const day = Number(datePart.slice(0, 2))
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime()) || date.getDate() !== day || date.getMonth() + 1 !== month) {
    return { valid: false, reason: 'Invalid date component' }
  }
  const expectedChecksum = CHECKSUM_TABLE[Number(`${datePart}${individual}`) % 31]
  if (expectedChecksum !== checksum) {
    return { valid: false, reason: 'Checksum mismatch' }
  }
  return {
    valid: true,
    normalized: `${datePart}${century}${individual}${checksum}`,
    meta: {
      dateOfBirth: date.toISOString().slice(0, 10),
      gender: inferGender(individual),
      individualNumber: individual,
      checksum
    }
  }
}

function parseCenturyYear (yy, sign) {
  const year = Number(yy)
  if (sign === 'A') return 2000 + year
  if (sign === '-') return 1900 + year
  return 1800 + year
}

module.exports = {
  generate,
  validate
}
