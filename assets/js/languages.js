/**
 * languages.js — canonical registry of the 30 supported languages.
 *
 * Mirrors src/lib/i18n/languages.ts in the main game repo.
 * The `available` flag lets us ship the infrastructure before every
 * catalog is written — the language picker hides entries flagged
 * `available: false` so users never see English behind a foreign label.
 *
 * Also exposes the BCP-47 alias table used when mapping browser-reported
 * codes (`navigator.languages`) onto our supported set. Ported from
 * src/lib/game/game/localization.ts.
 *
 * @module languages
 */

/** @typedef {{ code: string, native: string, rtl: boolean, available: boolean }} Language */

/** @type {Language[]} */
export const LANGUAGES = [
  { code: 'en',      native: 'English',              rtl: false, available: true },
  { code: 'es-ES',   native: 'Español (España)',     rtl: false, available: true },
  { code: 'es-419',  native: 'Español (Latam)',      rtl: false, available: true },
  { code: 'fr',      native: 'Français',             rtl: false, available: true  },
  { code: 'it',      native: 'Italiano',             rtl: false, available: true  },
  { code: 'de',      native: 'Deutsch',              rtl: false, available: true  },
  { code: 'pt-BR',   native: 'Português (Brasil)',   rtl: false, available: true  },
  { code: 'pt-PT',   native: 'Português (Portugal)', rtl: false, available: true  },
  { code: 'nl',      native: 'Nederlands',           rtl: false, available: true  },
  { code: 'pl',      native: 'Polski',               rtl: false, available: true  },
  { code: 'cs',      native: 'Čeština',              rtl: false, available: true  },
  { code: 'hu',      native: 'Magyar',               rtl: false, available: true  },
  { code: 'ro',      native: 'Română',               rtl: false, available: true  },
  { code: 'bg',      native: 'Български',            rtl: false, available: true },
  { code: 'uk',      native: 'Українська',           rtl: false, available: true  },
  { code: 'ru',      native: 'Русский',              rtl: false, available: true },
  { code: 'el',      native: 'Ελληνικά',             rtl: false, available: true },
  { code: 'tr',      native: 'Türkçe',               rtl: false, available: true },
  { code: 'da',      native: 'Dansk',                rtl: false, available: true  },
  { code: 'no',      native: 'Norsk bokmål',         rtl: false, available: true },
  { code: 'sv',      native: 'Svenska',              rtl: false, available: true },
  { code: 'fi',      native: 'Suomi',                rtl: false, available: true },
  { code: 'ja',      native: '日本語',                rtl: false, available: true  },
  { code: 'ko',      native: '한국어',                rtl: false, available: true },
  { code: 'zh-Hans', native: '简体中文',              rtl: false, available: true  },
  { code: 'zh-Hant', native: '繁體中文',              rtl: false, available: true },
  { code: 'th',      native: 'ไทย',                  rtl: false, available: true },
  { code: 'vi',      native: 'Tiếng Việt',           rtl: false, available: true },
  { code: 'id',      native: 'Bahasa Indonesia',     rtl: false, available: true },
  { code: 'ar',      native: 'العربية',              rtl: true,  available: true }
];

/** BCP-47 alias table — lowercased candidate → canonical supported code. */
export const ALIASES = {
  'es':       'es-ES',
  'es-es':    'es-ES',
  'es-mx':    'es-419',
  'es-ar':    'es-419',
  'es-cl':    'es-419',
  'es-co':    'es-419',
  'es-pe':    'es-419',
  'es-uy':    'es-419',
  'es-ve':    'es-419',
  'es-419':   'es-419',
  'pt':       'pt-BR',
  'pt-br':    'pt-BR',
  'pt-pt':    'pt-PT',
  'zh':       'zh-Hans',
  'zh-cn':    'zh-Hans',
  'zh-sg':    'zh-Hans',
  'zh-hans':  'zh-Hans',
  'zh-tw':    'zh-Hant',
  'zh-hk':    'zh-Hant',
  'zh-mo':    'zh-Hant',
  'zh-hant':  'zh-Hant',
  'nb':       'no',
  'nn':       'no',
  'nb-no':    'no',
  'nn-no':    'no',
  'no-no':    'no'
};

/**
 * Look up the full Language descriptor for a given code.
 * @param {string} code
 * @returns {Language | undefined}
 */
export function findLanguage(code) {
  return LANGUAGES.find(l => l.code === code);
}
