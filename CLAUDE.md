# respelling-js

JavaScript/Node port of the `respelling` Ruby gem — IPA → English-orthography phonetic respelling. Spells foreign words like English words: no hyphens, no caps, looks like English, reads as an approximation of the foreign word. Spanish ships in v1.

## Stack
- Node >= 18, ESM (`"type": "module"`)
- node:test built-in test runner
- CLI binary: `bin/respell.js`

## Commands
- install: `npm install`
- test: `npm test` (runs `node --test test/*.test.js`)
- run: `node bin/respell.js "ˈbwe.nos ˈði.as"`

## Conventions
- Cross-language parity with the Ruby `respelling` gem — symmetric API
- ESM only; subpath exports live in `package.json#exports`
- Mappings live in `src/spanish.js` shaped data tables

## Linked context
- GitHub: https://github.com/chunky-metro/respelling-js
- Sister repo (Ruby): https://github.com/chunky-metro/respelling
- Upstream extraction: parrot-lab serverless align sidecar

## Active branches / WIP
- main: `d6922a5 v0.3.2: absorb 4 guiding principles + asta lawaygo / grassious`
- Fixture-parity test (gem vs js) deferred per MEMORY.md
