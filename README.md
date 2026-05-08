# respelling

> IPA → target-language orthography phonetic respelling. Hear what you actually sounded like.

JS port of [chunky-metro/respelling](https://github.com/chunky-metro/respelling) (Ruby). Two implementations, one canonical data shape, parity-tested.

## Install

```sh
npm install respelling
# or directly from GitHub:
npm install github:chunky-metro/respelling-js
```

## Usage

```js
import { respell } from 'respelling';

respell({ ipa: 'ˈbwe.no̞s ˈði.as', source: 'es', target: 'en' });
// → 'BWAY-nohs DEE-ahs'

respell({ ipa: 'ˈgɾa.sjas' });
// → 'GRAH-syahs'  (defaults: source: 'es', target: 'en')
```

Lower-level constructor for repeated calls:

```js
import { Converter, Spanish } from 'respelling';

const c = new Converter(Spanish.forTarget('en'));
c.respell('ˈko.mo es.ˈtas');  // → 'KOH-moh ays-TAHS'
c.warnings;  // → []  (any unknown phonemes accumulate here)
```

## CLI

```sh
npx respelling 'ˈbwe.nos ˈði.as'
# → BWAY-nohs DEE-ahs

echo 'poɾ fa.ˈβoɾ' | npx respelling
# → por fah-BOR

npx respelling --source es --target en 'ˈna.ða'
# → NAH-dah
```

## What it does

Given an IPA transcription of a phrase in some source language (Spanish, Korean, French, ...), produce a respelling in the target language's orthography that an English (or French, or whatever target) reader can read aloud and pronounce passably.

Reader-perception-driven, not phoneme-rigor-driven. Real example: Spanish `/ˈbwe.no̞s ˈði.as/` becomes `BWAY-nohs DEE-ahs`, not `BWEH-nohs THEE-ahs`. An English speaker reading `BWEH` says "bweh" (like "bed"), not the diphthong they should produce; `BWAY` pushes them toward the right sound. Same for `ð`→`d` instead of `ð`→`th` — English speakers don't natively produce intervocalic /ð/ before a vowel here, and reading `THEE` makes them say "thee" (like the pronoun) instead of the soft `d`-ish flap that's actually closer.

## Architecture

Each source language exposes a per-target table:

```
src/data/spanish-en.json    # Spanish IPA → English orthography
src/data/spanish-pt.json    # Spanish IPA → Portuguese orthography (future)
src/data/korean-en.json     # Korean IPA  → English orthography (future)
```

To add a new source language:

1. Drop a JSON file at `src/data/{source}-{target}.json` with the schema below.
2. Register the source module (mirror `src/spanish.js`) and add a case in `src/index.js`'s `REGISTRY`.

Schema (v2):

```json
{
  "schema_version": 2,
  "source_language": "es",
  "source_dialect": "latin-american",
  "target_orthography": "en",
  "stress_marker": "uppercase",
  "syllable_separator": "-",
  "entries": [
    { "ipa": "a", "respelling": "ah" },
    { "ipa": "bwe", "respelling": "bway" },
    ...
  ]
}
```

The converter is a longest-match-first walker, language-agnostic. All language-specific knowledge lives in the JSON.

## Spanish→English style rules (v0.2)

- `/a/` → `ah`,  `/e/` → `ay`,  `/i/` → `ee`,  `/o/` → `oh`,  `/u/` → `oo`
- `/ð/` → `d`  (not `th`)
- `/x/` (jota) → `h`
- `/ɲ/` (ñ) → `ny`
- `/ʝ/`, `/ʎ/` (y, ll) → `y`  (yeísmo)
- `/ɾ/` (tap) → `r`
- `/r/` (trill) → `rr`
- Stressed syllable → uppercase; syllables joined with `-`

## Tests

```sh
npm test
```

21 tests cover the canonical examples, vowel rules, consonant edge cases, longest-match-first behavior, error handling. Parity-aligned with the Ruby gem's spec suite.

## License

MIT — see LICENSE.

## See also

- [chunky-metro/respelling](https://github.com/chunky-metro/respelling) — Ruby canonical
- [chunky-metro/parrot-lab](https://github.com/chunky-metro/parrot-lab) — language-learning playground that consumes this package
