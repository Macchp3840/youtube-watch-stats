/*
 * app.js
 * Gestisce l'interfaccia: caricamento file, ricerca youtuber, classifica dei canali
 * e classifica dei video più rivisti. Entrambe le classifiche partono da 10 voci e
 * si espandono a blocchi.
 * Le stringhe testuali passano da window.i18n (vedi i18n.js) per il supporto multilingua.
 */

(function () {
  'use strict';

  const i18n = window.i18n;

  // Quante voci mostrare all'inizio e quante aggiungerne a ogni "Mostra altri".
  const INITIAL     = 10;
  const STEP_CHANNELS = 20;
  const STEP_VIDEOS   = 15;

  // --- Riferimenti al DOM ---
  const uploadScreen  = document.getElementById('uploadScreen');
  const resultsScreen = document.getElementById('resultsScreen');
  const dropzone      = document.getElementById('dropzone');
  const fileInput     = document.getElementById('fileInput');
  const loading       = document.getElementById('loading');
  const loadingText   = document.getElementById('loadingText');
  const errorMsg      = document.getElementById('errorMsg');

  const statTotal     = document.getElementById('statTotal');
  const statChannels  = document.getElementById('statChannels');
  const statTop       = document.getElementById('statTop');
  const resetBtn      = document.getElementById('resetBtn');

  const searchInput   = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  const topList       = document.getElementById('topList');
  const topMore       = document.getElementById('topMore');

  const videoList     = document.getElementById('videoList');
  const videoNote     = document.getElementById('videoNote');
  const videoMore     = document.getElementById('videoMore');
  const thumbsCheck   = document.getElementById('thumbsCheck');

  // Statistiche correnti (impostate dopo il parsing) e stato della UI.
  let stats = null;
  let lastQuery = '';
  let shownChannels = INITIAL;
  let shownVideos = INITIAL;
  let showThumbs = true;

  /** Formatta un numero secondo la lingua attiva. */
  function fmt(n) {
    return new Intl.NumberFormat(i18n.get() === 'it' ? 'it-IT' : 'en-US').format(n);
  }

  // --- Caricamento file ---

  fileInput.addEventListener('change', function (e) {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  ['dragenter', 'dragover'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropzone.classList.add('dropzone--over');
    });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropzone.classList.remove('dropzone--over');
    });
  });
  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  function handleFile(file) {
    hideError();

    if (!/\.html?$/i.test(file.name)) {
      showError(i18n.t('error.notHtml'));
      return;
    }

    loading.classList.remove('hidden');
    loadingText.textContent = i18n.t('loading.read');

    const reader = new FileReader();
    reader.onerror = function () {
      loading.classList.add('hidden');
      showError(i18n.t('error.read'));
    };
    reader.onload = function () {
      loadingText.textContent = i18n.t('loading.analyze');
      // Lascio ridisegnare l'UI prima di eseguire il parsing (che blocca il thread).
      setTimeout(function () {
        try {
          stats = window.WatchHistoryParser.parse(reader.result);
          if (stats.totalVideos === 0) {
            loading.classList.add('hidden');
            showError(i18n.t('error.noViews'));
            return;
          }
          renderResults();
        } catch (err) {
          loading.classList.add('hidden');
          showError(i18n.t('error.parse') + err.message);
        }
      }, 30);
    };
    reader.readAsText(file, 'utf-8');
  }

  // --- Rendering dei risultati ---

  function renderResults() {
    loading.classList.add('hidden');
    uploadScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    shownChannels = INITIAL;
    shownVideos = INITIAL;

    updateStats();
    renderChannels();
    renderVideos();
    searchInput.value = '';
    lastQuery = '';
    renderSearch('');
    searchInput.focus();
  }

  function updateStats() {
    statTotal.textContent    = fmt(stats.totalVideos);
    statChannels.textContent = fmt(stats.channels.length);
    statTop.textContent      = stats.channels.length ? stats.channels[0].name : '—';
    statTop.title            = statTop.textContent;
  }

  /**
   * Disegna i pulsanti "Mostra altri" / "Riduci" sotto una classifica.
   * @param {HTMLElement} box - contenitore dei pulsanti.
   * @param {number} shown - voci attualmente visibili.
   * @param {number} total - voci disponibili.
   * @param {number} step - quante aggiungerne per volta.
   * @param {Function} onChange - riceve il nuovo numero di voci da mostrare.
   */
  function renderMoreControls(box, shown, total, step, onChange) {
    box.innerHTML = '';
    if (total <= INITIAL) return;

    if (shown < total) {
      const next = Math.min(step, total - shown);
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'listmore__btn';
      more.textContent = next === 1
        ? i18n.t('list.more.one')
        : i18n.t('list.more', { n: fmt(next) });
      more.addEventListener('click', function () { onChange(shown + step); });
      box.appendChild(more);
    } else {
      const done = document.createElement('span');
      done.className = 'listmore__done';
      done.textContent = i18n.t('list.allShown');
      box.appendChild(done);
    }

    if (shown > INITIAL) {
      const less = document.createElement('button');
      less.type = 'button';
      less.className = 'listmore__btn listmore__btn--ghost';
      less.textContent = i18n.t('list.less');
      less.addEventListener('click', function () { onChange(INITIAL); });
      box.appendChild(less);
    }
  }

  // --- Classifica youtuber ---

  function renderChannels() {
    const all = stats.channels;
    shownChannels = Math.min(Math.max(shownChannels, INITIAL), Math.max(all.length, INITIAL));
    const list = all.slice(0, shownChannels);
    const max = all.length ? all[0].count : 1;

    topList.innerHTML = '';
    list.forEach(function (ch, i) {
      const li = document.createElement('li');
      li.className = 'toplist__item';
      li.innerHTML =
        '<span class="toplist__rank">' + (i + 1) + '</span>' +
        '<div class="toplist__body">' +
          '<div class="toplist__head">' +
            '<a class="toplist__name" href="' + ch.url + '" target="_blank" rel="noopener"></a>' +
            '<span class="toplist__count">' + fmt(ch.count) + '</span>' +
          '</div>' +
          '<div class="bar"><div class="bar__fill" style="width:' + (ch.count / max * 100) + '%"></div></div>' +
        '</div>';
      li.querySelector('.toplist__name').textContent = ch.name;
      topList.appendChild(li);
    });

    renderMoreControls(topMore, shownChannels, all.length, STEP_CHANNELS, function (n) {
      shownChannels = n;
      renderChannels();
    });
  }

  // --- Classifica video più rivisti ---

  function renderVideos() {
    const all = stats.videos;
    shownVideos = Math.min(Math.max(shownVideos, INITIAL), Math.max(all.length, INITIAL));
    const list = all.slice(0, shownVideos);
    const max = all.length ? all[0].count : 1;

    videoList.innerHTML = '';
    list.forEach(function (v, i) {
      videoList.appendChild(buildVideoItem(v, i + 1, max));
    });

    // Nota sui video visti una volta sola (esclusi dalla classifica).
    const notes = [];
    if (!all.length) notes.push(i18n.t('videos.empty'));
    if (stats.videosOnce === 1) notes.push(i18n.t('videos.once.one'));
    else if (stats.videosOnce) notes.push(i18n.t('videos.once', { n: fmt(stats.videosOnce) }));
    videoNote.textContent = notes.join(' ');
    videoNote.classList.toggle('hidden', !notes.length);

    renderMoreControls(videoMore, shownVideos, all.length, STEP_VIDEOS, function (n) {
      shownVideos = n;
      renderVideos();
    });
  }

  function buildVideoItem(v, rank, max) {
    const li = document.createElement('li');
    li.className = 'videolist__item';

    const rankEl = document.createElement('span');
    rankEl.className = 'videolist__rank';
    rankEl.textContent = rank;
    li.appendChild(rankEl);

    if (showThumbs) {
      const thumbLink = document.createElement('a');
      thumbLink.className = 'videolist__thumb';
      thumbLink.href = v.url;
      thumbLink.target = '_blank';
      thumbLink.rel = 'noopener';

      const img = document.createElement('img');
      // Niente loading="lazy": la lista cresce solo di 15 voci per volta, quindi le
      // richieste restano poche, e il caricamento pigro non parte nei contesti in cui
      // la pagina viene renderizzata fuori schermo (anteprime, tab in background).
      img.referrerPolicy = 'no-referrer';
      img.decoding = 'async';
      img.alt = '';
      img.src = 'https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg';
      // Video rimossi o privati: al posto della miniatura resta il riquadro vuoto.
      // YouTube non risponde 404, restituisce un segnaposto grigio 120x90: lo riconosco
      // dalle dimensioni, perché una miniatura vera è 320x180.
      function markMissing() {
        thumbLink.classList.add('videolist__thumb--empty');
        img.remove();
      }
      img.addEventListener('error', markMissing);
      img.addEventListener('load', function () {
        if (img.naturalWidth <= 120) markMissing();
      });
      thumbLink.appendChild(img);
      li.appendChild(thumbLink);
    }

    const body = document.createElement('div');
    body.className = 'videolist__body';

    const head = document.createElement('div');
    head.className = 'videolist__head';

    const title = document.createElement('a');
    title.className = 'videolist__title';
    title.href = v.url;
    title.target = '_blank';
    title.rel = 'noopener';
    title.textContent = v.title;
    title.title = v.title;

    const count = document.createElement('span');
    count.className = 'videolist__count';
    count.textContent = i18n.t('video.views', { n: fmt(v.count) });

    head.appendChild(title);
    head.appendChild(count);
    body.appendChild(head);

    if (v.channelName) {
      const ch = document.createElement('a');
      ch.className = 'videolist__channel';
      ch.href = v.channelUrl;
      ch.target = '_blank';
      ch.rel = 'noopener';
      ch.textContent = v.channelName;
      body.appendChild(ch);
    } else {
      const ch = document.createElement('span');
      ch.className = 'videolist__channel videolist__channel--none';
      ch.textContent = i18n.t('video.channelUnknown');
      body.appendChild(ch);
    }

    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    fill.className = 'bar__fill';
    fill.style.width = (v.count / max * 100) + '%';
    bar.appendChild(fill);
    body.appendChild(bar);

    li.appendChild(body);
    return li;
  }

  // --- Miniature on/off (l'unica richiesta di rete della pagina) ---

  try {
    const saved = localStorage.getItem('wss_thumbs');
    if (saved !== null) showThumbs = saved === '1';
  } catch (e) { /* ignora */ }
  thumbsCheck.checked = showThumbs;

  thumbsCheck.addEventListener('change', function () {
    showThumbs = thumbsCheck.checked;
    try { localStorage.setItem('wss_thumbs', showThumbs ? '1' : '0'); } catch (e) { /* ignora */ }
    if (stats) renderVideos();
  });

  // --- Ricerca ---

  searchInput.addEventListener('input', function () {
    lastQuery = searchInput.value;
    renderSearch(lastQuery);
  });

  function renderSearch(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
      searchResults.innerHTML =
        '<p class="search-hint">' + escapeHtml(i18n.t('search.hint')) + '</p>';
      return;
    }

    const matches = stats.channels
      .filter(function (ch) { return ch.name.toLowerCase().includes(q); })
      .slice(0, 50);

    if (!matches.length) {
      searchResults.innerHTML = '<p class="search-hint">' +
        escapeHtml(i18n.t('search.none', { q: query })) + '</p>';
      return;
    }

    searchResults.innerHTML = '';
    matches.forEach(function (ch) {
      const rank = stats.channels.indexOf(ch) + 1;
      const pct = (ch.count / stats.totalVideos * 100);
      const row = document.createElement('a');
      row.className = 'result';
      row.href = ch.url;
      row.target = '_blank';
      row.rel = 'noopener';
      row.innerHTML =
        '<span class="result__name"></span>' +
        '<span class="result__meta">' +
          '<span class="result__count">' + escapeHtml(i18n.t('result.videos', { n: fmt(ch.count) })) + '</span>' +
          '<span class="result__extra">#' + rank + ' · ' + pct.toFixed(pct < 1 ? 2 : 1) + '%</span>' +
        '</span>';
      row.querySelector('.result__name').textContent = ch.name;
      searchResults.appendChild(row);
    });
  }

  // --- Reset ---

  resetBtn.addEventListener('click', function () {
    stats = null;
    lastQuery = '';
    shownChannels = INITIAL;
    shownVideos = INITIAL;
    fileInput.value = '';
    resultsScreen.classList.add('hidden');
    uploadScreen.classList.remove('hidden');
    hideError();
  });

  // --- Cambio lingua: ridisegna i contenuti dinamici già a schermo ---
  i18n.onChange(function () {
    if (stats) {
      updateStats();
      renderChannels();
      renderVideos();
      renderSearch(lastQuery);
    }
  });

  // --- Utility ---

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }
  function hideError() {
    errorMsg.classList.add('hidden');
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // --- Avvio: inizializza le traduzioni ---
  i18n.init();
})();
