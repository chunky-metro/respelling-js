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

export const VERSION = '0.3.0';

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

// LLM-backed respelling: spell ANY foreign-language phrase using target-orthography
// conventions so a target-language reader naturally approximates the source pronunciation.
//
// Usage:
//   const out = await respellViaLLM({ phrase: 'Estoy bien', source: 'es', target: 'en' });
//   // → 'estoy beeayn'
//
// Requires OPENROUTER_API_KEY in env (or pass apiKey). Uses google/gemma-4-26b-a4b-it
// by default — small, fast, follows the few-shot orthography rules well.
const FEWSHOT_ES_EN = [
  ['Hola',         'ohla'],
  ['mañana',       'manyana'],
  ['buenos días',  'bwaynose deeyus'],
  ['gracias',      'grasseeus'],
  ['por favor',    'porfavore'],
  ['adiós',        'ahdyose'],
  ['hasta luego',  'asta lwaygo'],
  ['mucho gusto',  'moocho goosto'],
];

function buildPrompt({ phrase, source, target, examples }) {
  const ex = examples.map(([a, b]) => `- "${a}" → "${b}"`).join('\n');
  return `Respell the ${source} phrase using ${target} orthography conventions so a native ${target} reader, reading naturally with no special instructions, produces an approximation of the source-language pronunciation.\n\nNO hyphens. NO capitalized syllables. NO transliteration markers. Output should look like a plausible ${target} word.\n\nExamples:\n${ex}\n\nRespell: "${phrase}"\n\nOutput ONLY the respelling, nothing else. No quotes, no explanation.`;
}

export async function respellViaLLM({
  phrase,
  source = 'es',
  target = 'en',
  model = 'google/gemma-4-26b-a4b-it',
  apiKey = (typeof process !== 'undefined' ? process.env.OPENROUTER_API_KEY : undefined),
  endpoint = 'https://openrouter.ai/api/v1/chat/completions',
  temperature = 0.2,
  examples = FEWSHOT_ES_EN,
} = {}) {
  if (!apiKey) throw new Error('respellViaLLM requires OPENROUTER_API_KEY (env or apiKey arg)');
  if (!phrase) throw new Error('respellViaLLM requires a phrase');

  const sourceName = ({ es: 'Spanish', en: 'English', fr: 'French', pt: 'Portuguese' })[source] || source;
  const targetName = ({ es: 'Spanish', en: 'English', fr: 'French', pt: 'Portuguese' })[target] || target;

  const prompt = buildPrompt({
    phrase,
    source: sourceName,
    target: targetName,
    examples,
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
      temperature,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = (data.choices?.[0]?.message?.content || '').trim();
  // Strip surrounding quotes if model added them.
  return raw.replace(/^["']|["']$/g, '').trim();
}

export { Converter, Spanish, SpanishTarget };
export default { respell, respellViaLLM, pair, Converter, Spanish, VERSION };
