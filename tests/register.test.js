const test = require('node:test')
const assert = require('node:assert/strict')
const plugin = require('../src')

class CommandStub {
  constructor (name) {
    this._name = name
    this.subcommands = []
    this.options = []
    this._action = null
  }

  name () {
    return this._name
  }

  description () { return this }

  option (flag, description, defaultValue) {
    this.options.push({ flag, description, defaultValue })
    return this
  }

  command (name) {
    const cmd = new CommandStub(name)
    this.subcommands.push(cmd)
    return cmd
  }

  action (fn) {
    this._action = fn
    return this
  }
}

class ProgramStub extends CommandStub {
  constructor () {
    super('root')
    this.commands = this.subcommands
  }
}

test('register attaches password command and respects no-copy', async () => {
  const program = new ProgramStub()
  const copiedValues = []
  const historyPayloads = []

  plugin.register({
    program,
    services: {
      clipboard: {
        writeText: async (value) => copiedValues.push(value)
      },
      history: {
        record: async (payload) => historyPayloads.push(payload)
      }
    },
    logger: { info: () => {}, warn: () => {} }
  })

  const randomCommand = program.commands.find(c => c.name() === 'random')
  const passwordCommand = randomCommand.subcommands.find(c => c.name() === 'password')
  await passwordCommand._action({ length: '12', noCopy: true })
  assert.equal(copiedValues.length, 0)
  assert.equal(historyPayloads.length, 1)
  assert.equal(historyPayloads[0].type, 'randomizer:password')
  assert.equal(typeof historyPayloads[0].content, 'string')
})
