// One-shot cleanup after the guide was consolidated from 6 HTML pages to 3.
// Extracts all data-i18n keys still used in index/format/faq, drops any key
// absent from that set across all 30 language JSONs, and adds English defaults
// for brand-new keys introduced in the rewrite (es-ES gets Spanish too).
//
// Run: node scripts/i18n-simplify.mjs  (from tied-to-the-beat-workshop root)

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const i18nDir = join(root, 'i18n');

const htmlFiles = ['index.html', 'format.html', 'faq.html', '404.html'];

// ─── Collect every key referenced in the surviving HTML files ───────────────

const usedKeys = new Set();

for (const htmlName of htmlFiles) {
  const html = readFileSync(join(root, htmlName), 'utf8');

  // data-i18n="key" and data-i18n-html="key"
  for (const match of html.matchAll(/data-i18n(?:-html)?=["']([^"']+)["']/g)) {
    usedKeys.add(match[1]);
  }
  // data-i18n-attr="attr:key"
  for (const match of html.matchAll(/data-i18n-attr=["'][^"':]*:([^"']+)["']/g)) {
    usedKeys.add(match[1]);
  }
}

// ─── English translations for new / overhauled keys ─────────────────────────

const NEW_EN = {
  'meta.home.title': 'Tied to the Beat — Workshop guide',
  'meta.home.description': 'Share and play community lyrics (LRC) and custom tracks for Tied to the Beat via Steam Workshop. One file format, three steps, no setup.',
  'home.h1': 'The Community Workshop',
  'home.lead.html': 'Upload an <strong>MP3 + synchronized lyrics</strong> — everyone who owns the game can subscribe and play it. One standard format, three steps.',
  'home.cta.open': 'Browse the Workshop on Steam',
  'home.cta.format': 'See the LRC format →',
  'home.h2.how': 'How it works',
  'home.step.1.title': 'Get a shareable MP3',
  'home.step.1.desc.html': 'Your own music, Public Domain, or a royalty-free track from <a href="https://pixabay.com/music/" target="_blank" rel="noopener">Pixabay</a>. Anything you have rights to redistribute.',
  'home.step.2.title': 'Write a <code>lyrics.lrc</code>',
  'home.step.2.desc.html': 'Plain text file with song metadata and line-by-line timestamps. Use the template below — it\'s the <a href="format.html">exact format the game expects</a>.',
  'home.step.3.title': 'Import in-game and upload',
  'home.step.3.desc': 'In-game: Main menu → Import song → drop both files → review → Upload to Workshop. Steam handles the rest.',
  'home.h2.template': 'The standard LRC format',
  'home.template.intro.html': 'Copy this template, replace the values, sync your timestamps. <strong>Every Workshop item uses this exact shape</strong> — it\'s how the game parses metadata, triggers gameplay effects, and attributes audio sources.',
  'home.template.outro.html': 'All 11 header tags explained on the <a href="format.html">format reference</a>. The <code>[source:]</code> and <code>[license:]</code> tags are <strong>required</strong> — they\'re how uploaders stay honest about where their audio came from.',
  'home.h2.music': 'Music you can legally share',
  'home.music.pixabay.title': 'Pixabay Music',
  'home.music.pixabay.desc.html': 'Easiest. Huge catalog, commercial use allowed, <strong>no attribution required</strong>.',
  'home.music.fma.title': 'Free Music Archive',
  'home.music.fma.desc': 'Creative Commons catalog. Attribution usually required — credit the artist in <code>[source:]</code>.',
  'home.music.yt.title': 'YouTube Audio Library',
  'home.music.yt.desc': 'Curated royalty-free tracks. Usable outside YouTube. Requires a free Google account.',
  'home.music.own.title': 'Your own music',
  'home.music.own.desc': 'Always safe. Zero legal risk, full ownership, yours to share.',
  'home.callout.copyright.html': '<strong>Respect copyright.</strong> Only upload music you have rights to redistribute. Steam enforces DMCA and <strong>you are responsible for what you upload</strong>. When unsure, prefer Pixabay or your own compositions.',
  'home.callout.steam.html': '<strong>Steam only.</strong> The Workshop needs the Steam build of the game. Players on Epic or standalone can still import local songs but can\'t browse or subscribe to community tracks.',

  // faq.html — simplified
  'meta.faq.title': 'FAQ — Tied to the Beat Workshop',
  'meta.faq.description': 'Answers to common questions about the Tied to the Beat community Workshop — copyright, platforms, updates, moderation.',
  'faq.h1': 'FAQ',
  'faq.h2.platforms': 'Platforms',
  'faq.plat.epic.q': 'Can I use the Workshop on Epic or standalone?',
  'faq.plat.epic.a': 'No — the Workshop is a Steam feature. Non-Steam players can still import local songs, but can\'t subscribe to or upload community tracks.',
  'faq.plat.offline.q': 'Does it work offline?',
  'faq.plat.offline.a': 'Subscribed tracks work offline once Steam has finished downloading them. New uploads and subscriptions need an internet connection.',
  'faq.plat.private.q': 'Can I keep my upload private until it\'s ready?',
  'faq.plat.private.a.html': 'Yes. Pick <strong>Unlisted</strong> (accessible only by URL) or <strong>Friends only</strong> when uploading. You can flip to Public anytime from the item page on Steam.',
  'faq.h2.copyright': 'Copyright',
  'faq.cr.songs.q': 'Can I upload a song I didn\'t write?',
  'faq.cr.songs.a.html': '<strong>Only if it\'s legally redistributable</strong>:',
  'faq.cr.songs.li1': 'Your own compositions.',
  'faq.cr.songs.li2': 'Public domain works (verify the duration in your country — typically life of author + 70 years).',
  'faq.cr.songs.li3': 'Royalty-free or Creative Commons tracks (respect the license — attribute the artist in <code>[source:]</code>).',
  'faq.cr.songs.a2.html': 'You <strong>cannot</strong> upload copyrighted commercial music without permission from the rights holders. Doing so leads to DMCA takedowns and Steam account penalties.',
  'faq.cr.responsibility.q': 'Who is responsible for what I upload?',
  'faq.cr.responsibility.a.html': 'You are. The game provides the Workshop as a neutral platform; uploaders control and are responsible for content. Read Steam\'s <a href="https://store.steampowered.com/workshoplegalagreement/" target="_blank" rel="noopener">Workshop Legal Agreement</a> before uploading.',
  'faq.cr.report.q': 'How do I report a violation?',
  'faq.cr.report.a.html': 'On the Workshop item page: <strong>…</strong> menu → <strong>Report</strong>. If you\'re the copyright holder, use Steam\'s <a href="https://help.steampowered.com/en/faqs/view/5A1D-18EA-7A1C-78C2" target="_blank" rel="noopener">formal DMCA process</a>.',
  'faq.h2.editing': 'Updates & deletion',
  'faq.ed.update.q': 'Can I update my uploaded track?',
  'faq.ed.update.a.html': 'Yes — open your Workshop track in-game, edit the LRC, and click <strong>Update on Workshop</strong>. Subscribers get the update automatically the next time Steam syncs.',
  'faq.ed.delete.q': 'Can I delete my upload?',
  'faq.ed.delete.a.html': 'Yes. Either from in-game (your uploaded tracks), or on the Workshop page → <strong>…</strong> → <strong>Delete</strong>. Subscribers lose access immediately.',
  'faq.ed.edit.q': 'Can I edit someone else\'s upload?',
  'faq.ed.edit.a.html': 'Not directly. You can download their LRC, edit it, and re-upload as <strong>your own</strong> item with credit to the original author in the description.',
  'faq.h2.tech': 'Technical',
  'faq.t.files.q': 'Where are Workshop files stored?',
  'faq.t.files.a.html': 'Steam handles this at <code>&lt;Steam library&gt;/steamapps/workshop/content/4316340/&lt;itemid&gt;/</code>. You never need to touch these folders — everything routes through the game\'s track list.',
  'faq.t.size.q': 'Upload size limits?',
  'faq.t.size.a.html': 'MP3s up to <strong>50 MB</strong>. Lyrics-only uploads are typically 5–15 KB.',
  'faq.t.duration.q': 'Supported song durations?',
  'faq.t.duration.a.html': 'Between <strong>2 and 6 minutes</strong>. Outside that range the import validator rejects the file — run pacing and progression are tuned around this window.',
  'faq.t.unsupported.q': 'Which LRC features aren\'t supported?',
  'faq.t.unsupported.a': 'The game ignores:',
  'faq.t.unsupported.li1': 'Bilingual dual-line LRC (use separate uploads per language).',
  'faq.t.unsupported.li2': 'HTML/CSS styling tags (<code>&lt;font&gt;</code>, <code>&lt;b&gt;</code>, …).',
  'faq.t.unsupported.li3': 'Karaoke color transitions (<code>{\\k}</code> ASS tags).',
  'faq.t.bug.q': 'I found a bug. Where do I report?',
  'faq.t.bug.a.html': 'Game-side: <a href="https://steamcommunity.com/app/4316340/discussions/" target="_blank" rel="noopener">Steam discussions</a>. Guide-side: <a href="https://github.com/JaviLianes8/tied-to-the-beat-workshop/issues" target="_blank" rel="noopener">GitHub issues</a>.',
  'faq.btn.back': '← Back to guide',
  'faq.btn.format': 'LRC format reference',

  // format.html tweaks
  'format.example.intro.html': 'This is the exact format of the Workshop\'s bootstrap item <em>Bass Boom Kids</em> — the reference every upload follows:',
  'format.btn.back': '← Back to guide',
};

const NEW_ES = {
  'meta.home.title': 'Tied to the Beat — Guía del Workshop',
  'meta.home.description': 'Comparte y juega letras (LRC) y canciones custom de la comunidad de Tied to the Beat en Steam Workshop. Un formato, tres pasos, sin configurar nada.',
  'home.h1': 'Workshop de la comunidad',
  'home.lead.html': 'Sube un <strong>MP3 con letras sincronizadas</strong> — quien tenga el juego podrá suscribirse y jugarlo. Un formato estándar, tres pasos.',
  'home.cta.open': 'Abrir el Workshop en Steam',
  'home.cta.format': 'Ver el formato LRC →',
  'home.h2.how': 'Cómo funciona',
  'home.step.1.title': 'Consigue un MP3 que puedas compartir',
  'home.step.1.desc.html': 'Tu propia música, dominio público, o música libre de derechos de <a href="https://pixabay.com/music/" target="_blank" rel="noopener">Pixabay</a>. Cualquier cosa que tengas derecho a redistribuir.',
  'home.step.2.title': 'Escribe un <code>lyrics.lrc</code>',
  'home.step.2.desc.html': 'Fichero de texto con metadata de la canción y una línea por frase con timestamp. Usa la plantilla de abajo — es <a href="format.html">el formato exacto que espera el juego</a>.',
  'home.step.3.title': 'Importa en el juego y sube',
  'home.step.3.desc': 'En el juego: menú principal → Importar canción → suelta ambos ficheros → revisa → Subir al Workshop. Steam hace el resto.',
  'home.h2.template': 'El formato LRC estándar',
  'home.template.intro.html': 'Copia esta plantilla, reemplaza los valores, sincroniza tus timestamps. <strong>Todos los items del Workshop usan esta misma estructura</strong> — así es como el juego lee la metadata, dispara los efectos y atribuye el origen del audio.',
  'home.template.outro.html': 'Los 11 headers explicados en la <a href="format.html">referencia del formato</a>. Los tags <code>[source:]</code> y <code>[license:]</code> son <strong>obligatorios</strong> — son la forma de que los uploaders indiquen honestamente de dónde viene el audio.',
  'home.h2.music': 'Música que puedes compartir legalmente',
  'home.music.pixabay.title': 'Pixabay Music',
  'home.music.pixabay.desc.html': 'El más fácil. Catálogo enorme, uso comercial permitido, <strong>sin atribución obligatoria</strong>.',
  'home.music.fma.title': 'Free Music Archive',
  'home.music.fma.desc': 'Catálogo Creative Commons. Normalmente exige atribución — acredita al artista en <code>[source:]</code>.',
  'home.music.yt.title': 'YouTube Audio Library',
  'home.music.yt.desc': 'Selección royalty-free. Utilizable fuera de YouTube. Requiere cuenta Google gratuita.',
  'home.music.own.title': 'Tu propia música',
  'home.music.own.desc': 'Siempre seguro. Cero riesgo legal, propiedad total, totalmente tuyo para compartir.',
  'home.callout.copyright.html': '<strong>Respeta el copyright.</strong> Sube solo música que tengas derecho a redistribuir. Steam aplica DMCA y <strong>tú eres responsable de lo que subes</strong>. Si tienes dudas, usa Pixabay o composiciones propias.',
  'home.callout.steam.html': '<strong>Solo en Steam.</strong> El Workshop requiere la versión Steam del juego. Los jugadores en Epic o standalone pueden seguir importando canciones locales, pero no pueden navegar ni suscribirse a contenido de la comunidad.',

  'meta.faq.title': 'FAQ — Tied to the Beat Workshop',
  'meta.faq.description': 'Respuestas a preguntas frecuentes sobre el Workshop de la comunidad de Tied to the Beat — copyright, plataformas, actualizaciones, moderación.',
  'faq.h1': 'Preguntas frecuentes',
  'faq.h2.platforms': 'Plataformas',
  'faq.plat.epic.q': '¿Puedo usar el Workshop en Epic o standalone?',
  'faq.plat.epic.a': 'No — el Workshop es una funcionalidad de Steam. Los jugadores fuera de Steam pueden importar canciones locales, pero no pueden suscribirse ni subir contenido de la comunidad.',
  'faq.plat.offline.q': '¿Funciona sin conexión?',
  'faq.plat.offline.a': 'Las canciones a las que te hayas suscrito funcionan sin conexión una vez Steam las haya descargado. Subir algo o suscribirte necesita conexión.',
  'faq.plat.private.q': '¿Puedo mantener mi subida privada hasta que esté lista?',
  'faq.plat.private.a.html': 'Sí. Elige <strong>No listada</strong> (solo accesible por URL) o <strong>Solo amigos</strong> al subir. Puedes cambiar a Pública en cualquier momento desde la página del item en Steam.',
  'faq.h2.copyright': 'Copyright',
  'faq.cr.songs.q': '¿Puedo subir una canción que no he compuesto yo?',
  'faq.cr.songs.a.html': '<strong>Solo si es redistribuible legalmente</strong>:',
  'faq.cr.songs.li1': 'Composiciones propias.',
  'faq.cr.songs.li2': 'Obras en dominio público (verifica el plazo en tu país — típicamente vida del autor + 70 años).',
  'faq.cr.songs.li3': 'Música royalty-free o Creative Commons (respeta la licencia — acredita al artista en <code>[source:]</code>).',
  'faq.cr.songs.a2.html': '<strong>No puedes</strong> subir música comercial con copyright sin permiso de los titulares. Hacerlo lleva a retiradas DMCA y sanciones en tu cuenta Steam.',
  'faq.cr.responsibility.q': '¿Quién es responsable de lo que subo?',
  'faq.cr.responsibility.a.html': 'Tú. El juego proporciona el Workshop como plataforma neutral; los uploaders controlan y son responsables del contenido. Lee el <a href="https://store.steampowered.com/workshoplegalagreement/" target="_blank" rel="noopener">Acuerdo Legal del Workshop de Steam</a> antes de subir.',
  'faq.cr.report.q': '¿Cómo denuncio una infracción?',
  'faq.cr.report.a.html': 'En la página del item del Workshop: menú <strong>…</strong> → <strong>Denunciar</strong>. Si eres el titular del copyright, usa el <a href="https://help.steampowered.com/en/faqs/view/5A1D-18EA-7A1C-78C2" target="_blank" rel="noopener">proceso formal DMCA de Steam</a>.',
  'faq.h2.editing': 'Actualizaciones y borrado',
  'faq.ed.update.q': '¿Puedo actualizar una canción que ya subí?',
  'faq.ed.update.a.html': 'Sí — abre tu canción del Workshop en el juego, edita el LRC, y pulsa <strong>Actualizar en Workshop</strong>. Los suscriptores reciben la actualización automáticamente la próxima vez que Steam sincronice.',
  'faq.ed.delete.q': '¿Puedo borrar mi subida?',
  'faq.ed.delete.a.html': 'Sí. Desde el juego (tus canciones subidas), o en la página del Workshop → <strong>…</strong> → <strong>Borrar</strong>. Los suscriptores pierden acceso inmediatamente.',
  'faq.ed.edit.q': '¿Puedo editar la subida de otra persona?',
  'faq.ed.edit.a.html': 'No directamente. Puedes descargar su LRC, editarlo, y volver a subirlo como <strong>item tuyo</strong> dando crédito al autor original en la descripción.',
  'faq.h2.tech': 'Técnico',
  'faq.t.files.q': '¿Dónde se guardan los ficheros del Workshop?',
  'faq.t.files.a.html': 'Steam los gestiona en <code>&lt;biblioteca Steam&gt;/steamapps/workshop/content/4316340/&lt;idItem&gt;/</code>. No necesitas tocar estas carpetas — todo pasa por la lista de canciones del juego.',
  'faq.t.size.q': '¿Tamaño máximo de subida?',
  'faq.t.size.a.html': 'MP3s hasta <strong>50 MB</strong>. Los LRCs sueltos suelen ocupar 5–15 KB.',
  'faq.t.duration.q': '¿Qué duración de canción se acepta?',
  'faq.t.duration.a.html': 'Entre <strong>2 y 6 minutos</strong>. Fuera de ese rango el validador rechaza el fichero — el ritmo de la partida y la progresión están calibrados para esa ventana.',
  'faq.t.unsupported.q': '¿Qué features de LRC no soporta el juego?',
  'faq.t.unsupported.a': 'El juego ignora:',
  'faq.t.unsupported.li1': 'LRC bilingüe de doble línea (usa una subida separada por idioma).',
  'faq.t.unsupported.li2': 'Tags HTML/CSS (<code>&lt;font&gt;</code>, <code>&lt;b&gt;</code>, …).',
  'faq.t.unsupported.li3': 'Transiciones de color de karaoke (tags ASS <code>{\\k}</code>).',
  'faq.t.bug.q': 'He encontrado un bug. ¿Dónde lo reporto?',
  'faq.t.bug.a.html': 'Del juego: <a href="https://steamcommunity.com/app/4316340/discussions/" target="_blank" rel="noopener">Discusiones de Steam</a>. De la guía: <a href="https://github.com/JaviLianes8/tied-to-the-beat-workshop/issues" target="_blank" rel="noopener">Issues en GitHub</a>.',
  'faq.btn.back': '← Volver a la guía',
  'faq.btn.format': 'Referencia del formato LRC',

  'format.example.intro.html': 'Este es el formato exacto del item bootstrap del Workshop <em>Bass Boom Kids</em> — la referencia que sigue cualquier subida:',
  'format.btn.back': '← Volver a la guía',
};

// ─── Apply cleanup to every language JSON ───────────────────────────────────

const files = readdirSync(i18nDir).filter((f) => f.endsWith('.json'));
let removedTotal = 0;
let addedTotal = 0;

for (const file of files) {
  const path = join(i18nDir, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));

  // Drop any key not referenced in surviving HTML.
  for (const k of Object.keys(data)) {
    if (!usedKeys.has(k)) {
      delete data[k];
      removedTotal++;
    }
  }

  const lang = file.replace('.json', '');
  const additions = lang === 'en' ? NEW_EN : lang === 'es-ES' ? NEW_ES : null;
  if (additions) {
    for (const [k, v] of Object.entries(additions)) {
      if (usedKeys.has(k) && data[k] !== v) {
        data[k] = v;  // overwrite: NEW_EN is the canonical source
        addedTotal++;
      }
    }
  }

  const sorted = Object.keys(data).sort().reduce((acc, k) => ({ ...acc, [k]: data[k] }), {});
  writeFileSync(path, JSON.stringify(sorted, null, 2) + '\n');
}

console.log(`Used keys in HTML: ${usedKeys.size}`);
console.log(`Removed ${removedTotal} obsolete key-instances across ${files.length} JSON files.`);
console.log(`Added ${addedTotal} translations in en + es-ES for newly-introduced keys.`);
