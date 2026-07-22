/*
 * parser.js
 * Estrae le statistiche dalla "cronologia visualizzazioni" di Google Takeout (formato HTML).
 *
 * Struttura di ogni voce nel file Takeout:
 *   <div class="content-cell ... mdl-typography--body-1">
 *     Hai guardato <a href=".../watch?v=ID">Titolo video</a><br>
 *     <a href=".../channel/CHANNEL_ID">Nome canale</a><br>
 *     22 lug 2026, 05:17:27 CEST<br>
 *   </div>
 *
 * Il link al canale contiene sempre "/channel/". I video rimossi/privati non hanno
 * il link al canale e vengono contati solo nel totale.
 */

(function (global) {
  'use strict';

  // Elemento riutilizzato per decodificare le entità HTML (&amp;, &#39;, ecc.)
  const decoderEl = document.createElement('textarea');
  function decodeEntities(str) {
    decoderEl.innerHTML = str;
    return decoderEl.value;
  }

  /**
   * Analizza il testo HTML della cronologia e restituisce le statistiche aggregate.
   * @param {string} htmlText - contenuto completo del file HTML.
   * @returns {{ totalVideos:number, withChannel:number, withoutChannel:number, channels:Array }}
   *          channels: [{ id, name, url, count }] ordinato per count decrescente.
   */
  function parseWatchHistory(htmlText) {
    // Un anchor verso un canale: <a href="https://www.youtube.com/channel/ID">Nome</a>
    const channelRegex = /<a href="https?:\/\/www\.youtube\.com\/channel\/([^"]+)">([\s\S]*?)<\/a>/g;
    // I "content-cell body-1" sono i blocchi di una singola visualizzazione.
    const cellRegex = /content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1">/g;

    // Totale video guardati = numero di celle di contenuto.
    let totalVideos = 0;
    cellRegex.lastIndex = 0;
    while (cellRegex.exec(htmlText) !== null) totalVideos++;

    // Aggregazione per canale (chiave = channelId, così nomi identici non si mescolano).
    const byId = new Map();
    let withChannel = 0;
    let match;
    channelRegex.lastIndex = 0;
    while ((match = channelRegex.exec(htmlText)) !== null) {
      const id = match[1];
      const name = decodeEntities(match[2]).trim() || '(senza nome)';
      withChannel++;
      let entry = byId.get(id);
      if (!entry) {
        entry = {
          id: id,
          name: name,
          url: 'https://www.youtube.com/channel/' + id,
          count: 0
        };
        byId.set(id, entry);
      }
      entry.count++;
    }

    const channels = Array.from(byId.values()).sort((a, b) => b.count - a.count);

    return {
      totalVideos: totalVideos,
      withChannel: withChannel,
      withoutChannel: totalVideos - withChannel,
      channels: channels
    };
  }

  global.WatchHistoryParser = { parse: parseWatchHistory };
})(window);
