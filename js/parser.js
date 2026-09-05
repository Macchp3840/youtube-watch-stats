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
 * Il file viene letto cella per cella, così ogni video resta associato al proprio
 * canale. I video rimossi/privati non hanno i link e vengono contati solo nel totale.
 */

(function (global) {
  'use strict';

  // Elemento riutilizzato per decodificare le entità HTML (&amp;, &#39;, ecc.)
  const decoderEl = document.createElement('textarea');
  function decodeEntities(str) {
    decoderEl.innerHTML = str;
    return decoderEl.value;
  }

  // Un blocco = una singola visualizzazione. La cella "text-right" (vuota) non
  // corrisponde perché dopo body-1 ha altre classi prima delle virgolette.
  const CELL_RE    = /content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1">([\s\S]*?)<\/div>/g;
  const VIDEO_RE   = /<a href="(https?:\/\/(?:www|music)\.youtube\.com\/watch\?[^"]*?v=([\w-]+)[^"]*)">([\s\S]*?)<\/a>/;
  const CHANNEL_RE = /<a href="https?:\/\/(?:www|music)\.youtube\.com\/channel\/([^"]+)">([\s\S]*?)<\/a>/;

  /**
   * Analizza il testo HTML della cronologia e restituisce le statistiche aggregate.
   * @param {string} htmlText - contenuto completo del file HTML.
   * @returns {{
   *   totalVideos:number, withChannel:number, withoutChannel:number,
   *   channels:Array, videos:Array, videosOnce:number
   * }}
   *   channels: [{ id, name, url, count }] ordinato per count decrescente.
   *   videos:   [{ id, title, url, count, channelName, channelUrl }] con count >= 2,
   *             ordinato per count decrescente. I video visti una sola volta non
   *             entrano in classifica: sono contati in videosOnce.
   */
  function parseWatchHistory(htmlText) {
    // Aggregazione per canale (chiave = channelId, così nomi identici non si mescolano).
    const byChannel = new Map();
    // Aggregazione per video (chiave = id del video, il titolo può cambiare nel tempo).
    const byVideo = new Map();

    let totalVideos = 0;
    let withChannel = 0;
    let cell;

    CELL_RE.lastIndex = 0;
    while ((cell = CELL_RE.exec(htmlText)) !== null) {
      totalVideos++;

      const body = cell[1];
      const chMatch = CHANNEL_RE.exec(body);

      let channelEntry = null;
      if (chMatch) {
        withChannel++;
        const chId = chMatch[1];
        const chName = decodeEntities(chMatch[2]).trim() || '(senza nome)';
        channelEntry = byChannel.get(chId);
        if (!channelEntry) {
          channelEntry = {
            id: chId,
            name: chName,
            url: 'https://www.youtube.com/channel/' + chId,
            count: 0
          };
          byChannel.set(chId, channelEntry);
        }
        channelEntry.count++;
      }

      const vidMatch = VIDEO_RE.exec(body);
      if (vidMatch) {
        const vidId = vidMatch[2];
        let videoEntry = byVideo.get(vidId);
        if (!videoEntry) {
          videoEntry = {
            id: vidId,
            title: decodeEntities(vidMatch[3]).trim() || vidMatch[1],
            url: vidMatch[1],
            count: 0,
            channelName: channelEntry ? channelEntry.name : '',
            channelUrl: channelEntry ? channelEntry.url : ''
          };
          byVideo.set(vidId, videoEntry);
        } else if (!videoEntry.channelName && channelEntry) {
          // Alcune visualizzazioni dello stesso video possono non avere il canale.
          videoEntry.channelName = channelEntry.name;
          videoEntry.channelUrl = channelEntry.url;
        }
        videoEntry.count++;
      }
    }

    const channels = Array.from(byChannel.values()).sort((a, b) => b.count - a.count);

    // Solo i video rivisti almeno una volta finiscono in classifica: gli altri
    // sarebbero decine di migliaia di voci tutte a quota 1.
    const videos = [];
    let videosOnce = 0;
    byVideo.forEach(function (v) {
      if (v.count >= 2) videos.push(v);
      else videosOnce++;
    });
    videos.sort((a, b) => b.count - a.count);

    return {
      totalVideos: totalVideos,
      withChannel: withChannel,
      withoutChannel: totalVideos - withChannel,
      channels: channels,
      videos: videos,
      videosOnce: videosOnce
    };
  }

  global.WatchHistoryParser = { parse: parseWatchHistory };
})(window);
