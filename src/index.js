const password = require('./generators/password')
const template = require('./generators/template')
const hetu = require('./generators/hetu')
const iban = require('./generators/iban')
const businessId = require('./generators/businessId')
const { deliver } = require('./utils/output')
const { CHARSETS } = require('./data/charsets')

const pkg = require('../package.json')

function register ({ program, services = {}, logger = console }) {
  if (!program || typeof program.command !== 'function') {
    throw new Error('clipaste-randomizer requires a commander program instance')
  }

  const clipboard = services.clipboard
  const history = services.history
  const randomCommand = getOrCreateRandomCommand(program)

  randomCommand
    .command('password')
    .description('Generate secure passwords (characters or word-based)')
    .option('--length <number>', 'Length for character passwords', '20')
    .option('--charset <preset>', 'Charset preset (ascii|alnum|safe|hex|custom string)', 'ascii')
    .option('--include <chars>', 'Force include characters into charset')
    .option('--exclude <chars>', 'Remove characters from charset')
    .option('--words <count>', 'Generate a word-based password with N words')
    .option('--wordlist <preset>', 'Wordlist preset (eff)', 'eff')
    .option('--separator <char>', 'Separator for word passwords', '-')
    .option('--entropy', 'Show entropy calculation')
    .option('--no-copy', 'Do not copy the password to clipboard')
    .option('--output <mode>', 'text|json', 'text')
    .option('--show-meta', 'Show metadata in text mode')
    .action(async (options = {}) => {
      const useWords = options.words && Number(options.words) > 0
      let value
      let meta

      if (useWords) {
        const result = password.generateWordPassword({
          words: options.words,
          wordlist: options.wordlist,
          separator: options.separator
        })
        value = result.value
        meta = {
          mode: 'words',
          words: Number(options.words),
          separator: result.separator
        }
      } else {
        const result = password.generateCharacterPassword({
          length: options.length,
          preset: options.charset,
          include: options.include,
          exclude: options.exclude
        })
        value = result.value
        meta = {
          mode: 'characters',
          length: value.length,
          charset: result.charset
        }
        if (options.entropy) {
          meta.entropyBits = password.calculateEntropy({ password: value, charsetSize: result.charset.length })
        }
      }

      await deliver({
        label: 'Generated password',
        value,
        meta,
        options,
        clipboard,
        history,
        historyType: 'randomizer:password',
        logger
      })
    })

  randomCommand
    .command('string')
    .description('Generate strings from template placeholders')
    .option('--template <pattern>', 'Pattern with placeholders (default XXXX-XXXX)', 'XXXX-XXXX')
    .option('--pool <chars>', 'Default character pool for X placeholder', CHARSETS.upper)
    .option('--no-copy', 'Do not copy the result to clipboard')
    .option('--output <mode>', 'text|json', 'text')
    .option('--show-meta', 'Show metadata in text mode')
    .action(async (options = {}) => {
      const value = template.renderTemplate(options.template, { pool: options.pool })
      const meta = {
        template: options.template,
        length: value.length
      }
      await deliver({
        label: 'Generated string',
        value,
        meta,
        options,
        clipboard,
        history,
        historyType: 'randomizer:string',
        logger
      })
    })

  randomCommand
    .command('personal-id')
    .description('Generate or validate Finnish personal identity codes (HETU)')
    .option('--born <yyyy-mm-dd>', 'Fix the date of birth')
    .option('--age-range <min-max>', 'Age range used for random sampling', '18-65')
    .option('--gender <any|female|male>', 'Gender parity for the individual number', 'any')
    .option('--format <short|long>', 'Output format', 'short')
    .option('--validate-only <value>', 'Validate an existing identity code')
    .option('--no-copy', 'Do not copy the result to clipboard')
    .option('--output <mode>', 'text|json', 'text')
    .option('--show-meta', 'Show metadata in text mode')
    .action(async (options = {}) => {
      if (options.validateOnly) {
        const result = hetu.validate(options.validateOnly)
        if (!result.valid) {
          console.error(`Invalid personal identity code: ${result.reason}`)
          process.exitCode = 1
          return
        }
        await deliver({
          label: 'Valid personal identity code',
          value: result.normalized,
          meta: result.meta,
          options,
          clipboard: null,
          history: null,
          logger
        })
        return
      }

      const result = hetu.generate({
        born: options.born,
        ageRange: options.ageRange,
        gender: options.gender,
        format: options.format
      })

      await deliver({
        label: 'Generated personal identity code',
        value: result.value,
        meta: result.meta,
        options,
        clipboard,
        history,
        historyType: 'randomizer:personal-id',
        logger
      })
    })

  randomCommand
    .command('iban')
    .description('Generate or validate Finnish IBAN numbers')
    .option('--country <code>', 'Country code (FI only for generation)', 'FI')
    .option('--bank <digits>', 'Preferred bank prefix (4 digits)')
    .option('--format <compact|spaced>', 'Output formatting', 'spaced')
    .option('--validate-only <value>', 'Validate an existing IBAN')
    .option('--no-copy', 'Do not copy the result to clipboard')
    .option('--output <mode>', 'text|json', 'text')
    .option('--show-meta', 'Show metadata in text mode')
    .action(async (options = {}) => {
      if (options.validateOnly) {
        const result = iban.validate(options.validateOnly)
        if (!result.valid) {
          console.error(`Invalid IBAN: ${result.reason}`)
          process.exitCode = 1
          return
        }
        const formatted = iban.formatIban(result.normalized, options.format)
        await deliver({
          label: 'Valid IBAN',
          value: formatted,
          meta: result.meta,
          options,
          clipboard: null,
          history: null,
          logger
        })
        return
      }

      const result = iban.generate({ country: options.country, bank: options.bank })
      const formatted = iban.formatIban(result.value, options.format)
      await deliver({
        label: 'Generated IBAN',
        value: formatted,
        meta: result.meta,
        options,
        clipboard,
        history,
        historyType: 'randomizer:iban',
        logger
      })
    })

  randomCommand
    .command('business-id')
    .description('Generate or validate Finnish business IDs')
    .option('--validate-only <value>', 'Validate an existing business ID')
    .option('--no-copy', 'Do not copy the result to clipboard')
    .option('--output <mode>', 'text|json', 'text')
    .option('--show-meta', 'Show metadata in text mode')
    .action(async (options = {}) => {
      if (options.validateOnly) {
        const result = businessId.validate(options.validateOnly)
        if (!result.valid) {
          console.error(`Invalid business ID: ${result.reason}`)
          process.exitCode = 1
          return
        }
        await deliver({
          label: 'Valid business ID',
          value: result.normalized,
          meta: result.meta,
          options,
          clipboard: null,
          history: null,
          logger
        })
        return
      }

      const result = businessId.generate()
      await deliver({
        label: 'Generated business ID',
        value: result.value,
        meta: result.meta,
        options,
        clipboard,
        history,
        historyType: 'randomizer:business-id',
        logger
      })
    })
}

function getOrCreateRandomCommand (program) {
  const existing = program.commands?.find(cmd => cmd.name() === 'random')
  if (existing) {
    if (!existing.description()) {
      existing.description('Random data generators')
    }
    return existing
  }
  return program.command('random').description('Random data generators')
}

module.exports = {
  name: pkg.name,
  version: pkg.version,
  register,
  generators: {
    password,
    template,
    hetu,
    iban,
    businessId
  }
}
