# respelling

> Phonetic respelling that spells foreign words like English words. No hyphens, no caps — looks like English, reads as an approximation of the foreign word.

JS port of [chunky-metro/respelling](https://github.com/chunky-metro/respelling) (Ruby). Two implementations, one canonical data shape, parity-tested.

## What's novel (v0.3)

The dictionary-style transliteration `mah-NYAH-nah` has existed forever — every Merriam-Webster entry has one. **That's not what this is.** This library writes `manyana` — a respelling that *looks like an English word* an English reader naturally pronounces (and which approximates the Spanish). No hyphens marking syllable boundaries, no uppercase marking stress. English orthography does the work.

| Spanish     | Dictionary style       | This library (v0.3) |
| :---------- | :--------------------- | :------------------ |
| Buenos días | `BWAY-nohs DEE-ahs`    | `bwaynose deeyus`   |
| Mañana      | `mah-NYAH-nah`         | `manyana`           |
| Gracias     | `GRAH-syahs`           | `grasseeus`         |
| Por favor   | `por fah-VOHR`         | `porfavore`         |
| Hola        | `OH-lah`               | `ohla`              |

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

## Three layers (v0.3)

**1. Hand-curated corpus** (`src/data/spanish-en-corpus.json`) — 50 phrases respelled with the novel English-word-shape style. The v1 craft-curated layer — what the parrot-lab demo serves.

**2. LLM-respelling for ANY phrase** — `respellViaLLM({ phrase, source, target })` — calls Gemma3-27b on OpenRouter with a few-shot prompt anchored on the corpus style. Works on phrases that aren't in the corpus.

```js
import { respellViaLLM } from 'respelling';

await respellViaLLM({ phrase: 'Estoy bien' });
// → 'estoy byen'

await respellViaLLM({ phrase: 'Me llamo Carlos' });
// → 'may yaamo carlos'

// Pass api key explicitly if not in env:
await respellViaLLM({ phrase: 'Tengo hambre', apiKey: '...' });
// Defaults: source='es', target='en', model='google/gemma-4-26b-a4b-it'
```

Requires `OPENROUTER_API_KEY` in env. Uses `google/gemma-4-26b-a4b-it` by default — small, fast, follows the few-shot orthography rules well. Cost is fractions of a cent per phrase.

**3. Algorithmic IPA fallback** (`src/data/spanish-en.json`) — static IPA→respelling table. Currently emits dictionary style (`BWAY-nohs DEE-ahs`) — kept as a deterministic fallback when LLM is unavailable.

## Spanish→English style rules

**Novel English-word-shape (v0.3, hand-curated):**
- No hyphens, no uppercase. Single English-looking word per Spanish word.
- Standard English vowel orthography: `ee` for /i/, `oh` for /o/, `ay` for /e/, `oo` for /u/, `ah`/`a` for /a/.
- `manyana` not `mah-NYAH-nah`. `bwaynose` not `BWAY-nohs`. `grasseeus` not `GRAH-syahs`.
- Where a real English word approximates the sound, prefer it (e.g., `boy` for "voy", `say` not `seh` for "sé").
- Capitalization comes from sentence-initial / proper-noun rules, NOT from stress.

**Algorithmic v0.2 (still in IPA fallback table):**
- `/a/`→`ah`, `/e/`→`ay`, `/i/`→`ee`, `/o/`→`oh`, `/u/`→`oo`
- `/ð/`→`d`, `/x/`→`h`, `/ɲ/`→`ny`, `/ʝ/ʎ/`→`y`, `/ɾ/`→`r`, `/r/`→`rr`
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
