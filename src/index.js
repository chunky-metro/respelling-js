// respelling — IPA → target-language orthography phonetic respelling.
//
// Usage:
//   import { respell } from 'respelling';
//   respell({ ipa: 'ˈbwe.no̞s ˈði.as', source: 'es', target: 'en' });
//   // → 'BWAY-nohs DEE-ahs'
//
// Or the lower-level constructor:
//   import { Converter, Spanish } from 'respelling';
//   const c = new Converter(Spanish.forTarget('en'));
//   c.respell('ˈbwe.nos ˈði.as');

import { Converter } from './converter.js';
import { Spanish, SpanishTarget } from './spanish.js';

export const VERSION = '0.2.0';

const REGISTRY = {
  es: Spanish,
  spanish: Spanish,
};

// Build a Converter for the given source/target pair.
export function pair({ source, target = 'en' }) {
  const src = REGISTRY[String(source).toLowerCase()];
  if (!src) throw new Error(`unknown source language: ${JSON.stringify(source)}`);
  return new Converter(src.forTarget(target));
}

// One-shot convenience: take an IPA string + source/target, return the
// respelled string.
export function respell({ ipa, source = 'es', target = 'en' }) {
  return pair({ source, target }).respell(ipa);
}

export { Converter, Spanish, SpanishTarget };
export default { respell, pair, Converter, Spanish, VERSION };
