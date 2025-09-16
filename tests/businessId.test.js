const test = require('node:test')
const assert = require('node:assert/strict')
const businessId = require('../src/generators/businessId')

test('generate returns valid business id', () => {
  const result = businessId.generate()
  const validation = businessId.validate(result.value)
  assert.equal(validation.valid, true)
})

test('validate rejects bad ids', () => {
  const validation = businessId.validate('1234567-2')
  assert.equal(validation.valid, false)
})
