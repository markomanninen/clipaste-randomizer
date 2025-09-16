const test = require('node:test')
const assert = require('node:assert/strict')
const hetu = require('../src/generators/hetu')

test('generate produces valid hetu respecting gender', () => {
  const result = hetu.generate({ gender: 'female', format: 'short' })
  assert.equal(result.value.length, 11)
  const validation = hetu.validate(result.value)
  assert.equal(validation.valid, true)
  assert.equal(validation.meta.gender, 'female')
})

test('validate rejects malformed ids', () => {
  const validation = hetu.validate('010101-123X')
  assert.equal(validation.valid, false)
})
