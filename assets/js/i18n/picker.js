/**
 * picker.js — language-picker dropdown in the nav bar.
 *
 * Rendered from the languages registry into any element with class
 * `.lang-picker`. Only languages flagged `available: true` are shown,
 * so the list stays in sync with what actually has a catalog on disk.
 *
 * Picking a new language writes to localStorage and reloads the page
 * with `?lang=<code>` so the choice is shareable via URL and survives
 * across tabs.
 *
 * @module i18n/picker
 */

import { LANGUAGES, findLanguage } from '../languages.js';
import { saveLanguage } from './storage.js';

/** @returns {string} */
const escapeHtml = (s) =>
  String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

/** @returns {string} */
const escapeAttr = (s) =>
  String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Reload the page with `?lang=<code>` so the choice is in the URL. */
function switchTo(code) {
  saveLanguage(code);
  const url = new URL(location.href);
  url.searchParams.set('lang', code);
  location.href = url.toString();
}

/** Build the dropdown markup for the currently-active language. */
function buildMarkup(currentLang) {
  const current = findLanguage(currentLang) || LANGUAGES[0];
  const available = LANGUAGES.filter(l => l.available);

  return `
    <button class="lang-picker-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
      <span aria-hidden="true">🌐</span>
      <span>${escapeHtml(current.native)}</span>
      <span class="chev" aria-hidden="true">▾</span>
    </button>
    <div class="lang-picker-menu" role="listbox">
      ${available.map(l => `
        <button class="lang-picker-item ${l.code === currentLang ? 'active' : ''}"
                data-lang="${escapeAttr(l.code)}" role="option" type="button"
                ${l.rtl ? 'dir="rtl"' : ''}>
          <span>${escapeHtml(l.native)}</span>
          <span class="lang-code">${escapeHtml(l.code)}</span>
        </button>
      `).join('')}
    </div>
  `;
}

/** Wire click handlers on the built picker. */
function attachHandlers(container) {
  const btn = container.querySelector('.lang-picker-btn');
  const menu = container.querySelector('.lang-picker-menu');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = container.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  menu.addEventListener('click', (e) => {
    const item = e.target.closest('.lang-picker-item');
    if (item) switchTo(item.dataset.lang);
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      container.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Render the language picker into `.lang-picker` and wire its handlers.
 * Does nothing if the container is missing (e.g. on admin pages).
 *
 * @param {string} currentLang active language code
 */
export function renderPicker(currentLang) {
  const container = document.querySelector('.lang-picker');
  if (!container) return;
  container.innerHTML = buildMarkup(currentLang);
  attachHandlers(container);
}
