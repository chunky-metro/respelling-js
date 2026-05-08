#!/usr/bin/env node
// respell — CLI for the respelling package.
//
// Usage:
//   respell --source es --target en 'ˈbwe.no̞s ˈði.as'
//   respell 'ˈbwe.nos ˈði.as'   # defaults to es→en
//   echo 'ˈbwe.nos ˈði.as' | respell

import { respell } from '../src/index.js';

function parseArgs(argv) {
  const args = { source: 'es', target: 'en', ipa: null };
  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    if (a === '--source' || a === '-s') { args.source = argv[++i]; }
    else if (a === '--target' || a === '-t') { args.target = argv[++i]; }
    else if (a === '--help' || a === '-h') { args.help = true; }
    else if (a === '--version' || a === '-v') { args.version = true; }
    else { args.ipa = a; }
    i++;
  }
  return args;
}

function printHelp() {
  process.stdout.write(`respell — IPA → respelling

Usage:
  respell [--source LANG] [--target LANG] 'IPA STRING'
  echo 'IPA STRING' | respell [--source LANG] [--target LANG]

Options:
  -s, --source CODE    source language code (default: es)
  -t, --target CODE    target orthography code (default: en)
  -h, --help           show this help
  -v, --version        print version

Examples:
  respell 'ˈbwe.nos ˈði.as'
    → BWAY-nohs DEE-ahs
  respell --source es --target en 'ˈgɾa.sjas'
    → GRAH-syahs
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }
  if (args.version) {
    const { VERSION } = await import('../src/index.js');
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  let ipa = args.ipa;
  if (!ipa && !process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    ipa = Buffer.concat(chunks).toString('utf8').trim();
  }
  if (!ipa) {
    printHelp();
    process.exit(1);
  }

  try {
    process.stdout.write(`${respell({ ipa, source: args.source, target: args.target })}\n`);
  } catch (e) {
    process.stderr.write(`respell: ${e.message}\n`);
    process.exit(2);
  }
}

main();
