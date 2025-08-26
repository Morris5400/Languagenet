// Languagenet – Static SPA for GitHub Pages
// Hash-router + LocalStorage state. No server, no external deps.
(function(){
  const el = (sel, parent=document)=>parent.querySelector(sel);
  const els = (sel, parent=document)=>[...parent.querySelectorAll(sel)];
  const app = el('#app');
  const TOPBAR = el('#topbar');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
  }

  const STATE_KEY = 'languagenet-state-v1';

  const initialState = {
    ui: { route: 'home', level: 'A1', lang: 'de' },
    progress: { completed: {} },
    vocab: { items: [
      {hu:'Szia!', de:'Hallo!', en:'Hi!'},
      {hu:'Köszönöm.', de:'Danke.', en:'Thank you.'},
      {hu:'Hogy vagy?', de:'Wie geht’s?', en:'How are you?'},
      {hu:'Jó napot!', de:'Guten Tag!', en:'Good afternoon!'},
    ]}
  };

  const load = () => {
    try { return JSON.parse(localStorage.getItem(STATE_KEY)) || structuredClone(initialState); }
    catch { return structuredClone(initialState); }
  };
  const save = (s) => localStorage.setItem(STATE_KEY, JSON.stringify(s));

  let S = load();

  const CURR = {
    A1: {
      units: [
        { id: 'A1-U1', title: 'Alapok / Grundlagen', lessons: [
          { id: 'A1-U1-L1', title: 'Létige (sein) – Präsens', goals: ['vagyok, vagy, van', 'Kurzantworten', 'Ortsangaben'] },
          { id: 'A1-U1-L2', title: 'Alap köszönések / Begrüßungen', goals: ['Szia, Jó napot', 'Hogy vagy? – válaszok'] },
        ]},
        { id: 'A1-U2', title: 'Család & Mindennap', lessons: [
          { id: 'A1-U2-L1', title: 'Család – szókincs', goals: ['anya, apa, testvér', 'birtokos'] },
          { id: 'A1-U2-L2', title: 'Számok 1–20', goals: ['egy–húsz', 'kérdések és válaszok'] },
        ]},
      ]
    },
    A2: {
      units: [
        { id: 'A2-U1', title: 'Igeragozás bővebben', lessons: [
          { id: 'A2-U1-L1', title: 'Múlt idő (perfekt)', goals: ['voltam, voltál…', 'időhatározók'] },
        ]}
      ]
    }
  };

  // Utilities
  const routeTo = (hash) => { location.hash = hash; };
  const setActiveTab = () => {
    els('.tab-button').forEach(link => {
      const isActive = link.getAttribute('href') === location.hash;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const tpl = {
    hero: () => `
      <section class="card">
        <h1>Languagenet (Static)</h1>
        <p>Leichtgewichtiges, statisches Demo der Lernoberfläche. Keine Anmeldung, kein Server – alles im Browser.</p>
        <div class="row">
          <button class="primary" data-go="#/lessons">Loslegen</button>
          <button class="ghost" data-go="#/vocab">Vokabeltrainer öffnen</button>
        </div>
        <div class="chips" style="margin-top:.75rem">
          <span class="badge">Ungarisch 🇭🇺</span>
          <span class="badge">Deutsch 🇩🇪</span>
          <span class="badge">A1–A2 Demo</span>
          <span class="badge">Offline‑fähig (LocalStorage)</span>
        </div>
      </section>
      <section class="grid cols-3" style="margin-top:1rem">
        <div class="card"><h3>Interaktives Lernen</h3><p>Einheiten & Lektionen mit Zielen und Fortschrittshäkchen.</p></div>
        <div class="card"><h3>Vokabel‑Quiz</h3><p>Flashcards, Multiple Choice & Eingabe, alles lokal.</p></div>
        <div class="card"><h3>Konfigurierbar</h3><p>Niveau wählen, Sprache umstellen, Daten speichern.</p></div>
      </section>
      <footer>Demo‑Build für GitHub Pages • Keine Serverfunktionen</footer>
    `,
    lessonsHeader: () => `
      <section class="card">
        <div class="row">
          <h1 style="margin-right:auto">Lektionen</h1>
          <label class="row">Niveau:
            <select id="sel-level">
              ${Object.keys(CURR).map(l=>`<option value="${l}" ${l===S.ui.level?'selected':''}>${l}</option>`).join('')}
            </select>
          </label>
        </div>
        <p>Wähle Einheit → Lektion. Fortschritt wird im Browser gespeichert.</p>
      </section>
    `,
    unitCard: (u) => `
      <div class="card">
        <h2>${u.title}</h2>
        <table class="table">
          <thead><tr><th>Lektion</th><th>Ziele</th><th>Aktion</th></tr></thead>
          <tbody>
            ${u.lessons.map(L => `
              <tr>
                <td><strong>${L.id}</strong><br>${L.title}</td>
                <td>${L.goals.map(g=>`<span class="badge" style="margin-right:.25rem">${g}</span>`).join(' ')}</td>
                <td class="row">
                  <button class="primary" data-go="#/unit/${L.id}">Öffnen</button>
                  <label class="row" style="gap:.35rem">
                    <input type="checkbox" data-done="${L.id}" ${S.progress.completed[L.id]?'checked':''}/>
                    <span>Erledigt</span>
                  </label>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `,
    unitPage: (L) => `
      <section class="card">
        <div class="row">
          <h1 style="margin-right:auto">${L.title} <span class="badge">${L.id}</span></h1>
          <button class="ghost" data-go="#/lessons">← Zurück</button>
        </div>
        <p>Kurze Einführung mit Beispielen:</p>
        <div class="grid cols-2">
          <div class="card">
            <h3>Beispiele (HU → DE)</h3>
            <table class="table">
              <thead><tr><th>HU</th><th>DE</th></tr></thead>
              <tbody id="tbl-ex"></tbody>
            </table>
          </div>
          <div class="card">
            <h3>Mini‑Übung</h3>
            <p>Schreibe die deutsche Bedeutung:</p>
            <div class="row">
              <span id="quiz-q" class="badge"></span>
              <input id="quiz-a" type="text" placeholder="Übersetzung" />
              <button class="primary" id="quiz-check">Prüfen</button>
            </div>
            <p id="quiz-msg"></p>
          </div>
        </div>
      </section>
    `,
    vocab: () => `
      <section class="card">
        <h1>Vokabeltrainer</h1>
        <p>Einfacher Trainer mit LocalStorage. Eingabe: HU → DE.</p>
        <div class="row">
          <input id="new-hu" type="text" placeholder="Ungarisch (hu)">
          <input id="new-de" type="text" placeholder="Deutsch (de)">
          <button class="ghost" id="btn-add-v">Hinzufügen</button>
        </div>
        <hr>
        <div class="grid cols-2">
          <div class="card">
            <h3>Liste</h3>
            <table class="table"><thead><tr><th>HU</th><th>DE</th><th></th></tr></thead><tbody id="vlist"></tbody></table>
          </div>
          <div class="card">
            <h3>Quiz</h3>
            <div class="row">
              <span id="v-q" class="badge"></span>
              <input id="v-a" type="text" placeholder="DE Antwort">
              <button class="primary" id="v-check">Prüfen</button>
            </div>
            <p id="v-msg"></p>
          </div>
        </div>
      </section>
    `,
    grammar: () => `
      <section class="card">
        <h1>Grammatik‑Hub (A1/A2 Demo)</h1>
        <div class="grid cols-2">
          <div class="card">
            <h3>Létige – sein (Präsens)</h3>
            <div class="kv">
              <strong>én</strong><span>vagyok – ich bin</span>
              <strong>te</strong><span>vagy – du bist</span>
              <strong>ő</strong><span>van – er/sie/es ist</span>
              <strong>mi</strong><span>vagyunk – wir sind</span>
              <strong>ti</strong><span>vagytok – ihr seid</span>
              <strong>ők</strong><span>vannak – sie sind</span>
            </div>
          </div>
          <div class="card">
            <h3>Köszönések – Begrüßungen</h3>
            <p>Szia! Jó napot! Jó estét! Viszlát!</p>
          </div>
        </div>
      </section>
    `,
    settings: () => `
      <section class="card">
        <h1>Einstellungen</h1>
        <div class="grid cols-2">
          <div class="card">
            <h3>Allgemein</h3>
            <div class="kv">
              <strong>Niveau</strong>
              <span>
                <select id="set-level">${Object.keys(CURR).map(l=>`<option value="${l}" ${l===S.ui.level?'selected':''}>${l}</option>`).join('')}</select>
              </span>
              <strong>Interface‑Sprache</strong>
              <span>
                <select id="set-lang">
                  <option value="de" ${S.ui.lang==='de'?'selected':''}>Deutsch</option>
                  <option value="en" ${S.ui.lang==='en'?'selected':''}>English</option>
                </select>
              </span>
              <strong>Daten</strong>
              <span><button class="ghost" id="btn-reset">Zurücksetzen</button></span>
            </div>
          </div>
          <div class="card">
            <h3>Info</h3>
            <p>Diese Static‑SPA ist für GitHub Pages gebaut. Keine Server‑APIs, kein Login.</p>
          </div>
        </div>
      </section>
    `
  };

  // Router
  function render(){
    const h = location.hash || '#/home';
    setActiveTab();
    if(h.startsWith('#/home')) return app.innerHTML = tpl.hero();
    if(h.startsWith('#/lessons')){
      const level = S.ui.level;
      const units = CURR[level].units;
      app.innerHTML = tpl.lessonsHeader() + units.map(tpl.unitCard).join('');
      // bind controls
      const sel = el('#sel-level'); sel.addEventListener('change', e=>{ S.ui.level = e.target.value; save(S); render(); });
      els('[data-done]').forEach(cb => cb.addEventListener('change', e=>{
        const id = e.target.getAttribute('data-done');
        S.progress.completed[id] = e.target.checked; save(S);
      }));
      els('[data-go]').forEach(b => b.addEventListener('click', ()=> routeTo(b.dataset.go)));
      return;
    }
    if(h.startsWith('#/unit/')){
      const id = h.split('/')[2];
      const L = Object.values(CURR).flatMap(l=>l.units).flatMap(u=>u.lessons).find(x=>x.id===id);
      if(!L){ app.innerHTML = `<section class="card"><h1>Nicht gefunden</h1><p>Die Lektion existiert nicht.</p><button class="ghost" onclick="location.hash='#/lessons'">← Zurück</button></section>`; return; }
      app.innerHTML = tpl.unitPage(L);
      // examples per lesson (tiny demo data)
      const examples = [
        {hu:'Hol vagy?', de:'Wo bist du?'},
        {hu:'A szobában vagyok.', de:'Ich bin im Zimmer.'},
        {hu:'Szia!', de:'Hallo!'},
      ];
      const tbody = el('#tbl-ex');
      tbody.innerHTML = examples.map(x=>`<tr><td>${x.hu}</td><td>${x.de}</td></tr>`).join('');
      // mini quiz
      const q = examples[Math.floor(Math.random()*examples.length)];
      el('#quiz-q').textContent = q.hu;
      el('#quiz-check').addEventListener('click', ()=>{
        const a = el('#quiz-a').value.trim().toLowerCase();
        el('#quiz-msg').textContent = (a === q.de.toLowerCase()) ? '✅ Korrekt!' : `❌ Erwartet: “${q.de}”.`;
      });
      return;
    }
    if(h.startsWith('#/vocab')){
      app.innerHTML = tpl.vocab();
      const refresh = ()=>{
        const v = S.vocab.items;
        el('#vlist').innerHTML = v.map((x,i)=>`<tr><td>${x.hu}</td><td>${x.de}</td><td><button class="ghost" data-del="${i}">Löschen</button></td></tr>`).join('');
      };
      refresh();
      el('#btn-add-v').addEventListener('click', ()=>{
        const hu = el('#new-hu').value.trim(); const de = el('#new-de').value.trim();
        if(!hu || !de) return;
        S.vocab.items.push({hu,de}); save(S); el('#new-hu').value=''; el('#new-de').value=''; refresh();
      });
      app.addEventListener('click', (e)=>{
        const i = e.target.getAttribute?.('data-del'); if(i!=null){ S.vocab.items.splice(+i,1); save(S); refresh(); }
      });
      // quiz
      const ask = ()=>{
        const v = S.vocab.items; if(!v.length){ el('#v-q').textContent='—'; return null; }
        const i = Math.floor(Math.random()*v.length); const q=v[i]; el('#v-q').textContent = q.hu; return q;
      };
      let cur = ask();
      el('#v-check').addEventListener('click', ()=>{
        if(!cur) return;
        const a = el('#v-a').value.trim().toLowerCase();
        el('#v-msg').textContent = (a === cur.de.toLowerCase()) ? '✅ Richtig!' : `❌ Erwartet: “${cur.de}”.`;
        cur = ask(); el('#v-a').value='';
      });
      return;
    }
    if(h.startsWith('#/grammar')){ app.innerHTML = tpl.grammar(); return; }
    if(h.startsWith('#/settings')){
      app.innerHTML = tpl.settings();
      el('#set-level').addEventListener('change', e=>{ S.ui.level = e.target.value; save(S); });
      el('#set-lang').addEventListener('change', e=>{ S.ui.lang = e.target.value; save(S); });
      el('#btn-reset').addEventListener('click', ()=>{ localStorage.removeItem(STATE_KEY); S = load(); render(); });
      return;
    }
    // fallback
    routeTo('#/home');
  }

  // events
  window.addEventListener('hashchange', render);
  TOPBAR.addEventListener('click', (e)=>{
    const link = e.target.closest('a'); if(!link) return;
    e.preventDefault();
    routeTo(link.getAttribute('href'));
  });

  // initial
  if(!location.hash) location.hash = '#/home';
  render();
})();
