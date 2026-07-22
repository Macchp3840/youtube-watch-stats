/*
 * app.js
 * Gestisce l'interfaccia: caricamento file, ricerca youtuber e classifica Top 10.
 * Le stringhe testuali passano da window.i18n (vedi i18n.js) per il supporto multilingua.
 */

(function () {
  'use strict';

  const i18n = window.i18n;

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

  // Statistiche correnti (impostate dopo il parsing) e ultima ricerca digitata.
  let stats = null;
  let lastQuery = '';

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

    updateStats();
    renderTop10();
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

  function renderTop10() {
    const top = stats.channels.slice(0, 10);
    const max = top.length ? top[0].count : 1;
    topList.innerHTML = '';

    top.forEach(function (ch, i) {
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
  }

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
    fileInput.value = '';
    resultsScreen.classList.add('hidden');
    uploadScreen.classList.remove('hidden');
    hideError();
  });

  // --- Cambio lingua: ridisegna i contenuti dinamici già a schermo ---
  i18n.onChange(function () {
    if (stats) {
      updateStats();
      renderTop10();
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
