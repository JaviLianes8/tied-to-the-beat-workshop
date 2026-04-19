# Tied to the Beat — Workshop Guide

Public documentation site for the [Tied to the Beat](https://store.steampowered.com/app/4316340/) Steam Workshop.

**Live site:** https://javilianes8.github.io/tied-to-the-beat-workshop/

Pure static HTML + CSS + ES-module JS (no build step). Auto-deployed to GitHub Pages on every push to `main`.

## Goals

- **KISS.** No framework, no bundler, no node_modules in the repo. Read the files top-to-bottom and you see what runs in the browser.
- **SOLID.** Each module, stylesheet, and page has one responsibility. Swap any piece without touching the rest.
- **Small files.** Nothing over ~200 lines so every file fits on one screen and reads like prose.
- **JSDoc everywhere.** Every JS module and public function has a header explaining *why* it exists, not just *what* it does.
- **30 languages.** Browser auto-detect, URL override (`?lang=xx`), localStorage memory, RTL support.

## Folder tree

```
.
├── index.html              Landing
├── subscribe.html          How to play community tracks
├── create.html             How to create & upload
├── tools.html              External LRC editors
├── format.html             LRC file-format reference
├── faq.html                FAQ
├── workshop-steamworks-copy.html   Admin-only: copy-paste Workshop title/desc in 30 langs
│
├── assets/
│   ├── css/                ── single-concern stylesheets, imported by main.css ──
│   │   ├── main.css            entry, @imports everything below
│   │   ├── tokens.css          :root custom properties (palette, sizes)
│   │   ├── base.css            body + <main> shell
│   │   ├── typography.css      h1/h2/h3/p/a/strong/em
│   │   ├── code.css            code/kbd/pre/.lyric-preview
│   │   ├── layout.css          grid helpers
│   │   ├── hero.css            landing hero + vinyl grooves
│   │   ├── nav.css             sticky nav + shimmer beam
│   │   ├── lang-picker.css     language dropdown
│   │   ├── cards.css           clickable content cards
│   │   ├── steps.css           numbered walkthrough lists
│   │   ├── callouts.css        inline advisory boxes
│   │   ├── buttons.css         .btn + .btn-row
│   │   ├── table.css           data tables
│   │   ├── lists.css           bulleted <ul>
│   │   ├── footer.css          footer
│   │   ├── notes-bg.css        falling-note background
│   │   └── responsive.css      @media rules + a11y toggles
│   │
│   ├── js/                 ── ES modules, entry = main.js ──
│   │   ├── main.js             bootstrap entry
│   │   ├── languages.js        30-language registry + BCP-47 aliases
│   │   ├── notes.js            falling-note effect
│   │   └── i18n/
│   │       ├── bootstrap.js    orchestrates the i18n pipeline
│   │       ├── detect.js       URL → storage → navigator language chain
│   │       ├── storage.js      localStorage preference
│   │       ├── catalog.js      fetch + apply swaps
│   │       └── picker.js       language picker UI
│   │
│   ├── img/                header.jpg, favicon.png
│   └── admin/              Steamworks copy-paste tool (standalone)
│       ├── steamworks-copy.css
│       ├── steamworks-copy.js
│       └── steamworks-data.js  30 native title+desc pairs
│
├── i18n/                   Translation catalogs, one per language
│   ├── en.json             Source of truth (373 keys)
│   ├── es-ES.json
│   ├── es-419.json
│   └── …                   Progressively added as they ship
│
└── .github/workflows/pages.yml   GitHub Pages deploy action
```

## How the i18n pipeline works

1. The HTML ships with English text inline — so every page renders correctly even if JavaScript is disabled or the JSON fails to load.
2. On load, `assets/js/main.js` calls `initI18n()` which:
   - Resolves the language via: `?lang=xx` URL param → `localStorage['ttb-workshop-lang']` → `navigator.languages` (through the BCP-47 alias table in `languages.js`) → `en` fallback.
   - Fetches `i18n/<code>.json`.
   - Walks every element with `data-i18n`, `data-i18n-html`, or `data-i18n-attr` and swaps in the localized string.
   - Updates `<html lang>` and `<html dir>` (RTL for Arabic).
   - Renders the language picker in the nav, listing only languages whose catalogs have shipped.
3. Picking a new language persists it to localStorage and reloads with `?lang=<code>` so the URL stays shareable.

## Adding a new language

1. Copy `i18n/en.json` to `i18n/<new-code>.json`, translate every value.
2. In `assets/js/languages.js`, flip the entry for that code to `available: true`.
3. Commit + push. The language picker picks it up automatically on the next deploy.

## Contributing

Found a typo, have a better explanation, know a great LRC tool?

1. Fork this repo.
2. Edit the relevant file (content → HTML; style → a single `assets/css/*.css`; behavior → a single `assets/js/*.js`).
3. Open a pull request.

Every merged PR triggers an automatic re-deploy to the live site.

## Local preview

No tooling required — any static server works. Example with Python:

```bash
python -m http.server 8080
# then visit http://localhost:8080
```

Opening the files directly via `file://` does not work because the ES modules and `fetch()` calls need an HTTP origin.

## License

[MIT](./LICENSE) — content and code are free to reuse with attribution.
