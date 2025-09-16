const { buildCharset, CHARSETS } = require('../data/charsets')
const { randomInt } = require('../utils/rng')

const DEFAULT_PLACEHOLDERS = {
  x: () => pickFromCharset(CHARSETS.lower),
  '#': () => pickFromCharset(CHARSETS.digits),
  '*': () => pickFromCharset(CHARSETS.alnum)
}

function pickFromCharset (charset) {
  const chars = [...charset]
  return chars[randomInt(chars.length)]
}

function compileTemplate (template, { defaultPool = CHARSETS.upper } = {}) {
  if (!template) {
    throw new Error('Template must be provided')
  }
  const tokens = []
  const defaultCharset = buildCharset({ preset: defaultPool })
  for (let i = 0; i < template.length; i++) {
    const char = template[i]
    if (char === '\\') {
      if (i === template.length - 1) {
        throw new Error('Dangling escape in template')
      }
      const literal = template[i + 1]
      tokens.push(() => literal)
      i += 1
      continue
    }
    if (char === '{') {
      const end = template.indexOf('}', i + 1)
      if (end === -1) {
        throw new Error('Unterminated custom set in template')
      }
      const set = template.slice(i + 1, end)
      const charset = buildCharset({ preset: set })
      tokens.push(() => pickFromCharset(charset))
      i = end
      continue
    }
    if (char === 'X') {
      tokens.push(() => pickFromCharset(defaultCharset))
      continue
    }
    if (DEFAULT_PLACEHOLDERS[char]) {
      tokens.push(DEFAULT_PLACEHOLDERS[char])
      continue
    }
    tokens.push(() => char)
  }
  return tokens
}

function renderTemplate (template, { pool } = {}) {
  const tokens = compileTemplate(template, { defaultPool: pool || CHARSETS.upper })
  return tokens.map(fn => fn()).join('')
}

module.exports = {
  renderTemplate,
  compileTemplate
}
