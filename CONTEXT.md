# YouTube Watch Stats — contesto di progetto

## 1. Contesto per una nuova chat

Sei l'assistente su **YouTube Watch Stats**, una pagina web statica che analizza la
cronologia visualizzazioni di YouTube esportata da Google Takeout e mostra chi e cosa
l'utente guarda davvero.

- **Obiettivo**: dato il file `cronologia visualizzazioni.html` (o `watch-history.html`)
  del Takeout, mostrare quanti video sono stati guardati per ogni youtuber e quali video
  sono stati riguardati più volte, senza che il file lasci il dispositivo.
- **Destinatari**: chiunque abbia un Takeout di YouTube; nessuna competenza tecnica
  richiesta, si apre `index.html` e si trascina dentro il file.
- **Stack**: HTML + CSS + JavaScript puro (ES5/ES6, nessun framework, nessuna build,
  nessuna dipendenza). Nessun backend.
- **Avvio**: doppio clic su `index.html`, oppure `python -m http.server 8000` nella
  cartella del progetto e poi <http://localhost:8000>.
- **Test**: non esiste una suite automatica. Si verifica caricando un vero file Takeout
  (in locale ne esiste uno in `../Takeout/YouTube e YouTube Music/cronologia/`,
  ~54 MB, **fuori dalla repo**) e controllando conteggi e classifiche.
- **Struttura**:
  ```
  youtube-watch-stats/
  ├── index.html        # markup completo delle due schermate (upload / risultati)
  ├── css/style.css     # tema scuro, tutto in un file
  └── js/
      ├── i18n.js       # dizionario IT/EN + applicazione traduzioni al DOM
      ├── parser.js     # lettura dell'HTML Takeout, aggregazione canali e video
      └── app.js        # logica UI: caricamento file, classifiche, ricerca
  ```
- **Decisioni tecniche già prese**:
  - *Nessun framework e nessuna build*: il progetto deve restare un file HTML che si apre
    con un doppio clic, senza npm.
  - *Parsing a regex, non con DOMParser*: il file Takeout arriva a decine di MB e
    costruire il DOM completo sarebbe molto più lento. Il parsing di 54 MB richiede ~100 ms.
  - *Aggregazione per ID, non per nome*: i canali sono aggregati per `channelId` e i video
    per l'ID del video, così omonimi e titoli cambiati nel tempo non si mescolano.
  - *I video visti una sola volta restano fuori dalla classifica*: su una cronologia reale
    sono decine di migliaia (31.721 su 37.202 nel campione) e sarebbero una coda inutile.
    Vengono contati e mostrati come nota sotto la lista.
  - *Le miniature non usano `loading="lazy"`*: la lista cresce di 15 voci per volta, quindi
    le richieste restano poche, e il lazy loading non parte quando la pagina viene
    renderizzata fuori schermo (anteprime, tab in background).
  - *Un solo claim di privacy onesto*: la cronologia non lascia il dispositivo, ma le
    miniature sono richieste a `i.ytimg.com`. Per questo esistono l'interruttore
    «Miniature» e la nota nel footer.
- **Stato attuale**: funzionante e completo per l'uso previsto. Pubblicato su GitHub
  (`Macchp3840/youtube-watch-stats`), licenza MIT.
- **Prossimi passi possibili** (nessuno in corso): grafico dell'andamento nel tempo
  (le date sono già nel file ma non vengono lette), export CSV delle classifiche,
  gestione del formato JSON del Takeout oltre all'HTML.

## 2. Funzionamento completo

### Architettura e flusso dei dati

1. L'utente trascina il file HTML nella dropzone di `index.html`.
2. `app.js` legge il file con `FileReader.readAsText` (UTF-8) e lo passa a
   `WatchHistoryParser.parse` dopo un `setTimeout` di 30 ms, per lasciare all'UI il tempo
   di mostrare lo spinner prima del parsing, che blocca il thread.
