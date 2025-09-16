# clipaste-randomizer

Prototype randomizer plugin for Clipaste. Provides placeholder random string generation
so the Clipaste plugin scaffold can exercise registration and clipboard integration.

## Development

```bash
# Install dependencies (once package is published or locally via file path)
npm install

# Run placeholder tests
npm test
```

## Usage Inside Clipaste

Install into the Clipaste workspace and launch any `clipaste` command. The plugin registers
its own `random` command group.

```bash
clipaste random string --length 24
```

The output copies to the clipboard by default and prints the generated string to stdout.
