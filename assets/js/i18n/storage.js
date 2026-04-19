/**
 * storage.js — persist the user's chosen language across visits.
 *
 * All three functions are fail-soft: they wrap localStorage in
 * try/catch so privacy modes or quota errors never break the site,
 * they simply fall back to the default detection chain.
 *
 * @module i18n/storage
 */

const STORAGE_KEY = 'ttb-workshop-lang';

/**
 * Read the persisted language preference.
 * @returns {string | null} raw stored value or null when missing/blocked
 */
export function loadStoredLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    return null;
  }
}

/**
 * Persist the language preference.
 * @param {string} code
 */
export function saveLanguage(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch (err) {
    /* ignore — quota, private mode, disabled storage */
  }
}
