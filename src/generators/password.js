const crypto = require('crypto')
const { buildCharset } = require('../data/charsets')
const effWordlist = require('../data/diceware-eff-short')
const { randomInt } = require('../utils/rng')

function generateCharacterPassword ({ length = 20, preset = 'ascii', include = '', exclude = '' } = {}) {
  const size = Math.max(1, Number.parseInt(length, 10) || 0)
  const charset = buildCharset({ preset, include, exclude })
  const chars = []
  const buffer = crypto.randomBytes(size)
  const charArray = [...charset]
  for (let i = 0; i < size; i++) {
    const index = buffer[i] % charArray.length
    chars.push(charArray[index])
  }
  return {
    value: chars.join(''),
    charset
  }
}

function generateWordPassword ({ words = 6, wordlist = 'eff', separator = '-' } = {}) {
  const count = Math.max(1, Number.parseInt(words, 10) || 0)
  const list = resolveWordlist(wordlist)
  const parts = []
  for (let i = 0; i < count; i++) {
    parts.push(list[randomInt(list.length)])
  }
  return {
    value: parts.join(separator),
    wordlist: list,
    separator
  }
}

function resolveWordlist (wordlist) {
  if (!wordlist || wordlist === 'eff') {
    return effWordlist
  }
  if (Array.isArray(wordlist)) return wordlist
  throw new Error(`Unknown wordlist: ${wordlist}`)
}

function calculateEntropy ({ password, charsetSize }) {
  if (!password) return 0
  const len = password.length
  if (len === 0) return 0
  const pool = charsetSize || estimateCharsetSize(password)
  return Math.round(len * Math.log2(pool) * 100) / 100
}

function estimateCharsetSize (password) {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/[0-9]/.test(password)) size += 10
  if (/[^A-Za-z0-9]/.test(password)) size += 32
  return size || password.length
}

module.exports = {
  generateCharacterPassword,
  generateWordPassword,
  calculateEntropy,
  resolveWordlist
}
