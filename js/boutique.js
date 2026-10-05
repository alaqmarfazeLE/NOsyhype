/* Nosy_Hype — la boutique : recherche, filtres par maison et par genre, rangées qui défilent ou grille.
   Données : js/parfums.js (parfums) et js/config.js (numéro WhatsApp). Chaque parfum a son bouton « Demander le prix ». */
(function () {
  'use strict';

  const C = window.NosyHype;
  const root = document.querySelector('[data-ct]');
  if (!C || !root) return;

  const $ = (sel, r = document) => r.querySelector(sel);
  const $$ = (sel, r = document) => Array.from(r.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ESC[ch]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const plural = (n, w) => `${n} ${w}${n > 1 ? 's' : ''}`;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  const SITE = Object.assign({ scrollSpeed: 36, catalogueView: 'Défilement' }, C.SITE || {});
  const SHOP = window.SHOP || {};
  const wa = (text) => C.waLink(text);
  const shortBrand = (b) => C.SHORT[b] || b;
  const ALL = C.PERFUMES;

  // Plateau pastel + accent lumineux : une teinte par maison.
  const TINTS = [
    { plate: 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 30%,#E4DEFF 100%)', accent: '#C3BBFF' },
    { plate: 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 30%,#FFD9C4 100%)', accent: '#FFC7A3' },
    { plate: 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 30%,#FBD3E3 100%)', accent: '#F7AECB' },
    { plate: 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 30%,#CFEAF6 100%)', accent: '#A6E1F3' },
    { plate: 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 30%,#F6E3B0 100%)', accent: '#F2D58C' },
    { plate: 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 30%,#CDEEDC 100%)', accent: '#A9E7C7' },
    { plate: 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 30%,#E7D3F6 100%)', accent: '#DDBDF7' },
    { plate: 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 30%,#FBD1C6 100%)', accent: '#F8B2A0' },
  ];
  const OTHER = { plate: 'linear-gradient(165deg,#FFFFFF 0%,#FFFFFF 30%,#DCDEF0 100%)', accent: '#C9CCEB' };

  const idx = C.brandIndex(ALL);
  const order = {};
  idx.main.forEach((b, i) => { order[b.name] = i; });
  const tint = (brand) => (brand === 'Autres' || idx.isOther(brand) ? OTHER : TINTS[(order[brand] || 0) % TINTS.length]);

  const el = {
    count: $('[data-ct-count]', root),
    search: $('[data-ct-search]', root),
    clear: $('[data-ct-clear]', root),
    chips: $('[data-ct-chips]', root),
    genders: $('[data-ct-genders]', root),
    views: $('[data-ct-views]', root),
    summary: $('[data-ct-summary]', root),
    reset: $('[data-ct-reset]', root),
    results: $('[data-ct-results]', root),
    moreGroups: $('[data-ct-more-groups]', root),
    empty: $('[data-ct-empty]', root),
    emptyWa: $('[data-ct-empty-wa]', root),
  };
  const st = {
    q: '', brand: 'Toutes', g: 'Tous',
    view: SITE.catalogueView === 'Grille' ? 'grid' : 'defile',
    groupsShown: 5, limit: 24, cols: 4, vw: window.innerWidth || 1280,
  };
  const GENDERS = [['Tous', 'Tous'], ['H', 'Homme'], ['F', 'Femme'], ['M', 'Mixte']];
  const VIEWS = [['defile', 'Défilement', 'i-move-horizontal'], ['grid', 'Grille', 'i-layout-grid']];

  el.count.textContent = `${ALL.length} parfums · ${new Set(ALL.map((p) => p.brand)).size} maisons`;

  function card(p, { grid = false, dup = false } = {}) {
    const t = tint(p.brand);
    const meta = [p.conc, C.GENRE[p.g]].filter(Boolean).join(' · ');
    const mono = p.brand.split(/[\s&]+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase();
    const full = `${p.brand} ${p.name}`;
    return `<article class="ct-card" style="--plate:${t.plate};--accent:${t.accent}"${dup ? ' aria-hidden="true"' : ''}>
      <div class="ct-card__plate">
        <img src="${esc(C.IMG(p.id))}" alt="${esc(full)}" loading="lazy" decoding="async" draggable="false">
        <div class="ct-card__ph" aria-hidden="true">${esc(mono)}</div>
        ${p.tag ? `<span class="ct-card__tag">${esc(p.tag)}</span>` : ''}
      </div>
      <div class="ct-card__body">
        <span class="ct-card__brand">${esc(shortBrand(p.brand))}</span>
        <h4 class="ct-card__name">${esc(p.name)}</h4>
        <span class="ct-card__meta">${esc(meta)}</span>
        ${grid && p.notes ? `<span class="ct-card__notes">${esc(p.notes)}</span>` : ''}
      </div>
      <a class="btn-price ct-card__ask" href="${esc(wa(C.askText(p)))}" target="_blank" rel="noopener" draggable="false" aria-label="${esc(`Demander le prix : ${full}`)}"${dup ? ' tabindex="-1"' : ''}><span class="wa-disc wa-disc--sm"><span class="i i-whatsapp"></span></span><span>Demander le prix</span></a>
    </article>`;
  }

  function groupHead({ name, accent, countLabel, open, openLabel }) {
    return `<div class="ct-group__head" style="--accent:${accent}">
      <span class="ct-group__dot" aria-hidden="true"></span>
      <h3 class="ct-group__name">${esc(name)}</h3>
      <span class="ct-group__count">${esc(countLabel)}</span>
      ${open ? `<button class="btn-see ct-group__open" type="button" data-action="brand" data-brand="${esc(open)}">${esc(openLabel)}<span class="i i-arrow-up-right"></span></button>` : ''}
    </div>`;
  }

  // Une rangée qui défile : les cartes sont répétées pour boucler sans fin.
  // S'il y a trop peu de parfums pour remplir la largeur, la rangée reste immobile.
  function marqueeRow(list, dir) {
    const vw = st.vw || 1280;
    const cardW = clamp(vw * 0.18, 210, 260) + 14;
    const avail = el.results.clientWidth || vw;
    if (list.length * cardW - 14 <= avail) {
      return `<div class="ct-marquee is-static"><div class="ct-track">${list.map((p) => card(p)).join('')}</div></div>`;
    }
    const vis = Math.ceil(vw / 224) + 2;
    const r = Math.max(2, Math.ceil(vis / list.length) + 1);
    let html = '';
    for (let k = 0; k < r; k++) html += list.map((p) => card(p, { dup: k > 0 })).join('');
    return `<div class="ct-marquee" data-dir="${dir}" data-n="${list.length}"><div class="ct-track">${html}</div></div>`;
  }

  function render() {
    const q = st.q.trim();
    const mode = q ? 'search' : st.brand === 'Toutes' ? 'all' : 'brand';
    const grid = st.view === 'grid';
    let html = '', total = 0, groupCount = 0;

    if (mode === 'all') {
      const list = C.filterPerfumes(ALL, { g: st.g });
      total = list.length;
      const by = {};
      list.forEach((p) => { const k = idx.isOther(p.brand) ? 'Autres' : p.brand; (by[k] = by[k] || []).push(p); });
      const keys = [...idx.main.map((b) => b.name), 'Autres'].filter((k) => by[k]);
      groupCount = keys.length;
      const per = st.cols === 3 ? 3 : 4;
      const labelOf = (k) => (k === 'Autres' ? 'Autres grandes maisons' : k);
      html = keys.slice(0, st.groupsShown).map((k, i) => {
        const items = by[k];
        const head = { name: labelOf(k), accent: tint(k).accent, countLabel: plural(items.length, 'parfum') };
        if (grid) {
          head.open = items.length > per ? k : '';
          head.openLabel = `Voir les ${items.length}`;
          return `<div class="ct-group">${groupHead(head)}<div class="ct-grid">${items.slice(0, per).map((p) => card(p, { grid: true })).join('')}</div></div>`;
        }
        head.open = items.length > 1 ? k : '';
        head.openLabel = 'Voir la maison';
        return `<div class="ct-group">${groupHead(head)}${marqueeRow(items, i % 2 ? -1 : 1)}</div>`;
      }).join('');
    } else {
      const list = C.filterPerfumes(ALL, { q, brand: mode === 'brand' ? st.brand : 'Toutes', g: st.g });
      total = list.length;
      const title = mode === 'search' ? `Résultats pour « ${q} »` : st.brand === 'Autres' ? 'Autres grandes maisons' : st.brand;
      const head = { name: title, accent: mode === 'search' ? '#E2C08D' : tint(st.brand).accent, countLabel: plural(total, 'parfum') };
      if (total && grid) {
        const more = total > st.limit
          ? `<button class="pill pill--outline ct-more-btn" type="button" data-action="more">Afficher plus · ${total - st.limit} restants</button>`
          : '';
        html = `<div class="ct-group">${groupHead(head)}<div class="ct-grid">${list.slice(0, st.limit).map((p) => card(p, { grid: true })).join('')}</div>${more}</div>`;
      } else if (total) {
        const half = Math.ceil(list.length / 2);
        const parts = list.length > 10 ? [list.slice(0, half), list.slice(half)] : [list];
        html = `<div class="ct-group">${groupHead(head)}${parts.map((part, i) => marqueeRow(part, i % 2 ? -1 : 1)).join('')}</div>`;
      }
    }

    el.results.className = `ct-results ${grid ? 'is-grid' : 'is-defile'}`;
    el.results.innerHTML = html;

    // Filtres
    const chipList = [
      { key: 'Toutes', label: 'Toutes', count: ALL.length, dot: '#E2C08D' },
      ...idx.main.map((b) => ({ key: b.name, label: b.label, count: b.count, dot: tint(b.name).accent })),
      ...(idx.others ? [{ key: 'Autres', label: 'Autres maisons', count: idx.others, dot: OTHER.accent }] : []),
    ];
    el.chips.innerHTML = chipList.map((b) => `<button class="chip" type="button" data-action="brand" data-brand="${esc(b.key)}" aria-pressed="${!q && st.brand === b.key}"><span class="dot" style="--c:${b.dot}" aria-hidden="true"></span>${esc(b.label)}<span class="ct-chip-count">${b.count}</span></button>`).join('');
    el.genders.innerHTML = GENDERS.map(([v, l]) => `<button type="button" data-action="genre" data-g="${v}" aria-pressed="${st.g === v}">${l}</button>`).join('');
    el.views.innerHTML = VIEWS.map(([v, l, ic]) => `<button type="button" data-action="view" data-view="${v}" aria-pressed="${st.view === v}"><span class="i ${ic}" aria-hidden="true"></span>${l}</button>`).join('');

    el.summary.textContent = mode === 'all' ? `${plural(total, 'parfum')} · ${plural(groupCount, 'maison')}` : plural(total, 'parfum');
    el.reset.hidden = !(q || st.g !== 'Tous' || st.brand !== 'Toutes');
    el.clear.hidden = !q;
    const moreGroups = mode === 'all' && groupCount > st.groupsShown;
    el.moreGroups.hidden = !moreGroups;
    if (moreGroups) el.moreGroups.firstElementChild.textContent = `Afficher plus de maisons · ${groupCount - st.groupsShown} restantes`;
    el.empty.hidden = total !== 0;
    el.emptyWa.href = wa(`Bonjour ${SHOP.name || 'Nosy_Hype'} ! Je cherche « ${q || 'un parfum'} », l’avez-vous ?`);

    syncMarquees();
  }

  function set(patch) { Object.assign(st, patch); render(); }

  function scrollToCatalogue() {
    const hdr = document.querySelector('[data-hdr]');
    const off = hdr ? hdr.getBoundingClientRect().height : 70;
    window.scrollTo({ top: el.chips.getBoundingClientRect().top + window.scrollY - off - 24, behavior: reduce ? 'auto' : 'smooth' });
  }

  function selectBrand(brand, scroll) {
    el.search.value = '';
    set({ brand, q: '', limit: 24 });
    if (scroll) scrollToCatalogue();
  }

  function resetFilters() {
    el.search.value = '';
    set({ q: '', g: 'Tous', brand: 'Toutes', limit: 24, groupsShown: 5 });
  }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const a = b.dataset.action;
    if (a === 'brand') selectBrand(b.dataset.brand, b.classList.contains('ct-group__open'));
    else if (a === 'genre') set({ g: b.dataset.g, limit: 24 });
    else if (a === 'view') set({ view: b.dataset.view });
    else if (a === 'more') set({ limit: st.limit + 24 });
    else if (a === 'more-groups') set({ groupsShown: st.groupsShown + 5 });
    else if (a === 'reset') resetFilters();
  });
  el.reset.addEventListener('click', resetFilters);
  el.clear.addEventListener('click', () => { el.search.value = ''; set({ q: '', limit: 24 }); el.search.focus(); });
  let searchT = 0;
  el.search.addEventListener('input', () => {
    clearTimeout(searchT);
    searchT = setTimeout(() => set({ q: el.search.value, limit: 24 }), 120);
  });

  // Photo introuvable : monogramme de la maison à la place.
  el.results.addEventListener('error', (e) => {
    const img = e.target;
    if (img && img.tagName === 'IMG') { const pl = img.closest('.ct-card__plate'); if (pl) pl.classList.add('is-broken'); }
  }, true);

  // Grille : léger effet 3D sur le flacon au survol.
  if (finePointer && !reduce) {
    el.results.addEventListener('mousemove', (e) => {
      const plate = e.target.closest('.ct-grid .ct-card__plate');
      if (!plate) return;
      const r = plate.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      plate.style.setProperty('--ry', `${(x * 24).toFixed(2)}deg`);
      plate.style.setProperty('--rx', `${(-y * 16).toFixed(2)}deg`);
      plate.style.setProperty('--lift', '1');
    });
    el.results.addEventListener('mouseout', (e) => {
      const plate = e.target.closest('.ct-grid .ct-card__plate');
      if (!plate || plate.contains(e.relatedTarget)) return;
      plate.style.setProperty('--ry', '0deg');
      plate.style.setProperty('--rx', '0deg');
      plate.style.setProperty('--lift', '0');
    });
  }

  // Défilement continu : chaque rangée boucle, pause au survol, glisser pour avancer.
  let mqs = [];
  let mqIO = null;
  let mqMoved = false;
  function syncMarquees() {
    if (mqIO) mqIO.disconnect();
    mqs = $$('.ct-marquee:not(.is-static)', el.results).map((node) => {
      const m = { el: node, track: node.firstElementChild, dir: Number(node.dataset.dir) < 0 ? -1 : 1, n: Number(node.dataset.n) || 0, off: 0, v: 0, setW: 0, vis: true, hover: false, focus: false, drag: false };
      node.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') m.hover = true; });
      node.addEventListener('pointerleave', () => { m.hover = false; });
      node.addEventListener('focusin', () => { m.focus = true; });
      node.addEventListener('focusout', () => { m.focus = false; });
      node.addEventListener('pointerdown', (e) => mqDown(e, m));
      return m;
    });
    if ('IntersectionObserver' in window) {
      mqIO = new IntersectionObserver((en) => en.forEach((e) => {
        const m = mqs.find((x) => x.el === e.target);
        if (m) m.vis = e.isIntersecting;
      }), { rootMargin: '120px 0px' });
      mqs.forEach((m) => mqIO.observe(m.el));
    }
  }

  function tickMarquees(dt) {
    const base = reduce ? 0 : SITE.scrollSpeed;
    for (const m of mqs) {
      if (!m.vis) continue;
      if (!m.setW) {
        const it = m.track.children;
        if (m.n && it.length > m.n) m.setW = it[m.n].offsetLeft - it[0].offsetLeft;
        if (!m.setW) continue;
      }
      if (!m.drag) {
        const target = m.hover || m.focus ? 0 : base * m.dir;
        m.v += (target - m.v) * (1 - Math.exp(-dt * 3));
        m.off += m.v * dt;
      }
      m.off = ((m.off % m.setW) + m.setW) % m.setW;
      m.track.style.transform = `translate3d(${(-m.off).toFixed(1)}px,0,0)`;
    }
  }

  function mqDown(e, m) {
    if (e.button && e.button > 0) return;
    const x0 = e.clientX, off0 = m.off;
    let moved = false;
    m.drag = true;
    m.el.classList.add('is-dragging');
    const move = (ev) => { const dx = ev.clientX - x0; if (Math.abs(dx) > 6) moved = true; m.off = off0 - dx; };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      m.drag = false;
      m.v = 0;
      m.el.classList.remove('is-dragging');
      mqMoved = moved;
      setTimeout(() => { mqMoved = false; }, 60);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }
  // Après un glisser, le relâchement ne doit pas ouvrir WhatsApp.
  el.results.addEventListener('click', (e) => { if (mqMoved && e.target.closest('.ct-marquee')) e.preventDefault(); }, true);

  // Largeur : nombre de colonnes de la grille et longueur des rangées qui défilent.
  function measure() {
    const W = el.results.clientWidth, vw = window.innerWidth || W;
    const minW = clamp(vw * 0.22, 160, 280), gap = clamp(vw * 0.012, 10, 16);
    const cols = Math.max(1, Math.floor((W + gap) / (minW + gap)));
    mqs.forEach((m) => { m.setW = 0; });
    const patch = {};
    if (cols !== st.cols) patch.cols = cols;
    if (Math.abs(vw - st.vw) > 60) patch.vw = vw;
    if (Object.keys(patch).length) set(patch);
  }
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(el.results);

  render();
  let last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (!document.hidden) tickMarquees(dt);
  }
  requestAnimationFrame(loop);
})();
