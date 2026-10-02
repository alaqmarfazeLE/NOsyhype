/* =========================================================
   NOSY HYPE — interactions
   (no dependencies — the catalogue lives in products.js,
   reviews in reviews.js, shop settings in config.js;
   the 3D hero bottle is in hero3d.js)
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Settings & helpers ---------- */
  const CFG = Object.assign({
    whatsappNumber: '261380582719',
    whatsappDisplay: '+261 38 05 827 19',
    instagramUrl: 'https://www.instagram.com/nosy_hype/',
    instagramHandle: '@nosy_hype',
    email: 'alaqmarfazele579@gmail.com',
    mvolaNumber: '038 05 827 19',
    depositPercent: 50,
    currency: 'Ar',
  }, window.NOSY_CONFIG || {});

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const nf = new Intl.NumberFormat('fr-FR');
  const money = (n) => `${nf.format(Math.round(n)).replace(/\s/g, ' ')} ${CFG.currency}`;
  const parseAmount = (str) => { const d = String(str || '').replace(/\D/g, '').slice(0, 12); return d ? parseInt(d, 10) : 0; };
  const depositOf = (n) => Math.ceil((n * CFG.depositPercent) / 100);
  const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const slugify = (s) => fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const waLink = (text) => `https://wa.me/${String(CFG.whatsappNumber).replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  const tryStore = (kind) => ({
    get(k) { try { return window[kind].getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window[kind].setItem(k, v); } catch (e) { /* storage unavailable */ } },
  });
  const store = tryStore('localStorage');
  const session = tryStore('sessionStorage');
  const inView = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  };

  /* ---------- Catalogue data ---------- */
  const seen = new Set();
  const PRODUCTS = (Array.isArray(window.NOSY_PRODUCTS) ? window.NOSY_PRODUCTS : []).map((p, i) => {
    const brand = p.brand || '';
    const name = p.name || 'Parfum';
    let id = slugify(`${brand} ${name}`) || `parfum-${i + 1}`;
    while (seen.has(id)) id += `-${i + 1}`;
    seen.add(id);
    const notes = Array.isArray(p.notes) ? p.notes : [];
    return {
      id, brand, name, notes,
      category: p.category || 'Parfum',
      description: p.description || '',
      image: p.image || '',
      available: p.available !== false,
      vedette: !!p.vedette,
      haystack: fold([brand, name, p.category, ...notes].join(' ')),
    };
  });
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const fullName = (p) => (p.brand ? `${p.brand} — ${p.name}` : p.name);
  const initials = (brand) => {
    const b = String(brand || '').trim();
    if (!b) return 'NH';
    if (/^[^\s]+&[^\s]+$/.test(b)) return b.split('&').map((w) => w[0].toUpperCase()).join('&');
    const words = b.split(/\s+/).filter((w) => !/^(de|du|la|le|des|london|parfums)$/i.test(w) || b.split(/\s+/).length === 1);
    return (words.length ? words : [b]).slice(0, 3).map((w) => w[0].toUpperCase()).join('');
  };

  // real photo when provided, otherwise (or if it fails to load) an elegant placeholder card
  function mediaHTML(p, lazy = true) {
    if (p.image) {
      return `<img class="media photo" src="${esc(p.image)}" alt="Flacon ${esc(fullName(p))}" width="375" height="500"${lazy ? ' loading="lazy"' : ''} decoding="async" referrerpolicy="no-referrer" data-id="${esc(p.id)}">`;
    }
    return placeholderHTML(p);
  }
  function placeholderHTML(p) {
    return `<div class="media ph" role="img" aria-label="${esc(fullName(p))}, photo à venir">
      <span class="ph__orbit" aria-hidden="true"></span>
      <span class="ph__mono" aria-hidden="true">${esc(initials(p.brand))}</span>
      <span class="ph__brand" aria-hidden="true">${esc(p.brand)}</span>
      <span class="ph__name" aria-hidden="true">${esc(p.name)}</span>
      <span class="ph__tag" aria-hidden="true">Photo à venir</span>
    </div>`;
  }

  // photos fade in once loaded; a photo that cannot load is swapped for the placeholder card
  function initPhotos() {
    document.addEventListener('load', (e) => {
      const img = e.target;
      if (img && img.classList && img.classList.contains('photo')) img.classList.add('is-loaded');
    }, true);
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.classList.contains('photo')) return;
      const p = byId(img.dataset.id);
      if (!p) return;
      const tmp = document.createElement('div');
      tmp.innerHTML = placeholderHTML(p);
      img.replaceWith(tmp.firstElementChild);
    }, true);
  }

  /* ---------- Shop settings → page ---------- */
  function bindConfig() {
    $$('[data-config]').forEach((el) => { const v = CFG[el.dataset.config]; if (v) el.textContent = v; });
    $$('[data-wa]').forEach((el) => { el.href = waLink(el.dataset.wa); });
    $$('[data-mail]').forEach((el) => { el.href = `mailto:${CFG.email}`; });
    $$('[data-ig]').forEach((el) => { el.href = CFG.instagramUrl; });
    $$('[data-product-total]').forEach((el) => { el.textContent = `· ${PRODUCTS.length} références`; });
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2800);
  }

  /* ---------- Scroll lock & focus trap ---------- */
  let locks = 0;
  function lock() {
    if (locks++ === 0) {
      const sb = window.innerWidth - root.clientWidth;
      if (sb > 0) body.style.paddingRight = `${sb}px`;
      root.classList.add('is-locked');
    }
  }
  function unlock() {
    if (locks > 0 && --locks === 0) {
      root.classList.remove('is-locked');
      body.style.paddingRight = '';
    }
  }
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapTab(e, containers) {
    if (e.key !== 'Tab') return;
    const items = containers.flatMap((c) => $$(FOCUSABLE, c)).filter((el) => el.getClientRects().length && !el.closest('[hidden]'));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Loader ---------- */
  function runLoader(done) {
    const loader = $('#loader');
    const bar = $('#loader-progress');
    if (!loader) { done(); return; }
    const repeat = session.get('nh-visited') === '1';
    session.set('nh-visited', '1');
    const minTime = reduceMotion ? 150 : repeat ? 900 : 2100;
    const start = performance.now();
    let p = 0;
    const setP = (v) => { p = Math.max(p, v); if (bar) bar.style.transform = `scaleX(${p})`; };
    setP(0.12);
    const fontsReady = (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setP(0.45));
    const stageReady = new Promise((res) => {
      if (window.__hero3dReady || !$('[data-hero3d]')) { res(); return; }
      window.addEventListener('hero3d:ready', res, { once: true });
    }).then(() => setP(0.85));
    const creep = setInterval(() => setP(Math.min(p + 0.03, 0.92)), 160);
    const cap = new Promise((res) => setTimeout(res, 3500));
    Promise.race([Promise.all([fontsReady, stageReady]), cap]).then(() => {
      const wait = Math.max(0, minTime - (performance.now() - start));
      setTimeout(() => {
        clearInterval(creep);
        setP(1);
        setTimeout(() => {
          loader.classList.add('is-done');
          done();
          setTimeout(() => loader.remove(), 1300);
        }, reduceMotion ? 0 : 420);
      }, wait);
    });
  }

  /* ---------- Scroll: progress bar, header state, parallax ---------- */
  const header = $('#header');
  const progress = $('.scroll-progress span');
  const parallax = reduceMotion ? [] : $$('[data-parallax]');
  let ticking = false;
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); }
  }
  function updateScroll() {
    ticking = false;
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    const vh = window.innerHeight;
    for (const el of parallax) {
      const box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) continue;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const limit = box.height * 0.07;
      const offset = Math.max(-limit, Math.min(limit, (box.top + box.height / 2 - vh / 2) * -speed));
      el.style.setProperty('--py', `${offset.toFixed(1)}px`);
    }
  }

  /* ---------- Navigation: active section indicator ---------- */
  const navLinks = $$('.nav__link');
  const mLinks = $$('.mmenu__nav a');
  const indicator = $('.nav__indicator');
  let activeKey = null;
  function moveIndicator() {
    if (!indicator) return;
    const a = navLinks.find((l) => l.dataset.nav === activeKey);
    if (!a) { indicator.classList.remove('is-visible'); return; }
    indicator.style.width = `${a.offsetWidth}px`;
    indicator.style.transform = `translateX(${a.offsetLeft}px)`;
    indicator.classList.add('is-visible');
  }
  function setActive(key) {
    if (key === activeKey) return;
    activeKey = key;
    [...navLinks, ...mLinks].forEach((a) => {
      const on = a.dataset.nav === key;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    moveIndicator();
  }
  function initScrollSpy() {
    const sections = $$('[data-spy]');
    if (!('IntersectionObserver' in window) || !sections.length) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.dataset.spy || null); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const mmenu = $('#mobile-menu');
  let menuOpen = false;
  let menuTimer;
  function openMenu() {
    if (menuOpen || !mmenu) return;
    menuOpen = true;
    clearTimeout(menuTimer);
    mmenu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    header.classList.add('menu-open');
    lock();
    requestAnimationFrame(() => requestAnimationFrame(() => mmenu.classList.add('is-open')));
  }
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    mmenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    header.classList.remove('menu-open');
    unlock();
    menuTimer = setTimeout(() => { if (!menuOpen) mmenu.hidden = true; }, reduceMotion ? 0 : 900);
  }
  function initMenu() {
    if (!burger || !mmenu) return;
    burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
    mmenu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    window.addEventListener('resize', () => { if (menuOpen && window.innerWidth >= 960) closeMenu(); });
  }

  /* ---------- Split headings into words for the reveal ---------- */
  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
            if (!part) return;
            if (/^[ \t\n\r]+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const wi = document.createElement('span');
            wi.className = 'wi';
            wi.style.setProperty('--i', i++);
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.tagName === 'EM') n.classList.add('is-split');
          walk(n);
        }
      });
    };
    walk(el);
  }

  /* ---------- Reveal on scroll ---------- */
  let revealIO = null;
  function observeReveal(els) {
    if (!revealIO) { els.forEach((el) => el.classList.add('is-in')); return; }
    els.forEach((el) => revealIO.observe(el));
  }
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      $$('.reveal, [data-split]').forEach((el) => el.classList.add('is-in'));
      return;
    }
    revealIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    observeReveal($$('.reveal, [data-split]'));
  }

  /* ---------- Subtle 3D tilt + gold reflection that follows the pointer ---------- */
  function bindTilt(el, max) {
    if (!finePointer || reduceMotion || !el) return;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${((x - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - y) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  }

  /* ---------- Collection: search, filters, cards, "voir plus" ---------- */
  const PAGE = 12;
  const grid = $('#product-grid');
  const filtersEl = $('#filters');
  const countEl = $('#product-count');
  const moreBtn = $('#more');
  const emptyEl = $('#grid-empty');
  const searchEl = $('#search');
  const state = { cat: 'all', q: '', limit: PAGE };

  const matches = () => {
    const words = fold(state.q).split(/\s+/).filter(Boolean);
    return PRODUCTS.filter((p) => (state.cat === 'all' || p.category === state.cat) && words.every((w) => p.haystack.includes(w)));
  };

  function cardHTML(p, i) {
    return `
      <div class="grid__item reveal" data-id="${esc(p.id)}" style="--d:${((i % 3) * 0.08).toFixed(2)}s">
        <article class="card">
          <div class="card__media">
            ${mediaHTML(p)}
            ${p.available ? '' : '<span class="card__badge">Sur demande</span>'}
            <span class="card__scan" aria-hidden="true"></span>
            <span class="card__sheen" aria-hidden="true"></span>
          </div>
          <div class="card__body">
            <p class="card__brand">${esc(p.brand)}</p>
            <h3 class="card__name">${esc(p.name)}</h3>
            <p class="card__notes">${p.notes.map(esc).join(' · ')}</p>
            <div class="card__foot">
              <span class="card__cat">${esc(p.category)}</span>
              <span class="card__cta" aria-hidden="true"><span class="card__cta-txt">Découvrir</span><svg class="i"><use href="#i-arrow"/></svg></span>
            </div>
          </div>
          <button class="card__hit" type="button" data-open-product="${esc(p.id)}"
            aria-label="Découvrir ${esc(fullName(p))} — ${esc(p.category)}${p.available ? '' : ', sur demande'}"></button>
        </article>
      </div>`;
  }

  function renderGrid(append = false) {
    if (!grid) return;
    const list = matches();
    const shown = $$('.grid__item', grid).length;
    if (append) {
      const tmp = document.createElement('div');
      tmp.innerHTML = list.slice(shown, state.limit).map((p, i) => cardHTML(p, i)).join('');
      const fresh = Array.from(tmp.children);
      fresh.forEach((el) => grid.appendChild(el));
      fresh.forEach((el) => bindTilt($('.card', el), 4));
      observeReveal(fresh);
    } else {
      grid.innerHTML = list.slice(0, state.limit).map(cardHTML).join('');
      $$('.card', grid).forEach((c) => bindTilt(c, 4));
      observeReveal($$('.grid__item', grid));
    }
    const left = Math.max(0, list.length - state.limit);
    if (moreBtn) {
      moreBtn.hidden = left === 0;
      $('#more-count').textContent = `(${left})`;
    }
    if (countEl) countEl.textContent = `${list.length} parfum${list.length > 1 ? 's' : ''}`;
    if (emptyEl) {
      emptyEl.hidden = list.length > 0;
      const q = state.q.trim();
      $('#empty-wa').href = waLink(`Bonjour NOSY HYPE, je recherche le parfum : ${q || ''}`);
    }
  }

  function initCatalogue() {
    if (!grid) return;
    const cats = [...new Set(PRODUCTS.map((p) => p.category))];
    if (filtersEl) {
      const count = (c) => PRODUCTS.filter((p) => c === 'all' || p.category === c).length;
      filtersEl.innerHTML = [['all', 'Tous'], ...cats.map((c) => [c, c])]
        .map(([v, label]) => `<button class="chip" type="button" data-filter="${esc(v)}" aria-pressed="${v === 'all'}">${esc(label)}<sup>${count(v)}</sup></button>`)
        .join('');
      filtersEl.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip || chip.dataset.filter === state.cat) return;
        state.cat = chip.dataset.filter;
        state.limit = PAGE;
        $$('.chip', filtersEl).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        renderGrid();
      });
      if (cats.length < 2) filtersEl.hidden = true;
    }
    if (searchEl) {
      let t;
      searchEl.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => { state.q = searchEl.value; state.limit = PAGE; renderGrid(); }, 140);
      });
      searchEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
    }
    if (moreBtn) moreBtn.addEventListener('click', () => { state.limit += PAGE; renderGrid(true); });
    renderGrid();
  }

  /* ---------- Showroom: rotating 3D ring of featured perfumes ---------- */
  function initShowroom() {
    const stage = $('[data-ring]');
    const ring = $('#ring');
    if (!stage || !ring || !PRODUCTS.length) { if (stage) stage.closest('.showroom').hidden = true; return; }
    let items = PRODUCTS.filter((p) => p.vedette).slice(0, 14);
    if (items.length < 6) items = PRODUCTS.slice(0, 12);
    const n = items.length;
    const step = 360 / n;
    ring.innerHTML = items.map((p, i) => `
      <button class="ring__card" type="button" data-open-product="${esc(p.id)}" style="--i:${i}" aria-label="Découvrir ${esc(fullName(p))}">
        <span class="ring__media">${mediaHTML(p, false)}</span>
        <span class="ring__cap"><b>${esc(p.brand)}</b><span>${esc(p.name)}</span></span>
      </button>`).join('');
    const cards = $$('.ring__card', ring);

    let radius = 0;
    function layout() {
      const w = cards[0].offsetWidth || 160;
      radius = Math.round((w / 2) / Math.tan(Math.PI / n) * 1.22);
      cards.forEach((c, i) => { c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`; });
    }

    let rot = 0;
    let vel = 0;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let hover = false;
    let visible = false;
    let running = false;
    let last = 0;
    const auto = reduceMotion ? 0 : -9; // degrees per second

    function paint() {
      ring.style.transform = `translateZ(${-radius}px) rotateX(-6deg) rotateY(${rot}deg)`;
      cards.forEach((c, i) => {
        let a = ((i * step + rot) % 360 + 540) % 360 - 180; // -180..180, 0 = facing us
        const f = Math.cos((a * Math.PI) / 180);
        c.style.setProperty('--f', Math.max(0, f).toFixed(3));
        c.style.zIndex = String(Math.round((f + 1) * 50));
        c.tabIndex = f > 0.2 ? 0 : -1;
      });
    }
    function frame(now) {
      if (!visible) { running = false; return; }
      running = true;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!dragging) {
        vel *= Math.pow(0.05, dt);
        rot += (vel + (hover ? 0 : auto)) * dt;
      }
      paint();
      requestAnimationFrame(frame);
    }
    const kick = () => { if (!running && visible) { last = performance.now(); requestAnimationFrame(frame); } };

    let pressed = false;
    stage.addEventListener('pointerdown', (e) => {
      pressed = true; moved = 0; lastX = e.clientX;
    });
    stage.addEventListener('pointermove', (e) => {
      if (!pressed) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      moved += Math.abs(dx);
      // only capture the pointer once it is a real drag, so a simple tap still opens the perfume
      if (!dragging && moved > 6) {
        dragging = true; vel = 0;
        try { stage.setPointerCapture(e.pointerId); } catch (err) { /* pointer already released */ }
      }
      if (!dragging) return;
      const d = dx * 0.35;
      rot += d; vel = d * 60;
      if (reduceMotion) paint();
    });
    const release = () => { pressed = false; dragging = false; };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    // a drag must not open the perfume under the pointer
    stage.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } moved = 0; }, true);
    stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
    stage.addEventListener('pointerleave', () => { hover = false; });
    // keyboard: focusing a card turns it to the front
    cards.forEach((c, i) => c.addEventListener('focus', () => { rot = -i * step; vel = 0; paint(); }));

    layout();
    paint();
    window.addEventListener('resize', () => { layout(); paint(); }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; kick(); }).observe(stage);
    } else { visible = true; kick(); }
  }

  /* ---------- Product modal (cinematic opening) ---------- */
  const modal = $('#product-modal');
  const panel = modal && $('.pmodal__panel', modal);
  const pmMedia = $('#pm-media');
  const pmContent = modal && $('.pmodal__content', modal);
  const pmWa = $('#pm-wa');
  const pmAdd = $('#pm-add');
  let modalOpen = false;
  let currentId = null;
  let navIds = [];
  let originEl = null;
  let lastFocus = null;
  let hideTimer;
  let modalLocked = false;

  const isDesktopModal = () => window.matchMedia('(min-width: 900px)').matches;
  const mediaOf = (el) => el && $('.media', el);

  function fly(sourceEl, from, to, r0, r1, duration) {
    return new Promise((resolve) => {
      const g = document.createElement('div');
      g.className = 'ghost';
      const clone = sourceEl.cloneNode(true);
      clone.removeAttribute('loading');
      g.appendChild(clone);
      Object.assign(g.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: r0 });
      body.appendChild(g);
      if (!g.animate) { g.remove(); resolve(null); return; }
      const anim = g.animate([
        { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: r0 },
        { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: r1 },
      ], { duration, easing: 'cubic-bezier(.7, 0, .2, 1)', fill: 'forwards' });
      anim.onfinish = () => resolve(g);
      anim.oncancel = () => { g.remove(); resolve(null); };
    });
  }

  function fillModal(p) {
    pmMedia.innerHTML = mediaHTML(p, false);
    $('#pm-brand').textContent = p.brand;
    $('#pm-cat').textContent = p.category;
    $('#pm-title').textContent = p.name;
    const st = $('#pm-status');
    st.textContent = p.available ? 'À commander' : 'Sur demande';
    st.className = `pm-status ${p.available ? 'is-available' : 'is-request'}`;
    $('#pm-desc').textContent = p.description;
    $('#pm-notes').innerHTML = p.notes.map((n) => `<li>${esc(n)}</li>`).join('');
    $('.pm-notes', modal).hidden = !p.notes.length;
    const msg = `Bonjour NOSY HYPE, je souhaite commander le parfum « ${fullName(p)} ». Pouvez-vous me donner le prix et la disponibilité ?`;
    pmWa.href = waLink(msg);
    $('span', pmWa).textContent = p.available ? 'Commander sur WhatsApp' : 'Demander sur WhatsApp';
    pmAdd.hidden = !p.available;
    const idx = navIds.indexOf(p.id);
    $('#pm-index').textContent = `${String(idx + 1).padStart(2, '0')} / ${String(navIds.length).padStart(2, '0')}`;
    $('.pmodal__nav', modal).hidden = navIds.length < 2;
  }

  function setUrl(id) {
    try {
      const u = new URL(window.location.href);
      if (id) u.searchParams.set('parfum', id); else u.searchParams.delete('parfum');
      window.history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) { /* file:// or sandboxed */ }
  }

  function openProduct(id, trigger) {
    const p = byId(id);
    if (!p || !modal || modalOpen) return;
    clearTimeout(hideTimer);
    modalOpen = true;
    currentId = id;
    lastFocus = trigger || document.activeElement;
    const ids = matches().map((x) => x.id);
    navIds = ids.includes(id) ? ids : PRODUCTS.map((x) => x.id);
    fillModal(p);

    originEl = trigger ? trigger.closest('.card, .ring__card') : null;
    const originMedia = mediaOf(originEl);
    const cinematic = !reduceMotion && originMedia && inView(originMedia);

    modal.hidden = false;
    panel.scrollTop = 0;
    const scroller = $('.pmodal__body', modal);
    if (scroller) scroller.scrollTop = 0;
    if (!modalLocked) { lock(); modalLocked = true; }
    setUrl(id);
    if (cinematic) pmMedia.style.opacity = '0';
    void modal.offsetWidth; // commit the initial state before animating
    modal.classList.add('is-open');

    if (cinematic) {
      const from = originMedia.getBoundingClientRect();
      const to = pmMedia.getBoundingClientRect();
      const r0 = originEl.classList.contains('ring__card') ? '16px' : '22px 22px 0 0';
      originEl.classList.add('is-opening');
      fly(originMedia, from, to, r0, '20px', 900).then((g) => {
        pmMedia.style.opacity = '';
        if (originEl) originEl.classList.remove('is-opening');
        if (g) requestAnimationFrame(() => requestAnimationFrame(() => g.remove()));
      });
    }
    setTimeout(() => { const c = $('.pmodal__close', modal); if (c && modalOpen) c.focus({ preventScroll: true }); }, 80);
  }

  function closeProduct(after) {
    if (!modalOpen) return;
    modalOpen = false;
    const gridItem = grid && $(`.grid__item[data-id="${CSS.escape(currentId)}"]`, grid);
    const candidates = [gridItem && $('.card', gridItem)];
    if (originEl && originEl.classList.contains('ring__card') && originEl.dataset.openProduct === currentId) candidates.unshift(originEl);
    const target = candidates.find((c) => c && inView(mediaOf(c)));
    const targetMedia = mediaOf(target);
    const fromMedia = mediaOf(pmMedia);

    if (!reduceMotion && targetMedia && fromMedia) {
      const from = fromMedia.getBoundingClientRect();
      const to = targetMedia.getBoundingClientRect();
      const r1 = target.classList.contains('ring__card') ? '16px' : '22px 22px 0 0';
      target.classList.add('is-opening');
      fly(fromMedia, from, to, '20px', r1, 750).then((g) => {
        target.classList.remove('is-opening');
        if (g) requestAnimationFrame(() => g.remove());
      });
      pmMedia.style.opacity = '0';
    }
    modal.classList.remove('is-open');
    setUrl(null);
    hideTimer = setTimeout(() => {
      modal.hidden = true;
      pmMedia.style.opacity = '';
      if (modalLocked) { unlock(); modalLocked = false; }
      if (typeof after === 'function') after();
    }, reduceMotion ? 0 : 620);
    const back = lastFocus && document.contains(lastFocus) ? lastFocus : null;
    if (back) back.focus({ preventScroll: true });
  }

  function stepProduct(dir) {
    if (!modalOpen || navIds.length < 2) return;
    const i = navIds.indexOf(currentId);
    const next = navIds[(i + dir + navIds.length) % navIds.length];
    pmContent.classList.add('is-swapping');
    pmMedia.style.opacity = '0';
    setTimeout(() => {
      currentId = next;
      fillModal(byId(next));
      setUrl(next);
      const scroller = isDesktopModal() ? $('.pmodal__body', modal) : panel;
      if (scroller) scroller.scrollTop = 0;
      const show = () => { pmMedia.style.opacity = ''; pmContent.classList.remove('is-swapping'); };
      const img = $('img', pmMedia);
      if (!img || img.complete) show(); else { img.addEventListener('load', show, { once: true }); img.addEventListener('error', show, { once: true }); }
    }, reduceMotion ? 0 : 260);
  }

  function initModal() {
    if (!modal) return;
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-open-product]');
      if (t) { e.preventDefault(); openProduct(t.dataset.openProduct, t); }
    });
    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) { closeProduct(); return; }
      const stepBtn = e.target.closest('[data-step]');
      if (stepBtn) { stepProduct(parseInt(stepBtn.dataset.step, 10)); return; }
      const to = e.target.closest('[data-close-to]');
      if (to) {
        e.preventDefault();
        const hash = to.getAttribute('href');
        closeProduct(() => { const el = $(hash); if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); });
      }
    });
    pmAdd.addEventListener('click', () => {
      addToBag(currentId);
      toast(`« ${byId(currentId).name} » ajouté à votre sélection`);
    });
    // swipe between perfumes on touch screens
    let sx = 0; let sy = 0;
    const media = $('.pmodal__media', modal);
    media.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    media.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) stepProduct(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ---------- Selection (order bag) — prices are given on WhatsApp ---------- */
  const BAG_KEY = 'nosyhype-selection-v2';
  const drawer = $('#bag');
  let bag = [];
  let drawerOpen = false;
  let drawerTimer;
  let drawerFocus = null;

  function loadBag() {
    try {
      const raw = JSON.parse(store.get(BAG_KEY) || '[]');
      bag = Array.isArray(raw) ? raw.filter((x) => x && byId(x.id) && byId(x.id).available).map((x) => ({ id: x.id, qty: Math.max(1, Math.min(20, parseInt(x.qty, 10) || 1)) })) : [];
    } catch (e) { bag = []; }
  }
  const saveBag = () => store.set(BAG_KEY, JSON.stringify(bag));

  function addToBag(id) {
    const it = bag.find((x) => x.id === id);
    if (it) it.qty = Math.min(20, it.qty + 1); else bag.push({ id, qty: 1 });
    saveBag();
    renderBag(true);
  }
  function changeQty(id, delta) {
    const it = bag.find((x) => x.id === id);
    if (!it) return;
    it.qty += delta;
    if (it.qty < 1) bag = bag.filter((x) => x.id !== id);
    else it.qty = Math.min(20, it.qty);
    saveBag();
    renderBag(false);
  }

  function bagMessage() {
    const lines = bag.map((x) => `• ${fullName(byId(x.id))} × ${x.qty}`);
    return ['Bonjour NOSY HYPE, je souhaite commander :', ...lines, '', 'Pouvez-vous me confirmer la disponibilité, le prix total et les frais de livraison ? Ma ville : '].join('\n');
  }

  function renderBag(bump) {
    const count = bag.reduce((s, x) => s + x.qty, 0);
    $$('[data-bag-count]').forEach((el) => {
      el.textContent = count;
      el.classList.toggle('has-items', count > 0);
      if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
    $$('[data-bag-open]').forEach((b) => b.setAttribute('aria-label', `Ma sélection : ${count} article${count > 1 ? 's' : ''}`));
    const list = $('#bag-list');
    if (!list) return;
    list.innerHTML = bag.map((x) => {
      const p = byId(x.id);
      return `<li>
        <span class="bag-thumb">${mediaHTML(p)}</span>
        <div>
          <p class="bag-brand">${esc(p.brand)}</p>
          <h3>${esc(p.name)}</h3>
          <div class="qty" role="group" aria-label="Quantité pour ${esc(p.name)}">
            <button type="button" data-qty="-1" data-id="${esc(p.id)}" aria-label="Retirer un ${esc(p.name)}"><svg class="i"><use href="#i-minus"/></svg></button>
            <span aria-live="polite">${x.qty}</span>
            <button type="button" data-qty="1" data-id="${esc(p.id)}" aria-label="Ajouter un ${esc(p.name)}"><svg class="i"><use href="#i-plus"/></svg></button>
          </div>
        </div>
        <button type="button" class="bag-remove" data-remove="${esc(p.id)}">Retirer</button>
      </li>`;
    }).join('');
    $('#bag-empty').hidden = bag.length > 0;
    $('#bag-foot').hidden = bag.length === 0;
    $('#bag-send').href = waLink(bagMessage());
  }

  function openDrawer() {
    if (drawerOpen || !drawer) return;
    if (menuOpen) closeMenu();
    drawerOpen = true;
    clearTimeout(drawerTimer);
    drawerFocus = document.activeElement;
    drawer.hidden = false;
    lock();
    void drawer.offsetWidth;
    drawer.classList.add('is-open');
    setTimeout(() => { const c = $('.drawer__head .icon-btn', drawer); if (c) c.focus({ preventScroll: true }); }, 60);
  }
  function closeDrawer() {
    if (!drawerOpen) return;
    drawerOpen = false;
    drawer.classList.remove('is-open');
    unlock();
    drawerTimer = setTimeout(() => { if (!drawerOpen) drawer.hidden = true; }, reduceMotion ? 0 : 700);
    if (drawerFocus && document.contains(drawerFocus)) drawerFocus.focus({ preventScroll: true });
  }
  function initBag() {
    loadBag();
    renderBag(false);
    $$('[data-bag-open]').forEach((b) => b.addEventListener('click', openDrawer));
    if (!drawer) return;
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('[data-bag-close]')) { closeDrawer(); return; }
      const q = e.target.closest('[data-qty]');
      if (q) { changeQty(q.dataset.id, parseInt(q.dataset.qty, 10)); return; }
      const r = e.target.closest('[data-remove]');
      if (r) { bag = bag.filter((x) => x.id !== r.dataset.remove); saveBag(); renderBag(false); }
    });
  }

  /* ---------- Reviews ---------- */
  function initReviews() {
    const track = $('#reviews-track');
    if (!track) return;
    const reviews = (Array.isArray(window.NOSY_REVIEWS) ? window.NOSY_REVIEWS : []).filter((r) => r && r.text);
    const section = track.closest('section');
    if (!reviews.length) {
      track.innerHTML = '<li class="review review--empty"><p>Soyez le premier à partager votre expérience NOSY HYPE.</p></li>';
    } else {
      track.innerHTML = reviews.map((r) => {
        const n = Math.max(0, Math.min(5, Math.round(Number(r.rating) || 5)));
        const stars = Array.from({ length: 5 }, (_, i) => `<svg class="i${i < n ? ' is-on' : ''}"><use href="#i-star"/></svg>`).join('');
        return `<li class="review">
          <div class="review__top">
            <span class="review__stars" role="img" aria-label="${n} sur 5">${stars}</span>
            ${r.exemple ? '<span class="review__flag">Exemple</span>' : ''}
          </div>
          <blockquote class="review__text">${esc(r.text)}</blockquote>
          <footer class="review__who">
            <span class="review__avatar" aria-hidden="true">${esc(String(r.name || '?').trim()[0] || '?')}</span>
            <span><strong>${esc(r.name || 'Client')}</strong>${r.city ? `<span>${esc(r.city)}</span>` : ''}</span>
            ${r.perfume ? `<span class="review__perfume">${esc(r.perfume)}</span>` : ''}
          </footer>
        </li>`;
      }).join('');
    }
    const notice = $('#reviews-notice');
    if (notice) notice.hidden = !reviews.some((r) => r.exemple);
    $$('[data-rev]', section).forEach((b) => b.addEventListener('click', () => {
      const card = $('.review', track);
      const w = card ? card.getBoundingClientRect().width + 16 : 320;
      track.scrollBy({ left: w * parseInt(b.dataset.rev, 10), behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
  }

  /* ---------- Private request: typing "search" radar ---------- */
  function initRadar() {
    const el = $('[data-typed]');
    if (!el || reduceMotion || !PRODUCTS.length) return;
    const names = PRODUCTS.filter((p) => p.vedette).concat(PRODUCTS.slice(12, 20)).map((p) => p.name).slice(0, 14);
    let k = 0; let i = 0; let deleting = false; let visible = false; let timer = null;
    const tick = () => {
      if (!visible) { timer = null; return; }
      const word = names[k % names.length];
      if (!deleting) {
        i++;
        el.textContent = word.slice(0, i);
        if (i >= word.length) { deleting = true; timer = setTimeout(tick, 1600); return; }
        timer = setTimeout(tick, 70 + Math.random() * 60);
      } else {
        i--;
        el.textContent = word.slice(0, i);
        if (i <= 0) { deleting = false; k++; timer = setTimeout(tick, 350); return; }
        timer = setTimeout(tick, 30);
      }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible && !timer) tick(); }).observe(el.closest('.radar'));
    }
  }

  /* ---------- Payment helpers: copy MVOLA number, deposit calculator ---------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  }
  function initPayment() {
    $$('[data-copy="mvola"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const ok = await copyText(String(CFG.mvolaNumber).replace(/\s/g, ''));
        toast(ok ? `Numéro MVOLA copié : ${CFG.mvolaNumber}` : `Numéro MVOLA : ${CFG.mvolaNumber}`);
        const label = $('span', btn);
        btn.classList.add('is-copied');
        if (label) {
          const prev = label.dataset.label || label.textContent;
          label.dataset.label = prev;
          label.textContent = ok ? 'Copié' : prev;
          setTimeout(() => { label.textContent = prev; btn.classList.remove('is-copied'); }, 2200);
        } else {
          setTimeout(() => btn.classList.remove('is-copied'), 2200);
        }
      });
    });

    const form = $('#calc');
    const input = $('#calc-input');
    if (!form || !input) return;
    const dep = $('[data-calc="deposit"]', form);
    const bal = $('[data-calc="balance"]', form);
    form.addEventListener('submit', (e) => e.preventDefault());
    input.addEventListener('input', () => {
      const n = parseAmount(input.value);
      input.value = n ? nf.format(n).replace(/\s/g, ' ') : '';
      dep.textContent = n ? money(depositOf(n)) : '—';
      bal.textContent = n ? money(n - depositOf(n)) : '—';
    });
    bindTilt($('[data-tilt]'), 6);
  }

  /* ---------- Contact form → WhatsApp ---------- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const name = $('#cf-name');
    const city = $('#cf-city');
    const perfume = $('#cf-perfume');
    const msg = $('#cf-msg');
    const err = $('#cf-error');
    [name, msg].forEach((f) => f.addEventListener('input', () => f.parentElement.classList.remove('is-invalid')));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const missing = [name, msg].filter((f) => !f.value.trim());
      missing.forEach((f) => f.parentElement.classList.add('is-invalid'));
      err.hidden = missing.length === 0;
      if (missing.length) { missing[0].focus(); return; }
      const text = [
        `Bonjour NOSY HYPE, je m'appelle ${name.value.trim()}.`,
        city && city.value.trim() ? `Ville : ${city.value.trim()}` : '',
        perfume.value.trim() ? `Parfum souhaité : ${perfume.value.trim()}` : '',
        msg.value.trim(),
      ].filter(Boolean).join('\n');
      const link = waLink(text);
      const fallback = $('#cf-fallback');
      const w = window.open(link, '_blank');
      if (w) {
        w.opener = null;
      } else if (fallback) {
        // pop-up blocked: offer a real link instead
        fallback.href = link;
        fallback.hidden = false;
        fallback.focus();
      } else {
        window.location.href = link;
      }
    });
  }

  /* ---------- Cursor glow (desktop) ---------- */
  function initCursorGlow() {
    const glow = $('.cursor-glow');
    if (!glow || !finePointer || reduceMotion) return;
    let tx = 0; let ty = 0; let x = 0; let y = 0; let raf = null;
    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4 ? requestAnimationFrame(loop) : null;
    };
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!glow.classList.contains('is-on')) { x = tx; y = ty; glow.classList.add('is-on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    root.addEventListener('mouseleave', () => glow.classList.remove('is-on'));
  }

  /* ---------- Keyboard: Escape, arrows, focus trap ---------- */
  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (modalOpen) {
        if (e.key === 'Escape') { closeProduct(); return; }
        const typing = /INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName);
        if (!typing && e.key === 'ArrowRight') { stepProduct(1); return; }
        if (!typing && e.key === 'ArrowLeft') { stepProduct(-1); return; }
        trapTab(e, [modal]);
        return;
      }
      if (drawerOpen) {
        if (e.key === 'Escape') { closeDrawer(); return; }
        trapTab(e, [$('.drawer__panel', drawer)]);
        return;
      }
      if (menuOpen) {
        if (e.key === 'Escape') { closeMenu(); burger.focus(); return; }
        trapTab(e, [header, mmenu]);
      }
    });
  }

  /* ---------- WhatsApp button: gentle first-visit hint ---------- */
  function peekWhatsApp() {
    const b = $('.wa-float');
    if (!b || reduceMotion || session.get('nh-peek') === '1') return;
    session.set('nh-peek', '1');
    setTimeout(() => {
      b.classList.add('is-peek');
      setTimeout(() => b.classList.remove('is-peek'), 4200);
    }, 3200);
  }

  /* ---------- Boot ---------- */
  initPhotos();
  bindConfig();
  $$('[data-split]').forEach(splitWords);
  initReveal();
  initCatalogue();
  initShowroom();
  initReviews();
  initRadar();
  initMenu();
  initModal();
  initBag();
  initPayment();
  initContactForm();
  initCursorGlow();
  initKeyboard();
  initScrollSpy();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { onScroll(); moveIndicator(); }, { passive: true });
  if (document.fonts) document.fonts.ready.then(moveIndicator);
  updateScroll();

  runLoader(() => {
    body.classList.add('is-ready');
    moveIndicator();
    peekWhatsApp();
    let deep = null;
    try { deep = new URL(window.location.href).searchParams.get('parfum'); } catch (e) { deep = null; }
    if (deep && byId(deep)) setTimeout(() => openProduct(deep, null), reduceMotion ? 0 : 700);
  });
})();
