const test = require('node:test')
const assert = require('node:assert/strict')
const password = require('../src/generators/password')

test('character password respects length and charset', () => {
  const { value, charset } = password.generateCharacterPassword({ length: 32, preset: 'hex' })
  assert.equal(value.length, 32)
  for (const ch of value) {
    assert.ok(charset.includes(ch))
  }
})

test('word password joins requested number of words', () => {
  const { value } = password.generateWordPassword({ words: 3, separator: '_' })
  const parts = value.split('_')
  assert.equal(parts.length, 3)
  for (const part of parts) {
    assert.ok(part.length > 0)
  }
})

test('entropy increases with length', () => {
  const short = password.generateCharacterPassword({ length: 8 })
  const long = password.generateCharacterPassword({ length: 16 })
  const shortEntropy = password.calculateEntropy({ password: short.value, charsetSize: short.charset.length })
  const longEntropy = password.calculateEntropy({ password: long.value, charsetSize: long.charset.length })
  assert.ok(longEntropy > shortEntropy)
})
