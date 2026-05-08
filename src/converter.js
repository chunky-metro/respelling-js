// converter.js — language-agnostic IPA → respelling engine.
//
// Mirrors lib/respelling/converter.rb in chunky-metro/respelling. The
// language object passed in must expose `table`, `stressMarker`,
// `syllableSeparator`, and `maxKeyLength`.

const PRIMARY_STRESS = 'ˈ';   // ˈ
const SECONDARY_STRESS = 'ˌ'; // ˌ
const SYLLABLE_BREAK = '.';
const SPACE = ' ';

export class Converter {
  constructor(language) {
    this.language = language;
    this.warnings = [];
  }

  // Strip combining marks (e.g. lowered-vowel diacritic in /o̞/).
  stripCombining(str) {
    return str.normalize('NFD').replace(/\p{M}/gu, '');
  }

  respell(ipa) {
    this.warnings = [];
    return this.stripCombining(ipa)
      .split(SPACE)
      .map((word) => this._respellWord(word))
      .join(SPACE);
  }

  _respellWord(word) {
    const syllables = this._splitSyllables(word);
    return syllables
      .map((s) => this._renderSyllable(s))
      .join(this.language.syllableSeparator);
  }

  _splitSyllables(word) {
    const syllables = [{ stressed: false, body: '' }];
    for (const ch of word) {
      if (ch === PRIMARY_STRESS || ch === SECONDARY_STRESS) {
        this._startSyllable(syllables, true);
      } else if (ch === SYLLABLE_BREAK) {
        this._startSyllable(syllables, false);
      } else {
        syllables[syllables.length - 1].body += ch;
      }
    }
    return syllables.filter((s) => s.body.length > 0);
  }

  _startSyllable(syllables, stressed) {
    const last = syllables[syllables.length - 1];
    if (last.body.length === 0) {
      last.stressed = last.stressed || stressed;
    } else {
      syllables.push({ stressed, body: '' });
    }
  }

  _renderSyllable(syl) {
    const respelled = this._transliterate(syl.body);
    return syl.stressed ? respelled.toUpperCase() : respelled;
  }

  _transliterate(body) {
    const parts = [];
    let i = 0;
    while (i < body.length) {
      i += this._stepMatch(body, i, parts);
    }
    return parts.join('');
  }

  _stepMatch(body, i, parts) {
    const [len, value] = this._longestMatch(body, i);
    parts.push(value);
    return len;
  }

  _longestMatch(body, start) {
    const max = Math.min(this.language.maxKeyLength, body.length - start);
    for (let len = max; len >= 1; len--) {
      const slice = body.slice(start, start + len);
      if (this.language.table.has(slice)) {
        return [len, this.language.table.get(slice)];
      }
    }
    this._recordUnknown(body[start]);
    return [1, body[start]];
  }

  _recordUnknown(ch) {
    this.warnings.push(`unknown phoneme: ${JSON.stringify(ch)}`);
  }
}
