/**
 * detect.js — BCP-47 aware language detection.
 *
 * Resolution order:
 *   1. `?lang=xx` URL parameter (explicit user intent)
 *   2. localStorage (remembered prior choice)
 *   3. `navigator.languages` (browser/OS preference, highest→lowest)
 *   4. Fallback constant (passed in as last arg)
 *
 * Each candidate is funneled through `resolveToSupported()` which
 * handles aliases (`es-MX → es-419`, `zh-TW → zh-Hant`, etc.) and
 * strips region when needed.
 *
 * @module i18n/detect
 */

import { ALIASES } from '../languages.js';
import { loadStoredLanguage } from './storage.js';

/**
 * Try to map any candidate string onto a supported language code.
 * @param {string | null | undefined} candidate
 * @param {Set<string>} supportedCodes
 * @returns {string | null}
 */
function resolveToSupported(candidate, supportedCodes) {
  if (!candidate) return null;
  const raw = String(candidate).trim();
  if (!raw) return null;
  if (supportedCodes.has(raw)) return raw;

  const lower = raw.toLowerCase();
  if (ALIASES[lower]) return ALIASES[lower];

  for (const code of supportedCodes) {
    if (code.toLowerCase() === lower) return code;
  }

  const base = lower.split('-')[0];
  if (ALIASES[base]) return ALIASES[base];
  if (supportedCodes.has(base)) return base;

  return null;
}

/** Read `?lang=xx` from the current URL. */
function readUrlLang() {
  try {
    return new URLSearchParams(location.search).get('lang');
  } catch (err) {
    return null;
  }
}

/**
 * Resolve the active language, honoring the full detection chain,
 * but only accepting languages that are currently `available`.
 *
 * @param {import('../languages.js').Language[]} languages full registry
 * @param {string} fallback last-resort code when nothing else matches
 * @returns {string} one of the available codes (never null)
 */
export function detectLanguage(languages, fallback) {
  const available = new Set(languages.filter(l => l.available).map(l => l.code));

  const pick = (raw) => {
    const c = resolveToSupported(raw, available);
    return c && available.has(c) ? c : null;
  };

  const fromUrl = pick(readUrlLang());
  if (fromUrl) return fromUrl;

  const fromStorage = pick(loadStoredLanguage());
  if (fromStorage) return fromStorage;

  const navLangs = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language || fallback];
  for (const candidate of navLangs) {
    const match = pick(candidate);
    if (match) return match;
  }

  // Last-resort sniff: Intl locale (sometimes reflects OS region even when the
  // browser UI language differs — e.g. Spanish Windows with English Chrome).
  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    const fromIntl = pick(intlLocale);
    if (fromIntl) return fromIntl;
  } catch (err) { /* Intl unavailable — unlikely */ }

  return fallback;
}
