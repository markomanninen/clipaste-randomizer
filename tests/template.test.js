const test = require('node:test')
const assert = require('node:assert/strict')
const template = require('../src/generators/template')

test('renderTemplate respects custom pools', () => {
  const out = template.renderTemplate('XX##', { pool: 'AB' })
  assert.equal(out.length, 4)
  assert.ok(/^[AB]{2}\d{2}$/.test(out))
})

test('renderTemplate supports escaped literals and custom sets', () => {
  const out = template.renderTemplate('\\{hello}-#{XYZ}', { pool: 'CD' })
  assert.ok(out.startsWith('{hello}-'))
  assert.ok(/-\d[XYZ]/.test(out.slice(-3)))
})