3. `parser.js` restituisce un oggetto di statistiche; `app.js` lo tiene in memoria
   (variabile `stats`) e disegna statistiche, classifiche e ricerca.
4. Niente viene salvato su disco né inviato in rete: ricaricando la pagina si riparte
   dalla schermata di upload. In `localStorage` restano solo due preferenze:
   `wss_lang` (lingua) e `wss_thumbs` (miniature on/off).

### File principali

- **`index.html`** — due sezioni: `#uploadScreen` (titolo, dropzone, guida al Takeout in
  4 passi) e `#resultsScreen` (4 riquadri statistici, card ricerca, card youtuber, card
  video). Ogni testo statico è marcato con `data-i18n*` per la traduzione.
- **`css/style.css`** — tema scuro ispirato a YouTube, variabili CSS in `:root`. Blocchi
  principali: topbar, upload/guida, stats, card, ricerca, `.toplist` (youtuber),
  `.videolist` (video), `.listmore` (pulsanti espandi/riduci), `.toggle` (miniature).
  Breakpoint unico a 720 px.
- **`js/parser.js`** — espone `WatchHistoryParser.parse(htmlText)`. Scorre il file cella
  per cella con `CELL_RE` (una cella = una visualizzazione) e, dentro ogni cella, cerca il
  link al video (`VIDEO_RE`) e quello al canale (`CHANNEL_RE`), così ogni video resta
  legato al proprio canale. Restituisce:
  `{ totalVideos, withChannel, withoutChannel, channels[], videos[], videosOnce }`, dove
  `channels` è ordinato per conteggio decrescente e `videos` contiene i soli video con
  `count >= 2`, anch'essi ordinati. Le entità HTML dei titoli vengono decodificate con un
  `<textarea>` di appoggio. I video rimossi o privati non hanno i link: entrano solo nel
  totale.
- **`js/app.js`** — gestisce upload (input + drag&drop), rendering e stato. `INITIAL = 10`
  voci visibili all'avvio, `STEP_CHANNELS = 20` e `STEP_VIDEOS = 15` per ogni «Mostra
  altri»; `renderMoreControls` disegna i pulsanti «Mostra altri N» / «Riduci» e la scritta
  «Sono tutti.» quando la lista è finita. `buildVideoItem` costruisce la riga video
  (posizione, miniatura, titolo, conteggio, canale, barra). Le stringhe dell'utente
  (titoli, nomi canale) vengono sempre inserite con `textContent`, mai in `innerHTML`.
- **`js/i18n.js`** — dizionario `it`/`en`, `t(key, vars)` per le stringhe dinamiche,
  `apply()` per gli attributi `data-i18n`, `data-i18n-html`, `data-i18n-ph`,
  `data-i18n-title`. La lingua viene da `localStorage`, altrimenti dal browser, altrimenti
  italiano. `onChange` permette ad `app.js` di ridisegnare i contenuti già a schermo.

### Funzionalità, una per una

- **Caricamento**: input file + drag&drop, con validazione dell'estensione `.html`/`.htm`
  e messaggi d'errore tradotti (file non HTML, lettura fallita, nessuna visualizzazione).
- **Statistiche**: video guardati in totale, youtuber diversi, youtuber #1, pulsante per
  ricominciare con un altro file.
- **Ricerca youtuber**: filtro per sottostringa case-insensitive, massimo 50 risultati,
  ognuno con conteggio, posizione in classifica e percentuale sul totale.
- **Classifica youtuber**: prime 10 voci, poi «Mostra altri 20» fino a esaurimento e
  «Riduci» per tornare a 10. Le prime tre posizioni hanno il badge colorato.
- **Classifica video**: stessa meccanica con blocchi da 15. Ogni riga mostra miniatura
  (`https://i.ytimg.com/vi/<ID>/mqdefault.jpg`), titolo e canale cliccabili, numero di
  visualizzazioni e barra proporzionale al video più visto. Sotto la lista, la nota sui
  video guardati una volta sola.
