// converter.test.js — tests for the language-agnostic IPA→respelling engine
// and the default Spanish→English target table. Mirrors the Ruby gem's
// spec/respelling_spec.rb + spec/respelling/spanish_spec.rb so the two
// implementations stay parity-aligned.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { respell, pair, Converter, Spanish, VERSION } from '../src/index.js';

const c = pair({ source: 'es', target: 'en' });

test('VERSION is semver', () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});

test('canonical buenos dias', () => {
  assert.equal(c.respell('ˈbwe.nos ˈði.as'), 'BWAY-nohs DEE-ahs');
});

test('strips combining lowered-o diacritic', () => {
  assert.equal(c.respell('ˈbwe.no̞s ˈði.as'), 'BWAY-nohs DEE-ahs');
  assert.deepEqual(c.warnings, []);
});

test('one-shot respell helper', () => {
  assert.equal(
    respell({ ipa: 'ˈbwe.nos ˈði.as' }),
    'BWAY-nohs DEE-ahs'
  );
});

test('simple vowels', () => {
  assert.equal(c.respell('a'), 'ah');
  assert.equal(c.respell('e'), 'ay');
  assert.equal(c.respell('i'), 'ee');
  assert.equal(c.respell('o'), 'oh');
  assert.equal(c.respell('u'), 'oo');
});

test('three-syllable fabricado', () => {
  assert.equal(c.respell('fa.bɾi.ˈka.do'), 'fah-bree-KAH-doh');
});

test('cafe', () => {
  assert.equal(c.respell('ˈka.fe'), 'KAH-fay');
});

test('gracias', () => {
  assert.equal(c.respell('ˈgɾa.sjas'), 'GRAH-syahs');
});

test('por favor', () => {
  assert.equal(c.respell('poɾ fa.ˈβoɾ'), 'por fah-BOR');
});

test('como estas', () => {
  assert.equal(c.respell('ˈko.mo es.ˈtas'), 'KOH-moh ays-TAHS');
});

test('jota maps to h', () => {
  assert.equal(c.respell('ˈxen.te'), 'HAYN-tay');
});

test('th phoneme renders as d (not th)', () => {
  assert.equal(c.respell('ˈna.ða'), 'NAH-dah');
});

test('palatal nasal ñ', () => {
  assert.equal(c.respell('ˈɲa.ɲa'), 'NYAH-nyah');
});

test('cluster diphthongs', () => {
  assert.equal(c.respell('ˈai'), 'EYE');
  assert.equal(c.respell('ˈoi'), 'OY');
  assert.equal(c.respell('ˈau'), 'OW');
});

test('longest-match prefers clusters', () => {
  assert.equal(c.respell('ˈbwe'), 'BWAY');
});

test('unknown phoneme passes through with warning', () => {
  const out = c.respell('ˈq');
  assert.equal(out, 'Q');
  assert.equal(c.warnings.length, 1);
  assert.match(c.warnings[0], /unknown phoneme/);
});

test('multi-word input preserves space', () => {
  assert.equal(c.respell('a e'), 'ah ay');
});

test('secondary stress treated like primary', () => {
  assert.equal(c.respell('ˌse'), 'SAY');
});

test('pair throws on unknown source language', () => {
  assert.throws(() => pair({ source: 'klingon', target: 'en' }), /unknown source/);
});

test('Spanish.forTarget throws on unknown target', () => {
  assert.throws(() => Spanish.forTarget('klingon'), /no Spanish→klingon table/);
});

test('table size is reasonable', () => {
  const lang = Spanish.forTarget('en');
  assert.ok(lang.table.size > 200, `expected >200 entries, got ${lang.table.size}`);
});
