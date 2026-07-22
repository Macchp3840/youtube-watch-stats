# 📊 YouTube Watch Stats

Analizza la tua **cronologia visualizzazioni di YouTube** (Google Takeout) e scopri quanti video hai guardato di ogni youtuber, con una barra di ricerca e la tua Top 10.

> Tutta l'elaborazione avviene **nel tuo browser**: nessun file viene caricato online, la tua cronologia non lascia mai il tuo dispositivo.

![Stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-informational)
![Backend](https://img.shields.io/badge/backend-nessuno-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🇮🇹 Italiano

### Funzionalità
- 🔎 **Ricerca youtuber** — digita un nome e vedi quanti suoi video hai guardato, la posizione in classifica e la percentuale sul totale.
- 🏆 **Top 10** dei canali più visti, con grafico a barre.
- 📈 **Statistiche generali** — video totali guardati e numero di youtuber diversi.
- 🔒 **Privacy totale** — tutto gira lato client, nessun dato inviato a un server.

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

Analyze your **YouTube watch history** (Google Takeout) and find out how many videos you watched from each YouTuber, with a search bar and your personal Top 10. Everything runs **in your browser** — no file is ever uploaded.

### Features
- 🔎 **Search a YouTuber** — type a name and see how many of their videos you watched, their rank and the share of your total.
- 🏆 **Top 10** most-watched channels, with bar chart.
- 📈 **Overview stats** — total videos watched and number of distinct YouTubers.
- 🔒 **Fully private** — runs entirely client-side, no data sent to any server.

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
    ├── parser.js     # estrazione dati dall'HTML Takeout / Takeout HTML parsing
    └── app.js        # logica UI / UI logic
```

## 📄 Licenza / License
[MIT](LICENSE)
