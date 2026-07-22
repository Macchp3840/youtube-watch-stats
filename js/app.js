/*
 * app.js
 * Gestisce l'interfaccia: caricamento file, ricerca youtuber e classifica Top 10.
 */

(function () {
  'use strict';

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

  // Statistiche correnti (impostate dopo il parsing).
  let stats = null;

  const nf = new Intl.NumberFormat('it-IT');

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
      showError('Seleziona un file HTML (cronologia visualizzazioni.html).');
      return;
    }

    loading.classList.remove('hidden');
    loadingText.textContent = 'Lettura del file…';

    const reader = new FileReader();
    reader.onerror = function () {
      loading.classList.add('hidden');
      showError('Impossibile leggere il file. Riprova.');
    };
    reader.onload = function () {
      loadingText.textContent = 'Analisi in corso…';
      // Lascio ridisegnare l'UI prima di eseguire il parsing (che blocca il thread).
      setTimeout(function () {
        try {
          stats = window.WatchHistoryParser.parse(reader.result);
          if (stats.totalVideos === 0) {
            loading.classList.add('hidden');
            showError('Nessuna visualizzazione trovata. Assicurati di aver scelto il file "cronologia visualizzazioni.html".');
            return;
          }
          renderResults();
        } catch (err) {
          loading.classList.add('hidden');
          showError('Errore durante l\'analisi: ' + err.message);
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

    statTotal.textContent    = nf.format(stats.totalVideos);
    statChannels.textContent = nf.format(stats.channels.length);
    statTop.textContent      = stats.channels.length ? stats.channels[0].name : '—';
    statTop.title            = statTop.textContent;

    renderTop10();
    searchInput.value = '';
    renderSearch('');
    searchInput.focus();
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
            '<span class="toplist__count">' + nf.format(ch.count) + '</span>' +
          '</div>' +
          '<div class="bar"><div class="bar__fill" style="width:' + (ch.count / max * 100) + '%"></div></div>' +
        '</div>';
      li.querySelector('.toplist__name').textContent = ch.name;
      topList.appendChild(li);
    });
  }

  // --- Ricerca ---

  searchInput.addEventListener('input', function () {
    renderSearch(searchInput.value);
  });

  function renderSearch(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
      searchResults.innerHTML =
        '<p class="search-hint">Scrivi il nome di uno youtuber per vedere quanti suoi video hai guardato.</p>';
      return;
    }

    const matches = stats.channels
      .filter(function (ch) { return ch.name.toLowerCase().includes(q); })
      .slice(0, 50);

    if (!matches.length) {
      searchResults.innerHTML = '<p class="search-hint">Nessuno youtuber trovato per "' +
        escapeHtml(query) + '".</p>';
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
          '<span class="result__count">' + nf.format(ch.count) + ' video</span>' +
          '<span class="result__extra">#' + rank + ' · ' + pct.toFixed(pct < 1 ? 2 : 1) + '%</span>' +
        '</span>';
      row.querySelector('.result__name').textContent = ch.name;
      searchResults.appendChild(row);
    });
  }

  // --- Reset ---

  resetBtn.addEventListener('click', function () {
    stats = null;
    fileInput.value = '';
    resultsScreen.classList.add('hidden');
    uploadScreen.classList.remove('hidden');
    hideError();
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
})();
