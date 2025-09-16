const ASCII_SYMBOLS = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"

const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  alnum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ascii: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + ASCII_SYMBOLS,
  safe: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',
  hex: '0123456789abcdef'
}

function buildCharset ({ preset = 'ascii', include = '', exclude = '' } = {}) {
  const base = CHARSETS[preset] || preset
  const combined = new Set([...String(base), ...String(include)])
  for (const ch of String(exclude)) {
    combined.delete(ch)
  }
  const result = Array.from(combined).join('')
  if (!result) {
    throw new Error('Character set must contain at least one character')
  }
  return result
}

module.exports = {
  CHARSETS,
  buildCharset
}
