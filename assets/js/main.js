/**
 * main.js — single entry point loaded by every page.
 *
 * Kicks off two independent systems:
 *   1. i18n bootstrap — detects the user's language, loads the JSON
 *      catalog, swaps every [data-i18n*] placeholder, and renders the
 *      language picker in the nav.
 *   2. Falling-note ambient background — spawns animated music notes
 *      behind the content. No-op if the user prefers reduced motion.
 *
 * Both subsystems are imported as ES modules from this file so HTML
 * pages only need one <script type="module"> reference.
 *
 * @module main
 */

import { initI18n } from './i18n/bootstrap.js';
import { mountNotes } from './notes.js';

initI18n();
mountNotes();
