// One-shot i18n cleanup:
//   - removes 3 obsolete keys (format.h2.enhanced / intro / desc)
//   - adds 6 new keys for [source:] and [license:] tags (English source; other langs fall back)
// Run: node scripts/i18n-cleanup.mjs  (from tied-to-the-beat-workshop root)

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const i18nDir = join(__dirname, '..', 'i18n');

const OBSOLETE_KEYS = [
  'format.h2.enhanced',
  'format.enhanced.intro',
  'format.enhanced.desc',
];

const NEW_ENGLISH = {
  'format.meta.src.k': '<code>[source:URL]</code>',
  'format.meta.src.v': 'Where the audio came from — direct link (Pixabay page, CC recording, your own upload, etc.)',
  'format.meta.src.r': '<strong>Yes</strong> — required on Workshop for uploads not composed by you',
  'format.meta.lic.k': '<code>[license:NAME]</code>',
  'format.meta.lic.v': 'Short license name: <em>Pixabay License</em>, <em>CC0</em>, <em>CC-BY 4.0</em>, <em>Public Domain</em>, <em>Own recording</em>, …',
  'format.meta.lic.r': '<strong>Yes</strong> — when <code>[source:]</code> is present',
};

const NEW_SPANISH = {
  'format.meta.src.k': '<code>[source:URL]</code>',
  'format.meta.src.v': 'De dónde sacaste el audio — enlace directo (página de Pixabay, grabación CC, tu propia subida, etc.)',
  'format.meta.src.r': '<strong>Sí</strong> — obligatorio en Workshop para subidas que no hayas compuesto tú',
  'format.meta.lic.k': '<code>[license:NOMBRE]</code>',
  'format.meta.lic.v': 'Nombre corto de la licencia: <em>Pixabay License</em>, <em>CC0</em>, <em>CC-BY 4.0</em>, <em>Public Domain</em>, <em>Own recording</em>, …',
  'format.meta.lic.r': '<strong>Sí</strong> — cuando haya <code>[source:]</code>',
};

const files = readdirSync(i18nDir).filter((f) => f.endsWith('.json'));
let removed = 0;
let added = 0;

for (const file of files) {
  const path = join(i18nDir, file);
  const raw = readFileSync(path, 'utf8');
  const data = JSON.parse(raw);

  for (const k of OBSOLETE_KEYS) {
    if (k in data) {
      delete data[k];
      removed++;
    }
  }

  const lang = file.replace('.json', '');
  if (lang === 'en') {
    for (const [k, v] of Object.entries(NEW_ENGLISH)) {
      if (!(k in data)) {
        data[k] = v;
        added++;
      }
    }
  } else if (lang === 'es-ES') {
    for (const [k, v] of Object.entries(NEW_SPANISH)) {
      if (!(k in data)) {
        data[k] = v;
        added++;
      }
    }
  }

  const sorted = Object.keys(data).sort().reduce((acc, k) => ({ ...acc, [k]: data[k] }), {});
  writeFileSync(path, JSON.stringify(sorted, null, 2) + '\n');
}

console.log(`Done. Removed ${removed} obsolete key-instances across ${files.length} files. Added ${added} new key-instances (en + es-ES).`);