- **Interruttore miniature**: se spento, le `<img>` non vengono nemmeno create, quindi la
  pagina non fa alcuna richiesta di rete. La scelta è ricordata in `localStorage`.
- **Multilingua**: switch IT/EN nella topbar, ridisegna anche i contenuti dinamici.

### Dipendenze esterne, configurazione

Nessuna libreria, nessuna variabile d'ambiente, nessun servizio. L'unica risorsa esterna
sono le miniature su `i.ytimg.com`, richieste con `referrerpolicy="no-referrer"` e
disattivabili.

### Limiti noti

- Il parsing dipende dai nomi delle classi CSS di Google Takeout: se Google cambia il
  formato dell'export, le regex in `parser.js` vanno aggiornate.
- Supportato solo il Takeout in formato **HTML**, non quello JSON.
- Quando YouTube non ha la miniatura di un video restituisce un segnaposto grigio 120x90
  invece di un 404: viene riconosciuto dalle dimensioni e sostituito con un riquadro vuoto.
- Espandere la classifica video di molte pagine ridisegna tutta la lista a ogni clic:
  con migliaia di voci a schermo il clic diventa percettibilmente lento.
- Il totale «video guardati» conta anche i video rimossi o privati, che però non
  compaiono in nessuna classifica perché privi di link.

## 3. Aggiornamenti

## [1.1.0] — 2026-09-05
- Cosa è cambiato:
  - Nuova sezione **«I tuoi video più visti»**: classifica dei video riguardati più volte,
    con posizione, miniatura, titolo, canale, numero di visualizzazioni e barra
    proporzionale. Parte da 10 voci e si espande a blocchi di 15, con pulsante «Riduci».
  - I video visti una sola volta restano fuori dalla classifica e vengono riassunti in una
    nota sotto la lista.
  - Anche la classifica degli youtuber è ora espandibile, a blocchi di 20.
  - Aggiunto l'interruttore **«Miniature»**: spegnendolo la pagina non fa alcuna richiesta
    di rete. La scelta è ricordata in `localStorage` (`wss_thumbs`).
  - `parser.js` riscritto: legge il file cella per cella invece di usare due regex globali
    separate, così ogni video resta associato al proprio canale; riconosce anche i link
    `music.youtube.com`. I conteggi di canali e visualizzazioni restano identici a prima
    (verificato sul Takeout reale: 50.961 visualizzazioni, 7.905 canali).
  - Testi rinominati: «La tua Top 10» → «I tuoi youtuber più visti»; footer riscritto per
    dire la verità sulle miniature.
- Perché: sapere *quali video* si riguarda di più era l'informazione mancante — l'app
  rispondeva solo «chi guardi», non «cosa riguardi». Le liste fisse a 10 tagliavano fuori
  tutto il resto.
- File toccati: `index.html`, `css/style.css`, `js/parser.js`, `js/app.js`, `js/i18n.js`,
  `README.md`, `CONTEXT.md` e `CLAUDE.md` (nuovi).
- Impatto su chi usa l'app: nessuna azione richiesta, si ricarica la pagina. Da questa
  versione la pagina scarica le miniature dai server di YouTube: chi non le vuole le
  spegne con l'interruttore accanto al titolo della sezione.

## [1.0.0] — 2026-07-22
- Cosa è cambiato: prima versione pubblica. Parsing del Takeout, statistiche generali,
  ricerca youtuber, Top 10 dei canali, guida al Takeout sempre visibile, switch di lingua
  Italiano/Inglese, README bilingue, licenza MIT.
- Perché: capire quanti video si sono guardati di ogni youtuber senza caricare la propria
  cronologia su un servizio online.
- File toccati: tutti (creazione del progetto).
- Impatto su chi usa l'app: prima versione utilizzabile.
