# 📊 YouTube Watch Stats

Analizza la tua **cronologia visualizzazioni di YouTube** (Google Takeout) e scopri
quanti video hai guardato di ogni youtuber — con una **barra di ricerca** e la tua **Top 10**.

Tutta l'elaborazione avviene **nel tuo browser**: nessun file viene caricato su un server,
la tua cronologia non lascia mai il tuo dispositivo.

![Fatto in HTML/CSS/JS puro](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-informational)
![Nessun backend](https://img.shields.io/badge/backend-nessuno-success)

## ✨ Funzionalità

- 🔎 **Ricerca youtuber** — digita un nome e vedi quanti suoi video hai guardato, la sua posizione in classifica e la percentuale sul totale.
- 🏆 **Top 10** dei canali più visti, con grafico a barre.
- 📈 **Statistiche generali**: video totali guardati e numero di youtuber diversi.
- 🔒 **100% privacy**: tutto gira lato client, nessun dato inviato online.

## 🚀 Come si usa

1. Vai su [takeout.google.com](https://takeout.google.com) e richiedi l'esportazione di **YouTube e YouTube Music** (formato cronologia: **HTML**).
2. Scarica ed estrai l'archivio.
3. Trova il file:
   ```
   Takeout/YouTube e YouTube Music/cronologia/cronologia visualizzazioni.html
   ```
   (in inglese: `watch-history.html`)
4. Apri `index.html` di questo progetto nel browser e trascina dentro il file.

## 💻 Avvio in locale

Basta aprire `index.html` con un doppio clic. In alternativa, per servirlo con un server locale:

```bash
python -m http.server 8000
```

Poi apri <http://localhost:8000>.

## 🌐 Pubblicazione su GitHub Pages

1. Carica il progetto in un repository GitHub.
2. **Settings → Pages → Branch: `main` / root**.
3. L'app sarà online all'indirizzo `https://<tuo-utente>.github.io/<repo>/`.

Puoi condividere il link: chiunque userà il proprio file Takeout, che resterà comunque sul suo dispositivo.

## 🗂 Struttura

```
youtube-watch-stats/
├── index.html        # interfaccia
├── css/style.css     # stile (tema scuro)
└── js/
    ├── parser.js     # estrazione dati dall'HTML Takeout
    └── app.js        # logica UI (ricerca, top 10, caricamento)
```

## ⚙️ Come funziona il parsing

Nel file Takeout ogni visualizzazione è un blocco `content-cell` che contiene il link al video,
il link al canale (`/channel/...`) con il nome, e la data. Il parser conta le occorrenze per
ID canale e aggrega i risultati. I video rimossi/privati (senza link al canale) vengono contati
solo nel totale.

## 📄 Licenza

[MIT](LICENSE)
