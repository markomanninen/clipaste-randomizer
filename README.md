# clipaste-randomizer

Random data generator plugin for Clipaste. Provides real generators for passwords,
templated strings, Finnish personal identity codes, IBANs, and business IDs.

![clipaste randomizer](clipaste-randomizer.gif)

## Development

```bash
npm install
npm test
```

## Usage Inside Clipaste

Install into the Clipaste workspace and launch any `clipaste` command. The plugin registers
its own `random` command group.

```bash
clipaste random password --length 24
clipaste random string --template "XXXX-XXXX"
clipaste random personal-id --show-meta
clipaste random iban --format spaced
clipaste random business-id --output json
```

The output copies to the clipboard by default and prints the generated value to stdout.

### Commands

- `clipaste random password` – character or diceware word-based passwords with entropy output.
- `clipaste random string` – templated strings with placeholder pools and escaping.
- `clipaste random personal-id` – Finnish HETU generator/validator with gender and date controls.
- `clipaste random iban` – Finnish IBAN generator/validator with formatting options.
- `clipaste random business-id` – Finnish business ID generator/validator.
