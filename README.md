# 📊 YouTube Watch Stats

Analizza la tua **cronologia visualizzazioni di YouTube** (Google Takeout) e scopri quanti video hai guardato di ogni youtuber, quali video hai riguardato di più, con una barra di ricerca e due classifiche espandibili.

> Tutta l'elaborazione avviene **nel tuo browser**: nessun file viene caricato online, la tua cronologia non lascia mai il tuo dispositivo. Le uniche richieste esterne sono le miniature dei video, scaricate da YouTube: si possono disattivare con un interruttore.

![Stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-informational)
![Backend](https://img.shields.io/badge/backend-nessuno-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🇮🇹 Italiano

### Funzionalità
- 🔎 **Ricerca youtuber** — digita un nome e vedi quanti suoi video hai guardato, la posizione in classifica e la percentuale sul totale.
- 🏆 **Youtuber più visti** — Top 10 con grafico a barre, espandibile a blocchi di 20 fino a tutti i canali.
- 🎬 **Video più visti** — classifica dei video che hai riguardato più volte, con miniatura, canale, numero di visualizzazioni e barra proporzionale. Parte dai primi 10 e si espande a blocchi di 15. Restano fuori i video visti una sola volta: sono contati a parte in una nota.
- 🖼 **Miniature disattivabili** — un interruttore le spegne e la pagina torna a non fare nessuna richiesta di rete.
- 📈 **Statistiche generali** — video totali guardati e numero di youtuber diversi.
- 🌍 **Multilingua** — interfaccia con switch Italiano / Inglese.
- 🔒 **Privacy** — la cronologia viene elaborata solo lato client e non viene mai inviata a un server.

### Come si usa
1. Vai su [takeout.google.com](https://takeout.google.com), deseleziona tutto e spunta solo **YouTube e YouTube Music**.
2. In **«Più formati»** imposta la **Cronologia** sul formato **HTML**, poi avvia l'esportazione.
3. Scarica ed estrai l'archivio `.zip`.
4. Apri `index.html` di questo progetto nel browser e trascina dentro il file:
   ```
   Takeout/YouTube e YouTube Music/cronologia/cronologia visualizzazioni.html
   ```
   (in inglese: `watch-history.html`)

### Avvio in locale
Basta aprire `index.html` con un doppio clic. In alternativa, con un server locale:
```bash
python -m http.server 8000
```
Poi apri <http://localhost:8000>.

---

## 🇬🇧 English

Analyze your **YouTube watch history** (Google Takeout) and find out how many videos you watched from each YouTuber and which videos you rewatched the most, with a search bar and two expandable rankings. Everything runs **in your browser** — no file is ever uploaded. The only outbound requests are the video thumbnails fetched from YouTube, and a switch turns them off.

### Features
- 🔎 **Search a YouTuber** — type a name and see how many of their videos you watched, their rank and the share of your total.
- 🏆 **Most-watched YouTubers** — Top 10 with bar chart, expandable 20 at a time up to every channel.
- 🎬 **Most-watched videos** — ranking of the videos you rewatched the most, with thumbnail, channel, view count and proportional bar. Starts at 10 and expands 15 at a time. Videos watched only once stay out of the ranking and are counted in a note below it.
- 🖼 **Thumbnails can be turned off** — with the switch off the page makes no network request at all.
- 📈 **Overview stats** — total videos watched and number of distinct YouTubers.
- 🌍 **Multilingual** — interface with Italian / English switch.
- 🔒 **Private** — the history is processed entirely client-side and never sent to a server.

### How to use
1. Go to [takeout.google.com](https://takeout.google.com), deselect everything and check only **YouTube and YouTube Music**.
2. Under **"Multiple formats"** set **History** to **HTML**, then start the export.
3. Download and extract the `.zip` archive.
4. Open this project's `index.html` in your browser and drop in the file:
   ```
   Takeout/YouTube and YouTube Music/history/watch-history.html
   ```

### Run locally
Just double-click `index.html`, or serve it locally:
```bash
python -m http.server 8000
```
Then open <http://localhost:8000>.

---

## 🗂 Struttura / Structure
```
youtube-watch-stats/
├── index.html        # interfaccia / UI
├── css/style.css     # stile / styling
└── js/
    ├── i18n.js       # traduzioni IT/EN / IT-EN translations
    ├── parser.js     # estrazione dati dall'HTML Takeout / Takeout HTML parsing
    └── app.js        # logica UI: classifiche, ricerca / UI logic: rankings, search
```

## 📄 Licenza / License
[MIT](LICENSE)
