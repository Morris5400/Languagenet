# Languagenet (Static SPA for GitHub Pages)

Dies ist eine **statische**, framework‑freie Demo‑Oberfläche (HTML/CSS/JS), die auf GitHub Pages lauffähig ist.
Sie ersetzt **keine** serverseitigen Next.js‑Funktionen (Login, API‑Routen, DB).

## Dateien
- `index.html` – Einstieg & Hash‑Router‑Mount
- `style.css` – Styles (dunkles Theme)
- `app.js` – Router, Beispiel‑Curriculum, Vokabeltrainer (LocalStorage)
- `404.html` – Fallback‑Redirect für Direct‑Links (GitHub Pages)

## Nutzung
1. Diese vier Dateien ins Repository‑Root hochladen (z. B. `Languagenet`).
2. GitHub Pages auf den Branch `main` (Root) zeigen lassen.
3. Aufrufen: `https://<user>.github.io/<repo>/`

> Hinweis: Für die vollständige Next.js‑App verwende einen host mit Node.js (z. B. Vercel).
