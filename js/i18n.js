/*
 * i18n.js
 * Gestione multilingua (Italiano / Inglese).
 * - Applica le traduzioni agli elementi con attributi data-i18n / data-i18n-html / data-i18n-ph.
 * - Ricorda la scelta in localStorage e rileva la lingua del browser al primo avvio.
 * - Espone window.i18n per le stringhe dinamiche generate da app.js.
 */

(function (global) {
  'use strict';

  const dict = {
    it: {
      // Schermata di caricamento
      'upload.title': 'Chi guardi davvero su YouTube?',
      'upload.subtitle': 'Carica il file <code>cronologia visualizzazioni.html</code> del tuo Google Takeout e scopri quanti video hai visto di ogni youtuber.',
      'dropzone.text': '<strong>Trascina qui</strong> il file oppure clicca per selezionarlo',
      'dropzone.hint': 'Il file resta sul tuo dispositivo: niente viene caricato online.',
      // Guida
      'guide.title': 'Dove trovo questo file?',
      'guide.step1': 'Vai su <a href="https://takeout.google.com" target="_blank" rel="noopener">takeout.google.com</a>, deseleziona tutto e spunta solo <strong>YouTube e YouTube Music</strong>.',
      'guide.step2': 'Clicca su <strong>«Tutti i dati di YouTube inclusi»</strong> e lascia selezionata la <strong>cronologia</strong>. In <strong>«Più formati»</strong> assicurati che <strong>Cronologia</strong> sia impostata su <strong>HTML</strong>.',
      'guide.step3': 'Avvia l\'esportazione, poi <strong>scarica</strong> l\'archivio <code>.zip</code> ed <strong>estrailo</strong>.',
      'guide.step4': 'Apri la cartella e trascina qui sopra il file:<div class="step__path">Takeout ▸ YouTube e YouTube Music ▸ cronologia ▸ <strong>cronologia visualizzazioni.html</strong></div><span class="step__note">Se il Takeout è in inglese il file si chiama <code>watch-history.html</code>.</span>',
      // Statistiche
      'stat.total': 'Video guardati',
      'stat.channels': 'Youtuber diversi',
      'stat.top': 'Il tuo #1',
      'stat.reset': 'Nuovo file',
      // Card
      'card.search': 'Cerca uno youtuber',
      'card.top': 'I tuoi youtuber più visti',
      'card.videos': 'I tuoi video più visti',
      'search.placeholder': 'Es. Favij, iNoobChannel…',
      'thumbs.label': 'Miniature',
      'thumbs.title': 'Le miniature vengono scaricate dai server di YouTube: è l\'unica richiesta che esce dal tuo dispositivo. Disattivale per non farne nessuna.',
      'footer': 'La tua cronologia viene elaborata solo nel browser e non lascia mai il tuo dispositivo. Con le miniature attive, le sole immagini di anteprima vengono richieste a YouTube.',
      // Dinamici (app.js)
      'loading.read': 'Lettura del file…',
      'loading.analyze': 'Analisi in corso…',
      'error.notHtml': 'Seleziona un file HTML (cronologia visualizzazioni.html).',
      'error.read': 'Impossibile leggere il file. Riprova.',
      'error.noViews': 'Nessuna visualizzazione trovata. Assicurati di aver scelto il file "cronologia visualizzazioni.html".',
      'error.parse': 'Errore durante l\'analisi: ',
      'search.hint': 'Scrivi il nome di uno youtuber per vedere quanti suoi video hai guardato.',
      'search.none': 'Nessuno youtuber trovato per «{q}».',
      'result.videos': '{n} video',
      'reset.title': 'Carica un altro file',
      'video.views': '{n} visualizzazioni',
      'video.channelUnknown': 'Canale non disponibile',
      'videos.empty': 'Non hai mai riguardato lo stesso video due volte.',
      'videos.once': 'Altri {n} video guardati una sola volta, fuori classifica.',
      'videos.once.one': 'Un altro video guardato una sola volta, fuori classifica.',
      'list.more': 'Mostra altri {n}',
      'list.more.one': 'Mostra l’ultimo',
      'list.less': 'Riduci',
      'list.allShown': 'Sono tutti.'
    },
    en: {
      // Upload screen
      'upload.title': 'Who do you really watch on YouTube?',
      'upload.subtitle': 'Upload your Google Takeout <code>watch-history.html</code> file and find out how many videos you watched from each YouTuber.',
      'dropzone.text': '<strong>Drop the file here</strong> or click to select it',
      'dropzone.hint': 'The file stays on your device: nothing is uploaded online.',
      // Guide
      'guide.title': 'Where do I find this file?',
      'guide.step1': 'Go to <a href="https://takeout.google.com" target="_blank" rel="noopener">takeout.google.com</a>, deselect everything and check only <strong>YouTube and YouTube Music</strong>.',
      'guide.step2': 'Click <strong>“All YouTube data included”</strong> and keep <strong>history</strong> selected. Under <strong>“Multiple formats”</strong> make sure <strong>History</strong> is set to <strong>HTML</strong>.',
      'guide.step3': 'Start the export, then <strong>download</strong> the <code>.zip</code> archive and <strong>extract</strong> it.',
      'guide.step4': 'Open the folder and drag the file above:<div class="step__path">Takeout ▸ YouTube and YouTube Music ▸ history ▸ <strong>watch-history.html</strong></div><span class="step__note">If your Takeout is in Italian the file is called <code>cronologia visualizzazioni.html</code>.</span>',
      // Stats
      'stat.total': 'Videos watched',
      'stat.channels': 'Distinct YouTubers',
      'stat.top': 'Your #1',
      'stat.reset': 'New file',
      // Cards
      'card.search': 'Search a YouTuber',
      'card.top': 'Your most-watched YouTubers',
      'card.videos': 'Your most-watched videos',
      'search.placeholder': 'e.g. Favij, iNoobChannel…',
      'thumbs.label': 'Thumbnails',
      'thumbs.title': 'Thumbnails are downloaded from YouTube\'s servers: that is the only request leaving your device. Turn them off to make none.',
      'footer': 'Your history is processed in the browser only and never leaves your device. With thumbnails on, the preview images alone are requested from YouTube.',
      // Dynamic (app.js)
      'loading.read': 'Reading the file…',
      'loading.analyze': 'Analyzing…',
      'error.notHtml': 'Please select an HTML file (watch-history.html).',
      'error.read': 'Could not read the file. Please try again.',
      'error.noViews': 'No views found. Make sure you selected the "watch-history.html" file.',
      'error.parse': 'Error while analyzing: ',
      'search.hint': 'Type a YouTuber\'s name to see how many of their videos you watched.',
      'search.none': 'No YouTuber found for “{q}”.',
      'result.videos': '{n} videos',
      'reset.title': 'Load another file',
      'video.views': '{n} views',
      'video.channelUnknown': 'Channel unavailable',
      'videos.empty': 'You never watched the same video twice.',
      'videos.once': '{n} more videos watched only once, outside the ranking.',
      'videos.once.one': '1 more video watched only once, outside the ranking.',
      'list.more': 'Show {n} more',
      'list.more.one': 'Show the last one',
      'list.less': 'Collapse',
      'list.allShown': 'That\'s all of them.'
    }
  };

  let current = 'it';
  const listeners = [];

  /** Restituisce la traduzione della chiave nella lingua corrente (con fallback). */
  function t(key, vars) {
    let s = (dict[current] && dict[current][key]) || dict.it[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.replace('{' + k + '}', vars[k]);
      });
    }
    return s;
  }

  /** Applica le traduzioni a tutti gli elementi marcati nel DOM. */
  function apply() {
    document.documentElement.lang = current;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      const active = b.getAttribute('data-lang-btn') === current;
      b.classList.toggle('langswitch__btn--active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    listeners.forEach(function (fn) { fn(current); });
  }

  /** Imposta la lingua e ridisegna. */
  function set(lang) {
    if (!dict[lang]) return;
    current = lang;
    try { localStorage.setItem('wss_lang', lang); } catch (e) { /* ignora */ }
    apply();
  }

  /** Inizializza: lingua salvata > lingua del browser > italiano. */
  function init() {
    let saved = null;
    try { saved = localStorage.getItem('wss_lang'); } catch (e) { /* ignora */ }
    if (saved && dict[saved]) {
      current = saved;
    } else {
      const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
      current = nav.startsWith('it') ? 'it' : 'en';
    }

    // Collega i pulsanti dello switch.
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.addEventListener('click', function () { set(b.getAttribute('data-lang-btn')); });
    });

    apply();
  }

  global.i18n = {
    t: t,
    set: set,
    get: function () { return current; },
    onChange: function (fn) { listeners.push(fn); },
    init: init
  };
})(window);
