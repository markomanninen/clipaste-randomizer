async function deliver ({
  label,
  value,
  meta = {},
  options = {},
  clipboard,
  history,
  logger = console,
  historyType
}) {
  const copyToClipboard = options.noCopy ? false : true

  if (copyToClipboard && clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(value)
      logger.info?.(`${label} copied to clipboard.`)
    } catch (error) {
      logger.warn?.(`Failed to copy to clipboard: ${error.message}`)
    }
  }

  if (history && typeof history.record === 'function') {
    try {
      await history.record({
        type: historyType,
        content: value,
        meta
      })
    } catch (error) {
      logger.warn?.(`Failed to record history entry: ${error.message}`)
    }
  }

  const outputMode = (options.output || 'text').toLowerCase()
  const showMeta = options.showMeta || outputMode === 'json'

  if (outputMode === 'json') {
    console.log(JSON.stringify({ value, meta }, null, 2))
  } else {
    console.log(`${label}: ${value}`)
    if (showMeta && meta && Object.keys(meta).length > 0) {
      for (const [key, entryValue] of Object.entries(meta)) {
        console.log(`- ${key}: ${entryValue}`)
      }
    }
  }

  return { value, meta }
}

module.exports = {
  deliver
}
