# Languagenet (Static SPA for GitHub Pages)

Dies ist eine **statische**, framework‑freie Demo‑Oberfläche (HTML/CSS/JS), die auf GitHub Pages lauffähig ist.
Sie ersetzt **keine** serverseitigen Next.js‑Funktionen (Login, API‑Routen, DB).

## Dateien
- `index.html` – Einstieg & Hash‑Router‑Mount
- `style.css` – Styles (dunkles Theme)
- `app.js` – Router, Beispiel‑Curriculum, Vokabeltrainer (LocalStorage)
- `404.html` – Fallback‑Redirect für Direct‑Links (GitHub Pages)
- `manifest.json`, `sw.js` – Grundgerüst für PWA/Offline-Unterstützung (Icons eingebettet)

## Entwicklung & Build

1. Abhängigkeiten installieren: `npm install`
2. Minifizierte Assets erzeugen: `npm run build` → erzeugt `app.min.js` und `style.min.css`
3. Die Dateien `index.html`, `app.min.js`, `style.min.css`, `manifest.json` und `sw.js` deployen

## Nutzung
1. Die gebauten Dateien (`index.html`, `app.min.js`, `style.min.css`, `manifest.json`, `sw.js`, `404.html`) ins Repository‑Root hochladen.
2. GitHub Pages auf den Branch `main` (Root) zeigen lassen.
3. Aufrufen: `https://<user>.github.io/<repo>/`

> Hinweis: Für die vollständige Next.js‑App verwende einen host mit Node.js (z. B. Vercel).
