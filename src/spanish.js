// spanish.js — Spanish source language with multi-target support.
//
// Default target: "en" (American English orthography). To add a new target
// drop a new JSON file at src/data/spanish-{target}.json and call
// Spanish.forTarget(targetCode).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');

export class SpanishTarget {
  constructor(targetCode) {
    this.target = String(targetCode);
    const path = join(DATA_DIR, `spanish-${this.target}.json`);
    let raw;
    try {
      raw = readFileSync(path, 'utf8');
    } catch (e) {
      throw new Error(`no Spanish→${this.target} table at ${path}`);
    }
    this._data = JSON.parse(raw);
    this._table = new Map(this._data.entries.map((e) => [e.ipa, e.respelling]));
    this._maxKeyLength = Math.max(...Array.from(this._table.keys()).map((k) => k.length));
  }

  get data() { return this._data; }
  get table() { return this._table; }
  get maxKeyLength() { return this._maxKeyLength; }
  get stressMarker() { return this._data.stress_marker || 'uppercase'; }
  get syllableSeparator() { return this._data.syllable_separator || '-'; }
}

export const Spanish = {
  DEFAULT_TARGET: 'en',
  forTarget(target = 'en') {
    return new SpanishTarget(target);
  },
};
