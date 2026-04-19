/**
 * catalog.js — fetch and apply JSON translation catalogs.
 *
 * `loadCatalog()` retrieves `i18n/<code>.json` and falls back to
 * English on failure. `applyCatalog()` walks the DOM once per call,
 * swapping every element decorated with:
 *
 *   - `data-i18n="key"`        → el.textContent = catalog[key]
 *   - `data-i18n-html="key"`   → el.innerHTML = catalog[key]
 *   - `data-i18n-attr="a:k;.."` → el.setAttribute(a, catalog[k])
 *
 * `meta.title` is also written into the <title> element when present,
 * keeping the browser tab in sync with the localized H1.
 *
 * @module i18n/catalog
 */

const FALLBACK = 'en';

/**
 * Fetch the JSON catalog for a language. Falls back to English on
 * HTTP failure, which keeps the UI usable if a translation drops out
 * mid-deploy.
 *
 * @param {string} code
 * @returns {Promise<Record<string, string>>}
 */
export async function loadCatalog(code) {
  try {
    const res = await fetch(`i18n/${code}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('[i18n] Failed to load', code, err);
    if (code !== FALLBACK) return loadCatalog(FALLBACK);
    throw err;
  }
}

/**
 * Swap every `[data-i18n*]` placeholder in the document using the
 * catalog map. Elements without a matching key are left untouched so
 * missing translations degrade to English content already in the HTML.
 *
 * @param {Record<string, string>} catalog
 */
export function applyCatalog(catalog) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const value = catalog[el.getAttribute('data-i18n')];
    if (typeof value === 'string') el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const value = catalog[el.getAttribute('data-i18n-html')];
    if (typeof value === 'string') el.innerHTML = value;
  });

  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s && s.trim());
      if (!attr || !key) return;
      const value = catalog[key];
      if (typeof value === 'string') el.setAttribute(attr, value);
    });
  });

  if (typeof catalog['meta.title'] === 'string') document.title = catalog['meta.title'];
}
