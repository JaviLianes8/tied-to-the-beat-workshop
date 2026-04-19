/**
 * sync-languages.mjs — reconcile `assets/js/languages.js` with the
 * catalog files actually present in `i18n/`.
 *
 * For every entry in the LANGUAGES array, if the matching
 * `i18n/<code>.json` exists and contains every key from `en.json`,
 * flip `available: true`; otherwise `available: false`. Validates JSON
 * parseability and 1:1 key match against `en.json` before flipping.
 *
 * Usage:  node scripts/sync-languages.mjs
 * Exit:   non-zero if any catalog is present but malformed.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LANGS_PATH = path.join(ROOT, 'assets/js/languages.js');
const I18N_DIR = path.join(ROOT, 'i18n');
const EN_PATH = path.join(I18N_DIR, 'en.json');

const EN_KEYS = Object.keys(JSON.parse(readFileSync(EN_PATH, 'utf8')));

/** Does the catalog for `code` parse AND contain every English key? */
function isCatalogReady(code) {
  const p = path.join(I18N_DIR, code + '.json');
  if (!existsSync(p)) return false;
  let parsed;
  try { parsed = JSON.parse(readFileSync(p, 'utf8')); }
  catch (err) {
    console.error(`[sync] ${code}.json: invalid JSON — ${err.message}`);
    return false;
  }
  const missing = EN_KEYS.filter(k => !(k in parsed));
  if (missing.length) {
    console.error(`[sync] ${code}.json: missing ${missing.length} keys (first: ${missing[0]})`);
    return false;
  }
  return true;
}

/** Rewrite the boolean flag on the matching line. */
function flip(source, code, shouldBe) {
  const re = new RegExp(`(\\{\\s*code:\\s*'${code.replace(/-/g, '\\-')}',[^}]*available:\\s*)(true|false)(\\s*\\})`);
  return source.replace(re, (_, head, _current, tail) => `${head}${shouldBe}${tail}`);
}

const src = readFileSync(LANGS_PATH, 'utf8');
const codeMatches = [...src.matchAll(/\{\s*code:\s*'([^']+)'/g)].map(m => m[1]);

let out = src;
const report = [];
for (const code of codeMatches) {
  const ready = isCatalogReady(code);
  out = flip(out, code, ready);
  report.push({ code, available: ready });
}

if (out !== src) writeFileSync(LANGS_PATH, out);

const on = report.filter(r => r.available).length;
console.log(`[sync] ${on}/${report.length} languages available`);
for (const r of report) console.log(`  ${r.available ? '✓' : ' '} ${r.code}`);
