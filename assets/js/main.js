/* Nosy-Hype — interactions du site (d'après la maquette Claude Design « Nosy-Hype Futur »).
   Les données (réglages, parfums, avis) sont dans catalogue.js ; la carte dans madagascar.js. */
(function () {
  'use strict';

  const C = window.NosyHype;
  if (!C) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ESC[ch]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const plural = (n, w) => `${n} ${w}${n > 1 ? 's' : ''}`;
  const pad = (n) => String(n).padStart(2, '0');
  const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#${id}"/></svg>`;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  const SITE = Object.assign({ ringCount: 10, ringSpeed: 9, scrollSpeed: 36, catalogueView: 'Défilement' }, C.SITE || {});
  const wa = (text) => C.waLink(C.SHOP.whatsapp, text);
  const MSG = {
    hello: 'Bonjour Nosy-Hype ! J’aimerais des informations sur vos parfums.',
    ask: 'Bonjour Nosy-Hype ! Je cherche un parfum précis : ',
    order: 'Bonjour Nosy-Hype ! Je souhaite passer commande.',
    'other-city': 'Bonjour Nosy-Hype ! Livrez-vous dans ma ville : ',
  };

  const ALL = C.PERFUMES;
  const byId = new Map();
  const byName = new Map();
  ALL.forEach((p) => {
    if (!byId.has(p.id)) byId.set(p.id, p);
    if (!byName.has(p.name)) byName.set(p.name, p);
  });
  const shortBrand = (b) => C.SHORT[b] || b;

  /* ─── Coordonnées : un seul endroit à modifier (catalogue.js) ─── */
  $$('[data-wa]').forEach((a) => { const m = MSG[a.dataset.wa]; if (m) a.href = wa(m); });
  $$('[data-shop]').forEach((el) => {
    const k = el.dataset.shop, v = C.SHOP[k];
    if (!v) return;
    el.textContent = v;
    if (k === 'email') el.href = `mailto:${v}`;
  });
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ─── En-tête : fond au défilement + rubrique en cours ─── */
  const header = $('[data-header]');
  const waFloat = $('.wa-float');
  const navLinks = $$('[data-nav]');
  const spy = ['top', 'catalogue', 'livraison', 'commander', 'avis', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
  let current = 'top';
  let scrollQueued = false;
  function onScroll() {
    scrollQueued = false;
    header.classList.toggle('is-solid', (window.scrollY || 0) > 24);
    waFloat.classList.toggle('is-away', window.innerWidth < 1000 && (window.scrollY || 0) < 160);
    const line = window.innerHeight * 0.4;
    let id = 'top';
    spy.forEach((s) => { if (s.getBoundingClientRect().top <= line) id = s.id; });
    if (id === 'avis') id = 'commander';
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) id = 'contact';
    if (id !== current) {
      current = id;
      navLinks.forEach((a) => {
        const on = a.dataset.nav === id;
        a.classList.toggle('is-current', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }
  }
  const queueScroll = () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); } };
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll);
  onScroll();

  /* ─── 01 Accueil : anneau de flacons qui tourne ─── */
  const hero = $('[data-hero]');
  const ringEl = $('[data-ring]');
  const titleEl = $('[data-hero-title]');
  const label = $('[data-label]');
  const counter = $('[data-counter]');
  const front = {
    link: $('[data-front]'),
    brand: $('[data-front-brand]'),
    name: $('[data-front-name]'),
    idx: $('[data-front-idx]'),
    total: $('[data-front-total]'),
  };
  const ring = {
    items: [], orbs: [], angle: 0, vel: 0, seek: null, drag: null, dragMoved: false,
    hover: false, lastInteract: -1e9, frontIdx: -1, visible: true, geoDirty: true, g: null,
  };

  function buildRing() {
    const n = clamp(Math.round(SITE.ringCount), 6, 12);
    ring.items = (C.RING || []).filter((id) => byId.has(id)).slice(0, n).map((id) => byId.get(id));
    // Mise en page de l'accueil dès le départ (et à chaque changement de taille ou de police).
    const relayout = () => { ring.geoDirty = true; if (!ring.orbs.length) ring.g = geo(); };
    const ro = new ResizeObserver(relayout);
    ro.observe(hero);
    ro.observe(titleEl);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    ring.g = geo();
    ring.geoDirty = false;
    if (!ring.items.length) return;
    ringEl.innerHTML = ring.items.map((p, i) => `<a class="orb" href="${esc(wa(C.askText(p)))}" target="_blank" rel="noopener" draggable="false" data-i="${i}" aria-label="${esc(`Demander le prix : ${p.brand} ${p.name}`)}"><span class="orb__glow" aria-hidden="true"></span><img src="${esc(C.BOTTLE(p.id))}" alt="${esc(`${p.brand} ${p.name}`)}" decoding="async" draggable="false"></a>`).join('');
    ring.orbs = $$('.orb', ringEl);
    ring.orbs.forEach((orb, i) => {
      const img = orb.querySelector('img');
      const ready = () => { orb.dataset.ready = '1'; };
      if (img.complete && img.naturalWidth) ready();
      img.addEventListener('load', ready);
      img.addEventListener('error', () => {
        // Repli : photo du catalogue (fond blanc fondu dans le ciel).
        if (img.dataset.fallback) return;
        img.dataset.fallback = '1';
        orb.style.mixBlendMode = 'multiply';
        img.src = C.IMG(ring.items[i].id);
      });
      orb.addEventListener('click', (e) => {
        if (ring.dragMoved) { e.preventDefault(); return; }
        if (i !== ring.frontIdx) { e.preventDefault(); seekTo(i); }
      });
      orb.addEventListener('focus', () => { if (i !== ring.frontIdx) seekTo(i); });
      orb.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') ring.hover = true; });
      orb.addEventListener('pointerleave', () => { ring.hover = false; });
    });
    front.total.textContent = pad(ring.items.length);
    label.hidden = false;
    counter.hidden = false;
    $$('[data-ring-prev]').forEach((b) => b.addEventListener('click', () => seekTo(ring.frontIdx - 1)));
    $$('[data-ring-next]').forEach((b) => b.addEventListener('click', () => seekTo(ring.frontIdx + 1)));
    hero.addEventListener('pointerdown', ringDown);
    new IntersectionObserver((en) => { ring.visible = en[en.length - 1].isIntersecting; }).observe(hero);
    setFront(0);
  }

  function setFront(i) {
    ring.frontIdx = i;
    const p = ring.items[i];
    if (!p) return;
    front.brand.textContent = shortBrand(p.brand);
    front.name.textContent = p.name;
    front.link.href = wa(C.askText(p));
    front.link.setAttribute('aria-label', `Demander le prix : ${p.brand} ${p.name}`);
    front.idx.textContent = pad(i + 1);
  }

  // Géométrie de l'anneau (reprise telle quelle de la maquette) : ellipse à droite du titre
  // sur grand écran, sous le titre sur téléphone.
  function geo() {
    const W = hero.clientWidth || 1;
    const wide = W >= 1000;
    const set = (k, v) => hero.style.setProperty(k, v);
    hero.classList.toggle('is-wide', wide);
    if (wide) hero.style.minHeight = '';
    let cx, cy, rx, ry, bh;
    if (wide) {
      const H = hero.clientHeight || 1;
      rx = Math.min(W * 0.18, 340);
      bh = Math.min(H * 0.36, 320, rx * 0.98);
      ry = Math.max(22, rx * 0.17);
      cx = Math.min(W * 0.68, W - rx - bh * 0.37 - 110);
      cy = H * 0.62;
    } else {
      const tb = titleEl.offsetTop + titleEl.offsetHeight;
      rx = Math.min(W * 0.34, 300);
      bh = Math.max(150, Math.min(240, W * 0.48));
      ry = Math.max(18, rx * 0.17);
      cx = W / 2;
      cy = tb + 36 + bh - ry;
      hero.style.minHeight = `${Math.ceil(cy + ry + 120)}px`;
    }
    const bw = bh * 0.74, pr = Math.max(rx * 0.95, bh * 0.92);
    set('--bw', `${Math.round(bw)}px`);
    set('--bh', `${Math.round(bh)}px`);
    set('--oL', `${Math.round(cx - rx)}px`);
    set('--oT', `${Math.round(cy - ry)}px`);
    set('--oW', `${Math.round(2 * rx)}px`);
    set('--oH', `${Math.round(2 * ry)}px`);
    set('--pL', `${Math.round(cx - pr)}px`);
    set('--pT', `${Math.round(cy - bh * 0.5 - pr)}px`);
    set('--pD', `${Math.round(2 * pr)}px`);
    const labL = wide ? Math.min(cx + bw * 0.34 + 34, W - 256 - 96) : Math.max(8, cx - 176);
    const labT = wide ? Math.max(96, cy + ry - bh * 1.04) : cy + ry + 20;
    set('--labL', `${Math.round(labL)}px`);
    set('--labT', `${Math.round(labT)}px`);
    return { cx, cy, rx, ry, bw, bh };
  }

  function tickRing(now, dt) {
    const n = ring.orbs.length;
    if (!n || !ring.visible) return;
    if (ring.geoDirty || !ring.g) { ring.geoDirty = false; ring.g = geo(); }
    const g = ring.g;
    const step = (Math.PI * 2) / n;
    if (ring.seek != null) {
      ring.angle += (ring.seek - ring.angle) * (1 - Math.exp(-dt * 6));
      if (Math.abs(ring.seek - ring.angle) < 0.0008) { ring.angle = ring.seek; ring.seek = null; }
    } else if (!ring.drag) {
      const idle = now - ring.lastInteract > 4000;
      const speed = (SITE.ringSpeed * Math.PI) / 180;
      const auto = !reduce && idle ? speed * (ring.hover ? 0.22 : 1) : 0;
      ring.angle += (auto + ring.vel) * dt;
      ring.vel *= Math.exp(-dt * 2.4);
    }
    let best = -2, bi = 0;
    for (let i = 0; i < n; i++) {
      const el = ring.orbs[i];
      const a = ring.angle + i * step, x = Math.sin(a), z = Math.cos(a), t = (z + 1) / 2;
      const s = 0.46 + 0.54 * t;
      const bob = reduce ? 0 : Math.sin(now * 0.0012 + i * 1.7) * 6 * s;
      const px = g.cx + g.rx * x - g.bw / 2, py = g.cy + g.ry * z - g.bh + bob;
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      el.style.zIndex = String(z >= 0 ? 101 + Math.round(z * 90) : 99 + Math.round(z * 90));
      el.style.opacity = el.dataset.ready === '1' ? (0.62 + 0.38 * t).toFixed(3) : '0';
      el.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
      if (z > best) { best = z; bi = i; }
    }
    if (bi !== ring.frontIdx) setFront(bi);
  }

  function seekTo(i) {
    const n = ring.orbs.length;
    if (!n) return;
    const TAU = Math.PI * 2, base = -(((i % n) + n) % n) * (TAU / n);
    ring.seek = base + Math.round((ring.angle - base) / TAU) * TAU;
    ring.vel = 0;
    ring.lastInteract = performance.now();
  }

  function ringDown(e) {
    if ((e.button && e.button > 0) || !ring.g) return;
    if (e.target.closest && e.target.closest('[data-cta]')) return;
    const x0 = e.clientX, a0 = ring.angle, rx = ring.g.rx || 400;
    const d = { moved: false, lx: x0, lt: performance.now(), v: 0 };
    ring.drag = d;
    ring.seek = null;
    ring.vel = 0;
    ring.lastInteract = performance.now();
    const move = (ev) => {
      const dx = ev.clientX - x0, t = performance.now();
      if (Math.abs(dx) > 6) d.moved = true;
      const inst = (ev.clientX - d.lx) / rx / Math.max(0.008, (t - d.lt) / 1000);
      d.v = 0.7 * d.v + 0.3 * inst;
      d.lx = ev.clientX; d.lt = t;
      ring.angle = a0 + dx / rx;
      ring.lastInteract = t;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (d.moved) ring.vel = clamp(d.v, -3, 3);
      ring.dragMoved = d.moved;
      if (ring.drag === d) ring.drag = null;
      ring.lastInteract = performance.now();
      setTimeout(() => { ring.dragMoved = false; }, 60);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  /* ─── 02 Catalogue ─── */
  // Plateau pastel (aube) + accent lumineux : une teinte par maison.
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
  const RAINBOW = 'conic-gradient(#FFC7A3,#F7AECB,#C3BBFF,#A6E1F3,#F2D58C,#FFC7A3)';

  const idx = C.brandIndex(ALL);
  const order = {};
  idx.main.forEach((b, i) => { order[b.name] = i; });
  const tint = (brand) => (brand === 'Autres' || idx.isOther(brand) ? OTHER : TINTS[(order[brand] || 0) % TINTS.length]);

  const cat = {
    root: $('[data-catalogue]'),
    head: $('[data-cat-head]'),
    count: $('[data-cat-count]'),
    search: $('[data-search]'),
    chips: $('[data-chips]'),
    genders: $('[data-genders]'),
    views: $('[data-views]'),
    summary: $('[data-summary]'),
    reset: $('[data-reset]'),
    results: $('[data-results]'),
    moreGroups: $('[data-more-groups]'),
    empty: $('[data-empty]'),
    emptyWa: $('[data-empty-wa]'),
  };
  const st = {
    q: '', brand: 'Toutes', g: 'Tous',
    view: SITE.catalogueView === 'Grille' ? 'grid' : 'defile',
    groupsShown: 5, limit: 24, cols: 4, vw: window.innerWidth || 1280,
  };
  const GENDERS = [['Tous', 'Tous'], ['H', 'Homme'], ['F', 'Femme'], ['M', 'Mixte']];
  const VIEWS = [['defile', 'Défilement', 'i-marquee'], ['grid', 'Grille', 'i-grid']];

  cat.count.textContent = `${ALL.length} parfums · ${new Set(ALL.map((p) => p.brand)).size} maisons`;

  function card(p, { grid = false, dup = false } = {}) {
    const t = tint(p.brand);
    const meta = [p.conc, C.GENRE[p.g]].filter(Boolean).join(' · ');
    const mono = p.brand.split(/[\s&]+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase();
    const full = `${p.brand} ${p.name}`;
    return `<article class="card" style="--plate:${t.plate};--accent:${t.accent}"${dup ? ' aria-hidden="true"' : ''}>
      <div class="card__plate">
        <img src="${esc(C.IMG(p.id))}" alt="${esc(full)}" loading="lazy" decoding="async" draggable="false">
        <div class="card__ph" aria-hidden="true">${esc(mono)}</div>
        ${p.tag ? `<span class="card__tag">${esc(p.tag)}</span>` : ''}
      </div>
      <div class="card__body">
        <span class="card__brand">${esc(shortBrand(p.brand))}</span>
        <h4 class="card__name">${esc(p.name)}</h4>
        <span class="card__meta">${esc(meta)}</span>
        ${grid && p.notes ? `<span class="card__notes">${esc(p.notes)}</span>` : ''}
      </div>
      <a class="card__ask" href="${esc(wa(C.askText(p)))}" target="_blank" rel="noopener" draggable="false" aria-label="${esc(`Demander le prix : ${full}`)}"${dup ? ' tabindex="-1"' : ''}>Demander le prix<span class="card__ask-go">${icon('i-arrow-ur')}</span></a>
    </article>`;
  }

  function groupHead({ name, accent, countLabel, open, openLabel }) {
    return `<div class="group__head" style="--accent:${accent}">
      <span class="group__dot" aria-hidden="true"></span>
      <h3 class="group__name">${esc(name)}</h3>
      <span class="group__count">${esc(countLabel)}</span>
      ${open ? `<button class="btn btn--outline btn--sm group__open" type="button" data-action="brand" data-brand="${esc(open)}">${esc(openLabel)}</button>` : ''}
    </div>`;
  }

  // Une rangée qui défile : les cartes sont répétées pour boucler sans fin.
  // S'il y a trop peu de parfums pour remplir la largeur, la rangée reste immobile.
  function marqueeRow(list, dir) {
    const vw = st.vw || 1280;
    const cardW = clamp(vw * 0.18, 200, 250) + 14;
    const avail = cat.results.clientWidth || vw;
    if (list.length * cardW - 14 <= avail) {
      return `<div class="marquee is-static"><div class="marquee__track">${list.map((p) => card(p)).join('')}</div></div>`;
    }
    const vis = Math.ceil(vw / 214) + 2;
    const r = Math.max(2, Math.ceil(vis / list.length) + 1);
    let html = '';
    for (let k = 0; k < r; k++) html += list.map((p) => card(p, { dup: k > 0 })).join('');
    return `<div class="marquee" data-dir="${dir}" data-n="${list.length}"><div class="marquee__track">${html}</div></div>`;
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
          head.openLabel = `Voir les ${items.length} →`;
          return `<div class="group">${groupHead(head)}<div class="grid">${items.slice(0, per).map((p) => card(p, { grid: true })).join('')}</div></div>`;
        }
        head.open = items.length > 1 ? k : '';
        head.openLabel = 'Voir la maison →';
        return `<div class="group">${groupHead(head)}${marqueeRow(items, i % 2 ? -1 : 1)}</div>`;
      }).join('');
    } else {
      const list = C.filterPerfumes(ALL, { q, brand: mode === 'brand' ? st.brand : 'Toutes', g: st.g });
      total = list.length;
      const title = mode === 'search' ? `Résultats pour « ${q} »` : st.brand === 'Autres' ? 'Autres grandes maisons' : st.brand;
      const head = { name: title, accent: mode === 'search' ? '#FFC7A3' : tint(st.brand).accent, countLabel: plural(total, 'parfum') };
      if (total && grid) {
        const more = total > st.limit
          ? `<button class="btn btn--outline btn--md group__more" type="button" data-action="more">Afficher plus · ${total - st.limit} restants</button>`
          : '';
        html = `<div class="group">${groupHead(head)}<div class="grid">${list.slice(0, st.limit).map((p) => card(p, { grid: true })).join('')}</div>${more}</div>`;
      } else if (total) {
        const half = Math.ceil(list.length / 2);
        const parts = list.length > 10 ? [list.slice(0, half), list.slice(half)] : [list];
        html = `<div class="group">${groupHead(head)}${parts.map((part, i) => marqueeRow(part, i % 2 ? -1 : 1)).join('')}</div>`;
      }
    }

    cat.results.className = `cat-results ${grid ? 'is-grid' : 'is-defile'}`;
    cat.results.innerHTML = html;

    // Filtres
    const chipList = [
      { key: 'Toutes', label: 'Toutes', count: ALL.length, dot: RAINBOW },
      ...idx.main.map((b) => ({ key: b.name, label: b.label, count: b.count, dot: tint(b.name).accent })),
      ...(idx.others ? [{ key: 'Autres', label: 'Autres maisons', count: idx.others, dot: OTHER.accent }] : []),
    ];
    cat.chips.innerHTML = chipList.map((b) => `<button class="chip" type="button" data-action="brand" data-brand="${esc(b.key)}" aria-pressed="${!q && st.brand === b.key}"><span class="chip__dot" style="background:${b.dot}" aria-hidden="true"></span>${esc(b.label)}<span class="chip__count">${b.count}</span></button>`).join('');
    cat.genders.innerHTML = GENDERS.map(([v, l]) => `<button class="seg__btn" type="button" data-action="genre" data-g="${v}" aria-pressed="${st.g === v}">${l}</button>`).join('');
    cat.views.className = 'seg seg--views';
    cat.views.innerHTML = VIEWS.map(([v, l, ic]) => `<button class="seg__btn" type="button" data-action="view" data-view="${v}" aria-pressed="${st.view === v}">${icon(ic)}${l}</button>`).join('');

    cat.summary.textContent = mode === 'all' ? `${plural(total, 'parfum')} · ${plural(groupCount, 'maison')}` : plural(total, 'parfum');
    cat.reset.hidden = !(q || st.g !== 'Tous' || st.brand !== 'Toutes');
    const moreGroups = mode === 'all' && groupCount > st.groupsShown;
    cat.moreGroups.hidden = !moreGroups;
    if (moreGroups) cat.moreGroups.firstElementChild.textContent = `Afficher plus de maisons · ${groupCount - st.groupsShown} restantes`;
    cat.empty.hidden = total !== 0;
    cat.emptyWa.href = wa(`Bonjour Nosy-Hype ! Je cherche « ${q || 'un parfum'} », l’avez-vous ?`);

    syncMarquees();
  }

  function set(patch) { Object.assign(st, patch); render(); }

  function selectBrand(brand, scroll) {
    cat.search.value = '';
    set({ brand, q: '', limit: 24 });
    if (scroll) window.scrollTo({ top: cat.head.getBoundingClientRect().top + window.scrollY - 96, behavior: reduce ? 'auto' : 'smooth' });
  }

  function resetFilters() {
    cat.search.value = '';
    set({ q: '', g: 'Tous', brand: 'Toutes', limit: 24, groupsShown: 5 });
  }

  cat.root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const a = b.dataset.action;
    if (a === 'brand') selectBrand(b.dataset.brand, b.classList.contains('group__open'));
    else if (a === 'genre') set({ g: b.dataset.g, limit: 24 });
    else if (a === 'view') set({ view: b.dataset.view });
    else if (a === 'more') set({ limit: st.limit + 24 });
    else if (a === 'more-groups') set({ groupsShown: st.groupsShown + 5 });
    else if (a === 'reset') resetFilters();
  });
  cat.reset.addEventListener('click', resetFilters);
  cat.search.addEventListener('input', () => set({ q: cat.search.value, limit: 24 }));

  // Photo introuvable : monogramme de la maison à la place.
  cat.results.addEventListener('error', (e) => {
    const img = e.target;
    if (img && img.tagName === 'IMG') { const pl = img.closest('.card__plate'); if (pl) pl.classList.add('is-broken'); }
  }, true);

  // Grille : léger effet 3D sur le flacon au survol.
  if (finePointer) {
    cat.results.addEventListener('mousemove', (e) => {
      const el = e.target.closest('.grid .card__plate');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${(x * 24).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-y * 16).toFixed(2)}deg`);
      el.style.setProperty('--lift', '1');
    });
    cat.results.addEventListener('mouseout', (e) => {
      const el = e.target.closest('.grid .card__plate');
      if (!el || el.contains(e.relatedTarget)) return;
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--lift', '0');
    });
  }

  // Défilement continu : chaque rangée boucle, pause au survol, glisser pour avancer.
  let mqs = [];
  let mqIO = null;
  let mqMoved = false;
  function syncMarquees() {
    if (mqIO) mqIO.disconnect();
    mqs = $$('.marquee:not(.is-static)', cat.results).map((el) => {
      const m = { el, track: el.firstElementChild, dir: Number(el.dataset.dir) < 0 ? -1 : 1, n: Number(el.dataset.n) || 0, off: 0, v: 0, setW: 0, vis: true, hover: false, focus: false, drag: false };
      el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') m.hover = true; });
      el.addEventListener('pointerleave', () => { m.hover = false; });
      el.addEventListener('focusin', () => { m.focus = true; });
      el.addEventListener('focusout', () => { m.focus = false; });
      el.addEventListener('pointerdown', (e) => mqDown(e, m));
      return m;
    });
    mqIO = new IntersectionObserver((en) => en.forEach((e) => {
      const m = mqs.find((x) => x.el === e.target);
      if (m) m.vis = e.isIntersecting;
    }), { rootMargin: '120px 0px' });
    mqs.forEach((m) => mqIO.observe(m.el));
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
  cat.results.addEventListener('click', (e) => { if (mqMoved && e.target.closest('.marquee')) e.preventDefault(); }, true);

  // Largeur : nombre de colonnes de la grille et longueur des rangées qui défilent.
  function measure() {
    const W = cat.head.clientWidth, vw = window.innerWidth || W;
    const minW = clamp(vw * 0.22, 150, 280), gap = clamp(vw * 0.012, 10, 16);
    const cols = Math.max(1, Math.floor((W + gap) / (minW + gap)));
    mqs.forEach((m) => { m.setW = 0; });
    const patch = {};
    if (cols !== st.cols) patch.cols = cols;
    if (Math.abs(vw - st.vw) > 60) patch.vw = vw;
    if (Object.keys(patch).length) set(patch);
  }
  new ResizeObserver(measure).observe(cat.head);

  /* ─── 03 Livraison : carte de Madagascar ─── */
  const CITIES = ['Antananarivo', 'Toamasina', 'Mahajanga', 'Antsiranana', 'Toliara', 'Fianarantsoa', 'Nosy Be', 'Taolagnaro', 'Antsirabe', 'Morondava', 'Sainte-Marie', 'Sambava', 'Manakara'];
  const mapEl = $('[data-map]');
  const citiesEl = $('[data-cities]');
  const cityCta = $('[data-city-cta]');
  const cityLabel = $('[data-city-label]');
  let city = '', hoverCity = '', hubName = 'Antananarivo';

  function mapSVG(M) {
    const { w, h, d, cities } = M, anim = !reduce;
    const hub = cities.find((c) => c.name === 'Antananarivo') || cities[0];
    hubName = hub.name;
    const routes = cities.filter((c) => c !== hub).map((c, i) => {
      const dx = c.x - hub.x, dy = c.y - hub.y, L = Math.hypot(dx, dy) || 1, k = 0.22 * L * (i % 2 ? 1 : -1);
      const qx = (hub.x + c.x) / 2 - (dy / L) * k, qy = (hub.y + c.y) / 2 + (dx / L) * k;
      const p = `M${hub.x} ${hub.y} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${c.x} ${c.y}`;
      const dash = anim ? '<animate attributeName="stroke-dashoffset" values="0;-18" dur="1.4s" repeatCount="indefinite"/>' : '';
      const dot = anim ? `<circle r="2.6" fill="#FFE6F0" filter="url(#nhGlow)"><animateMotion dur="${(2.6 + (i % 4) * 0.5).toFixed(1)}s" begin="${(i * 0.35).toFixed(2)}s" repeatCount="indefinite" path="${p}"/></circle>` : '';
      return `<g data-route="${esc(c.name)}"><path d="${p}" fill="none" stroke="url(#nhRoute)" stroke-width="1.2" stroke-dasharray="3 6" stroke-linecap="round" opacity="0.7">${dash}</path>${dot}</g>`;
    }).join('');
    const pts = cities.map((c, i) => {
      const isHub = c === hub, e = c.side === 'e', dl = ((i * 0.37) % 2.6).toFixed(2);
      const pulse = anim ? `<circle r="3" fill="none" stroke="#FFD9C4" stroke-width="1"><animate attributeName="r" values="3;${isHub ? 22 : 14}" dur="2.6s" begin="${dl}s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="0.85;0" dur="2.6s" begin="${dl}s" repeatCount="indefinite"/></circle>` : '';
      return `<g data-city="${esc(c.name)}"${isHub ? ' data-hub=""' : ''} transform="translate(${c.x} ${c.y})"><title>${esc(c.name)}</title><circle r="16" fill="transparent"/>${pulse}<circle data-dot="" r="${isHub ? 4.5 : 3}" fill="${isHub ? '#FFD9C4' : '#FFFFFF'}"/><text x="${e ? 10 : -10}" y="3.8" text-anchor="${e ? 'start' : 'end'}" font-family="Hanken Grotesk, sans-serif" font-size="10.5" font-weight="600" letter-spacing="1.4" fill="#C9CCEB">${esc(c.name.toUpperCase())}</text></g>`;
    }).join('');
    const scan = anim ? `<rect x="0" y="-160" width="${w}" height="160" fill="url(#nhScan)"><animate attributeName="y" values="-160;${h}" dur="6s" repeatCount="indefinite"/></rect>` : '';
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carte de Madagascar : livraison dans toute l’île, depuis Antananarivo">
<defs>
<linearGradient id="nhEdge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFC7A3"/><stop offset="0.35" stop-color="#F7AECB"/><stop offset="0.7" stop-color="#C3BBFF"/><stop offset="1" stop-color="#A6E1F3"/></linearGradient>
<radialGradient id="nhFill" cx="0.55" cy="0.42" r="0.75"><stop offset="0" stop-color="#2D3274"/><stop offset="1" stop-color="#141A44"/></radialGradient>
<pattern id="nhDots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.9" fill="#C3BBFF" fill-opacity="0.35"/></pattern>
<linearGradient id="nhRoute" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFD9C4"/><stop offset="1" stop-color="#F7AECB"/></linearGradient>
<linearGradient id="nhScan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C3BBFF" stop-opacity="0"/><stop offset="0.5" stop-color="#C3BBFF" stop-opacity="0.25"/><stop offset="1" stop-color="#C3BBFF" stop-opacity="0"/></linearGradient>
<clipPath id="nhClip"><path d="${d}"/></clipPath>
<filter id="nhBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="nhGlow" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<path d="${d}" fill="none" stroke="#B49CFF" stroke-opacity="0.5" stroke-width="14" filter="url(#nhBlur)"/>
<path d="${d}" fill="url(#nhFill)"/>
<g clip-path="url(#nhClip)"><rect width="${w}" height="${h}" fill="url(#nhDots)"/>${scan}</g>
<path d="${d}" fill="none" stroke="url(#nhEdge)" stroke-width="1.6" stroke-linejoin="round"/>
${routes}
${pts}
</svg>`;
  }

  function paintCity() {
    const on = hoverCity || city;
    const focus = on && on !== hubName;
    $$('[data-city]', mapEl).forEach((g) => {
      const a = g.getAttribute('data-city') === on, hub = g.hasAttribute('data-hub');
      const dot = g.querySelector('[data-dot]'), txt = g.querySelector('text');
      if (dot) { dot.setAttribute('r', a ? '6' : hub ? '4.5' : '3'); dot.setAttribute('fill', a ? '#FFC7A3' : hub ? '#FFD9C4' : '#FFFFFF'); }
      if (txt) { txt.setAttribute('fill', a ? '#FFFFFF' : '#C9CCEB'); txt.setAttribute('font-size', a ? '12.5' : '10.5'); }
    });
    $$('[data-route]', mapEl).forEach((r) => {
      const a = r.getAttribute('data-route') === on, p = r.querySelector('path');
      if (p) { p.setAttribute('opacity', focus ? (a ? '1' : '0.22') : '0.7'); p.setAttribute('stroke-width', a ? '2.2' : '1.2'); }
    });
  }

  function setCity(name) {
    city = city === name ? '' : name;
    $$('[data-city-btn]', citiesEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cityBtn === city)));
    cityLabel.textContent = city ? `Commander depuis ${city}` : 'Demander la livraison';
    cityCta.href = wa(city ? `Bonjour Nosy-Hype ! Je suis à ${city} et je voudrais commander un parfum.` : 'Bonjour Nosy-Hype ! Livrez-vous dans ma ville : ');
    paintCity();
  }

  citiesEl.insertAdjacentHTML('afterbegin', CITIES.map((n) => `<button class="chip" type="button" data-city-btn="${esc(n)}" aria-pressed="false">${esc(n)}</button>`).join(''));
  citiesEl.addEventListener('click', (e) => { const b = e.target.closest('[data-city-btn]'); if (b) setCity(b.dataset.cityBtn); });
  citiesEl.addEventListener('mouseover', (e) => { const b = e.target.closest('[data-city-btn]'); const n = b ? b.dataset.cityBtn : ''; if (n !== hoverCity) { hoverCity = n; paintCity(); } });
  citiesEl.addEventListener('mouseleave', () => { hoverCity = ''; paintCity(); });
  setCity('');

  if (window.NosyMap && mapEl) {
    mapEl.innerHTML = mapSVG(window.NosyMap);
    const pick = (e) => { const g = e.target.closest && e.target.closest('[data-city]'); return g ? g.getAttribute('data-city') : ''; };
    mapEl.addEventListener('click', (e) => { const n = pick(e); if (n) setCity(n); });
    mapEl.addEventListener('mouseover', (e) => { const n = pick(e); if (n !== hoverCity) { hoverCity = n; paintCity(); } });
    mapEl.addEventListener('mouseleave', () => { hoverCity = ''; paintCity(); });
    paintCity();
  }

  /* ─── 04 Commander : copier le numéro MVola ─── */
  const copyBtn = $('[data-copy-mvola]');
  const copyLabel = $('[data-copy-label]');
  let copyT = 0;
  copyBtn.addEventListener('click', async () => {
    const ok = await C.copyText(String(C.SHOP.mvola).replace(/\D/g, ''));
    if (!ok) {
      // Copie impossible : on sélectionne le numéro pour une copie manuelle.
      const num = $('.mvola__num');
      const sel = window.getSelection(), r = document.createRange();
      r.selectNodeContents(num); sel.removeAllRanges(); sel.addRange(r);
      return;
    }
    copyLabel.textContent = 'Numéro copié ✓';
    clearTimeout(copyT);
    copyT = setTimeout(() => { copyLabel.textContent = 'Copier le numéro'; }, 2400);
  });

  /* ─── 05 Avis ─── */
  $('[data-reviews]').innerHTML = C.REVIEWS.slice(0, 3).map((r) => {
    const p = byName.get(r.p);
    const stars = clamp(Math.round(r.stars), 0, 5);
    return `<figure class="review">
      ${r.exemple ? '<span class="review__flag" title="Avis d’exemple, à remplacer par un vrai avis client">Exemple</span>' : ''}
      <div class="review__stars" role="img" aria-label="${stars} sur 5"><span class="on">${'★'.repeat(stars)}</span><span class="off">${'★'.repeat(5 - stars)}</span></div>
      <blockquote class="review__text">« ${esc(r.text)} »</blockquote>
      <figcaption class="review__who">
        <span class="review__img">${p ? `<img src="${esc(C.IMG(p.id))}" alt="" loading="lazy" onerror="this.remove()">` : ''}</span>
        <span class="review__name"><strong>${esc(r.name)}</strong><span>${esc(r.p)}</span></span>
      </figcaption>
    </figure>`;
  }).join('');

  /* ─── Démarrage ─── */
  render();
  buildRing();
  let last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (document.hidden) return;
    tickRing(now, dt);
    tickMarquees(dt);
  }
  requestAnimationFrame(loop);
})();
