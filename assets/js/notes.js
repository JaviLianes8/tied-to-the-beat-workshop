/**
 * notes.js — falling-note ambient background.
 *
 * Spawns a grid of Unicode music notes and lets CSS animations drift
 * them from top to bottom with randomized size, speed, horizontal
 * drift, rotation, and opacity. Each <span> carries CSS custom
 * properties that parameterize a single shared @keyframe (see
 * assets/css/notes-bg.css).
 *
 * Respects `prefers-reduced-motion` — both here (bail out) and in the
 * stylesheet (fully hides the container).
 *
 * @module notes
 */

const SYMBOLS = ['♪', '♫', '♩', '♬', '♭', '♯', '𝅗𝅥', '♮'];
const COUNT = 28;

/**
 * Build a single .note span with all its randomized CSS variables.
 * @returns {HTMLSpanElement}
 */
function createNote() {
  const span = document.createElement('span');
  span.className = 'note';
  span.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

  span.style.left = Math.random() * 100 + '%';
  span.style.fontSize = (14 + Math.random() * 28) + 'px';
  span.style.animationDuration = (11 + Math.random() * 16) + 's';
  span.style.animationDelay = (-Math.random() * 27) + 's';
  span.style.setProperty('--note-opacity', 0.08 + Math.random() * 0.18);
  span.style.setProperty('--note-drift', (Math.random() * 60 - 30).toFixed(1) + 'px');

  const rotStart = Math.random() * 40 - 20;
  span.style.setProperty('--note-rot-start', rotStart + 'deg');
  span.style.setProperty('--note-rot-end', (rotStart + (Math.random() * 240 - 120)) + 'deg');

  return span;
}

/**
 * Inject the notes background into <body>.
 * No-op if the user opts into reduced motion or the background already
 * exists (guards against double-mount during hot reload).
 */
export function mountNotes() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.querySelector('.notes-bg')) return;

  const bg = document.createElement('div');
  bg.className = 'notes-bg';
  bg.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < COUNT; i++) bg.appendChild(createNote());

  if (document.body.firstChild) document.body.insertBefore(bg, document.body.firstChild);
  else document.body.appendChild(bg);
}
