const crypto = require('crypto')

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function generateRandomString (length = 16, charset = DEFAULT_CHARSET) {
  const uniqueChars = Array.from(new Set(String(charset)))
  if (uniqueChars.length === 0) {
    throw new Error('Character set must contain at least one unique character')
  }

  const size = Math.max(1, parseInt(length, 10) || 0)
  const bytes = crypto.randomBytes(size)
  let result = ''

  for (let i = 0; i < size; i++) {
    const index = bytes[i] % uniqueChars.length
    result += uniqueChars[index]
  }

  return result
}

function register ({ program, services = {}, logger = console }) {
  if (!program || typeof program.command !== 'function') {
    throw new Error('clipaste-randomizer requires a commander program instance')
  }

  const clipboard = services.clipboard
  const history = services.history

  const randomCommand = program.command('random')
    .description('Random data generators provided by clipaste-randomizer')

  randomCommand
    .command('string')
    .description('Generate a random string and copy it to the clipboard unless --no-copy is set')
    .option('--length <number>', 'Length of the string to generate', '16')
    .option('--charset <chars>', 'Characters to use for generation', DEFAULT_CHARSET)
    .option('--no-copy', 'Do not copy the result to the clipboard')
    .action(async (options = {}) => {
      const { length, charset } = options
      const value = generateRandomString(length, charset)

      if (!options.noCopy && clipboard && typeof clipboard.writeText === 'function') {
        try {
          await clipboard.writeText(value)
          logger.info?.(`Random string copied to clipboard (${String(length || 16)} chars).`)
        } catch (error) {
          logger.warn?.(`Failed to copy random string to clipboard: ${error.message}`)
        }
      }

      if (history && typeof history.record === 'function') {
        try {
          await history.record({
            type: 'randomizer:string',
            content: value,
            meta: {
              length: value.length,
              copied: !options.noCopy
            }
          })
        } catch (error) {
          logger.warn?.(`Failed to record randomizer output to history: ${error.message}`)
        }
      }

      if (options.noCopy) {
        console.log(value)
      } else {
        console.log(`Generated random string: ${value}`)
      }
    })
}

const { version, name } = require('../package.json')

module.exports = {
  name,
  version,
  register,
  generateRandomString,
  DEFAULT_CHARSET
}
