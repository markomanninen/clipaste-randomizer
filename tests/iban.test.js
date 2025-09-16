const test = require('node:test')
const assert = require('node:assert/strict')
const iban = require('../src/generators/iban')

test('generate creates Finnish IBAN that validates', () => {
  const result = iban.generate({ country: 'FI', bank: '1234' })
  const formatted = iban.formatIban(result.value)
  assert.ok(formatted.startsWith('FI'))
  const validation = iban.validate(formatted)
  assert.equal(validation.valid, true)
})

test('validate detects incorrect checksum', () => {
  const validation = iban.validate('FI0012345600000000')
  assert.equal(validation.valid, false)
})
