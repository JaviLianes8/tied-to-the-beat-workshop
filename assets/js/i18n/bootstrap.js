/**
 * bootstrap.js — orchestrates i18n for a page load.
 *
 * Resolves the language, updates <html lang/dir>, fetches the catalog,
 * applies every [data-i18n*] swap, and renders the nav language
 * picker. Safe to call before or after DOMContentLoaded.
 *
 * Keeps `initI18n()` as the only public surface — individual steps
 * (detect / load / apply / render) remain private to this module.
 *
 * @module i18n/bootstrap
 */

import { LANGUAGES, findLanguage } from '../languages.js';
import { detectLanguage } from './detect.js';
import { loadCatalog, applyCatalog } from './catalog.js';
import { renderPicker } from './picker.js';

const DEFAULT_LANG = 'en';

/** Update <html lang> and <html dir> to match the active language. */
function setDocumentLocale(code) {
  const entry = findLanguage(code);
  document.documentElement.setAttribute('lang', code);
  document.documentElement.setAttribute('dir', entry && entry.rtl ? 'rtl' : 'ltr');
}

/** Run the whole i18n pipeline end-to-end for the current page. */
async function run() {
  const code = detectLanguage(LANGUAGES, DEFAULT_LANG);
  setDocumentLocale(code);

  try {
    const catalog = await loadCatalog(code);
    applyCatalog(catalog);
  } catch (err) {
    console.error('[i18n] Catalog pipeline failed', err);
  }

  renderPicker(code);
}

/** Public entry — wires `run()` to DOMContentLoaded if the page is still parsing. */
export function initI18n() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
