# SwasthyaNet — Smart Health: AI-Driven Health Centre & Supply Chain Management

Prototype built for **Code for Communities** — a multilingual (English/Hindi) platform
for real-time PHC/CHC management across a district, covering stock monitoring, patient
footfall, bed availability, doctor attendance, test availability audits, AI demand
forecasting, smart resource redistribution, and automatic flagging of under-resourced
centres to district administrators.

**No backend/build step required.** It's a static site (HTML/CSS/vanilla JS) using the
browser's `localStorage` as a lightweight data layer, so it runs anywhere — including
GitHub Pages — with zero configuration. Swap `js/data.js` for real API calls when you're
ready to connect an actual EHR/HMIS backend.

## Features

- **District Overview** — live stat cards, a "Facility Pulse" strip (ECG-style status
  per centre), and a block-wise standing table.
- **Centre Register** — per-PHC/CHC screen for bed occupancy, 14-day footfall entry
  (charted), medicine stock updates, doctor attendance, and diagnostic test availability.
- **AI Forecast** — trend-adjusted 7-day medicine demand forecast per centre, sorted by
  urgency, with early stock-out warnings.
- **Redistribution** — matches centres with medicine surplus against centres about to
  run out and suggests transfer quantities.
- **Flagged Centres** — composite health-ops score (stock-outs, bed strain, doctor
  attendance, test gaps) automatically flags under-performing centres with reasons, and
  a one-click "notify district admin" action.
- **English ⇄ Hindi** toggle across the entire UI (top-right button).

## Run locally

Any static file server works. From this folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

or simply open `index.html` directly in a browser (some browsers restrict local
`fetch`/module loading from `file://`, so the local server method above is more
reliable).

## Deploy for free (GitHub Pages)

1. Push this folder to a GitHub repo (see steps below).
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", set **Source: Deploy from a branch**, branch `main`,
   folder `/ (root)`. Save.
4. Your site will be live at `https://<username>.github.io/<repo-name>/` within a
   minute or two.

## Project structure

```
smart-health/
├── index.html          # shell: header, nav, canvas mount point
├── css/styles.css       # design system (paper/ledger + ward-monitor pulse strip)
├── js/i18n.js            # English/Hindi dictionary + t() helper
├── js/data.js            # seed data for 6 PHC/CHC centres + localStorage persistence
├── js/forecast.js        # forecasting, redistribution, and scoring logic
└── js/app.js             # routing + rendering for all 5 views
```

## Next steps for a production build

- Replace `js/data.js` with real API calls to your HMIS/district database.
- Add authentication and per-centre login (currently a single shared demo dataset).
- Replace the heuristic forecast in `forecast.js` with a trained time-series model
  (e.g. served from a small Python/Flask or FastAPI backend).
- Add SMS/WhatsApp alerts for the "notify district admin" action.
- Add more Indian languages by extending `js/i18n.js`.
