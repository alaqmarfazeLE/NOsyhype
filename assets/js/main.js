/* =========================================================
   NOSY HYPE — interactions
   (no dependencies — the catalogue lives in products.js,
   shop settings in config.js)
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Settings & helpers ---------- */
  const CFG = Object.assign({
    whatsappNumber: '261380582719',
    whatsappDisplay: '+261 38 05 827 19',
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
  const parsePrice = (str) => { const d = String(str || '').replace(/\D/g, '').slice(0, 12); return d ? parseInt(d, 10) : 0; };
  const depositOf = (n) => Math.ceil((n * CFG.depositPercent) / 100);
  const slugify = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const waLink = (text) => `https://wa.me/${String(CFG.whatsappNumber).replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  const session = {
    get(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  const inView = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  };

  /* ---------- Catalogue ---------- */
  const seen = new Set();
  const PRODUCTS = (Array.isArray(window.NOSY_PRODUCTS) ? window.NOSY_PRODUCTS : []).map((p, i) => {
    let id = slugify(p.name) || `parfum-${i + 1}`;
    while (seen.has(id)) id += `-${i + 1}`;
    seen.add(id);
    return {
      name: p.name || 'Parfum',
      price: p.price || '',
      category: p.category || 'Parfum',
      description: p.description || '',
      notes: Array.isArray(p.notes) ? p.notes : [],
      image: p.image || '',
      available: p.available !== false,
      id,
      amount: parsePrice(p.price),
    };
  });
  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  /* ---------- Shop settings → page ---------- */
  function bindConfig() {
    $$('[data-config]').forEach((el) => { const v = CFG[el.dataset.config]; if (v) el.textContent = v; });
    $$('[data-wa]').forEach((el) => { el.href = waLink(el.dataset.wa); });
    $$('[data-mail]').forEach((el) => { el.href = `mailto:${CFG.email}`; });
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
    const heroImg = $('.hero__media img');
    const imgReady = new Promise((res) => {
      if (!heroImg || heroImg.complete) { res(); return; }
      heroImg.addEventListener('load', res, { once: true });
      heroImg.addEventListener('error', res, { once: true });
    }).then(() => setP(0.8));
    const fontsReady = (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setP(0.5));
    const creep = setInterval(() => setP(Math.min(p + 0.035, 0.92)), 160);
    const cap = new Promise((res) => setTimeout(res, 5000));
    Promise.race([Promise.all([imgReady, fontsReady]), cap]).then(() => {
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
      const limit = el.classList.contains('hero__media') ? Infinity : box.height * 0.07;
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
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

  /* ---------- Collection: filters + cards ---------- */
  const grid = $('#product-grid');
  const filtersEl = $('#filters');
  const countEl = $('#product-count');
  let activeFilter = 'all';

  function cardHTML(p, i) {
    return `
      <div class="grid__item reveal" data-id="${esc(p.id)}" data-category="${esc(p.category)}" style="--d:${((i % 3) * 0.09).toFixed(2)}s">
        <article class="card">
          <div class="card__media">
            <img src="${esc(p.image)}" alt="Flacon du parfum ${esc(p.name)}" width="1200" height="1500" loading="lazy" decoding="async">
            ${p.available ? '' : '<span class="card__badge">Sur demande</span>'}
            <span class="card__sheen" aria-hidden="true"></span>
          </div>
          <div class="card__body">
            <p class="card__cat">${esc(p.category)}</p>
            <h3 class="card__name">${esc(p.name)}</h3>
            <p class="card__notes">${p.notes.map(esc).join(' · ')}</p>
            <div class="card__foot">
              <span class="card__price">${esc(p.price)}</span>
              <span class="card__cta" aria-hidden="true"><span class="card__cta-txt">Découvrir</span><svg class="i"><use href="#i-arrow"/></svg></span>
            </div>
          </div>
          <button class="card__hit" type="button" data-open-product="${esc(p.id)}"
            aria-label="Découvrir ${esc(p.name)} — ${esc(p.category)}, ${esc(p.price)}${p.available ? '' : ', sur demande'}"></button>
        </article>
      </div>`;
  }

  function updateCount() {
    if (!countEl) return;
    const n = $$('.grid__item:not(.is-hidden)', grid).length;
    countEl.textContent = `${n} parfum${n > 1 ? 's' : ''}`;
  }

  function applyFilter(cat) {
    activeFilter = cat;
    $$('.chip', filtersEl).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === cat)));
    const items = $$('.grid__item', grid);
    const matches = (it) => cat === 'all' || it.dataset.category === cat;
    if (reduceMotion) {
      items.forEach((it) => it.classList.toggle('is-hidden', !matches(it)));
      updateCount();
      return;
    }
    items.forEach((it) => it.classList.add('is-filtering'));
    setTimeout(() => {
      let k = 0;
      items.forEach((it) => {
        const show = matches(it);
        it.classList.toggle('is-hidden', !show);
        it.classList.add('is-in');
        if (show) it.style.setProperty('--d', `${(k++ * 0.06).toFixed(2)}s`);
      });
      updateCount();
      requestAnimationFrame(() => requestAnimationFrame(() => items.forEach((it) => it.classList.remove('is-filtering'))));
    }, 300);
  }

  function renderCatalogue() {
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(cardHTML).join('');
    const cats = [...new Set(PRODUCTS.map((p) => p.category))];
    if (filtersEl) {
      const count = (c) => PRODUCTS.filter((p) => c === 'all' || p.category === c).length;
      filtersEl.innerHTML = [['all', 'Tous'], ...cats.map((c) => [c, c])]
        .map(([v, label]) => `<button class="chip" type="button" data-filter="${esc(v)}" aria-pressed="${v === 'all'}">${esc(label)}<sup>${count(v)}</sup></button>`)
        .join('');
      filtersEl.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (chip && chip.dataset.filter !== activeFilter) applyFilter(chip.dataset.filter);
      });
      if (cats.length < 2) filtersEl.parentElement.hidden = true;
    }
    updateCount();
    $$('.card', grid).forEach((c) => bindTilt(c, 4));
    observeReveal($$('.grid__item', grid));

    // hero "signature" card follows the first product of the catalogue
    const feat = $('.hero__feature');
    const first = PRODUCTS[0];
    if (feat) {
      if (!first) { feat.hidden = true; } else {
        feat.dataset.openProduct = first.id;
        feat.setAttribute('aria-label', `Découvrir le parfum signature ${first.name}`);
        const img = $('img', feat);
        if (img) img.src = first.image;
        const nm = $('.hero__feature-name', feat);
        if (nm) nm.textContent = first.name;
      }
    }
  }

  /* ---------- Product modal (cinematic opening) ---------- */
  const modal = $('#product-modal');
  const panel = modal && $('.pmodal__panel', modal);
  const pmImg = $('#pm-img');
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

  function fly(src, from, to, r0, r1, duration) {
    return new Promise((resolve) => {
      const g = document.createElement('div');
      g.className = 'ghost';
      const im = new Image();
      im.alt = '';
      im.src = src;
      g.appendChild(im);
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
    pmImg.src = p.image;
    pmImg.alt = `Flacon du parfum ${p.name}`;
    $('#pm-cat').textContent = p.category;
    $('#pm-title').textContent = p.name;
    $('#pm-price').textContent = p.price;
    const st = $('#pm-status');
    st.textContent = p.available ? 'Disponible' : 'Sur demande';
    st.className = `pm-status ${p.available ? 'is-available' : 'is-request'}`;
    $('#pm-desc').textContent = p.description;
    $('#pm-notes').innerHTML = p.notes.map((n) => `<li>${esc(n)}</li>`).join('');
    $('.pm-notes', modal).hidden = !p.notes.length;
    const dep = $('#pm-deposit');
    if (p.amount) {
      dep.hidden = false;
      $('#pm-deposit-amount').textContent = money(depositOf(p.amount));
    } else {
      dep.hidden = true;
    }
    const msg = p.available
      ? `Bonjour NOSY HYPE, je souhaite commander le parfum « ${p.name} » (${p.price}). Est-il disponible ?`
      : `Bonjour NOSY HYPE, je souhaite commander le parfum « ${p.name} » (sur demande). Pouvez-vous me le procurer ?`;
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
    const visible = $$('.grid__item:not(.is-hidden)', grid).map((it) => it.dataset.id);
    navIds = visible.includes(id) ? visible : PRODUCTS.map((x) => x.id);
    fillModal(p);

    originEl = trigger ? trigger.closest('.card, .hero__feature') : null;
    const originImg = originEl && $('img', originEl);
    const cinematic = !reduceMotion && originImg && inView(originImg);

    modal.hidden = false;
    panel.scrollTop = 0;
    const scroller = $('.pmodal__body', modal);
    if (scroller) scroller.scrollTop = 0;
    if (!modalLocked) { lock(); modalLocked = true; }
    setUrl(id);
    if (cinematic) pmImg.style.opacity = '0';
    void modal.offsetWidth; // commit the initial state before animating
    modal.classList.add('is-open');

    if (cinematic) {
      const from = originImg.getBoundingClientRect();
      const to = pmImg.getBoundingClientRect();
      const r0 = originEl.classList.contains('hero__feature') ? '14px' : '22px 22px 0 0';
      const r1 = isDesktopModal() ? '32px 0 0 32px' : '0px';
      originEl.classList.add('is-opening');
      const src = originImg.currentSrc || originImg.src;
      fly(src, from, to, r0, r1, 900).then((g) => {
        pmImg.style.opacity = '';
        if (originEl) originEl.classList.remove('is-opening');
        if (g) requestAnimationFrame(() => requestAnimationFrame(() => g.remove()));
      });
    }
    setTimeout(() => { const c = $('.pmodal__close', modal); if (c && modalOpen) c.focus({ preventScroll: true }); }, 80);
  }

  function closeProduct(after) {
    if (!modalOpen) return;
    modalOpen = false;
    const gridItem = $(`.grid__item[data-id="${CSS.escape(currentId)}"]:not(.is-hidden)`, grid);
    const candidates = [gridItem && $('.card', gridItem)];
    if (originEl && originEl.classList.contains('hero__feature') && originEl.dataset.openProduct === currentId) candidates.unshift(originEl);
    const target = candidates.find((c) => c && inView($('img', c)));
    const targetImg = target && $('img', target);

    if (!reduceMotion && targetImg && pmImg.complete) {
      const from = pmImg.getBoundingClientRect();
      const to = targetImg.getBoundingClientRect();
      const r0 = isDesktopModal() ? '32px 0 0 32px' : '0px';
      const r1 = target.classList.contains('hero__feature') ? '14px' : '22px 22px 0 0';
      target.classList.add('is-opening');
      const src = pmImg.currentSrc || pmImg.src;
      pmImg.style.opacity = '0';
      fly(src, from, to, r0, r1, 750).then((g) => {
        target.classList.remove('is-opening');
        if (g) requestAnimationFrame(() => g.remove());
      });
    }
    modal.classList.remove('is-open');
    setUrl(null);
    hideTimer = setTimeout(() => {
      modal.hidden = true;
      pmImg.style.opacity = '';
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
    pmImg.style.opacity = '0';
    setTimeout(() => {
      currentId = next;
      fillModal(byId(next));
      setUrl(next);
      const scroller = isDesktopModal() ? $('.pmodal__body', modal) : panel;
      if (scroller) scroller.scrollTop = 0;
      const show = () => { pmImg.style.opacity = ''; pmContent.classList.remove('is-swapping'); };
      if (pmImg.complete) show(); else { pmImg.addEventListener('load', show, { once: true }); pmImg.addEventListener('error', show, { once: true }); }
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
      const p = byId(currentId);
      toast(`« ${p.name} » ajouté à votre sélection`);
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

  /* ---------- Selection (order bag) ---------- */
  const BAG_KEY = 'nosyhype-selection';
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

  function bagMessage(total) {
    const lines = bag.map((x) => { const p = byId(x.id); return `• ${p.name} × ${x.qty} — ${p.amount ? money(p.amount * x.qty) : p.price}`; });
    const out = ['Bonjour NOSY HYPE, je souhaite commander :', ...lines];
    if (total) {
      out.push('', `Total : ${money(total)}`, `Acompte ${CFG.depositPercent} % (MVOLA) : ${money(depositOf(total))}`);
    }
    out.push('', 'Merci de me confirmer la disponibilité.');
    return out.join('\n');
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
        <img src="${esc(p.image)}" alt="" width="72" height="88" loading="lazy">
        <div>
          <h3>${esc(p.name)}</h3>
          <p class="bag-price">${esc(p.price)}</p>
          <div class="qty" role="group" aria-label="Quantité pour ${esc(p.name)}">
            <button type="button" data-qty="-1" data-id="${esc(p.id)}" aria-label="Retirer un ${esc(p.name)}"><svg class="i"><use href="#i-minus"/></svg></button>
            <span aria-live="polite">${x.qty}</span>
            <button type="button" data-qty="1" data-id="${esc(p.id)}" aria-label="Ajouter un ${esc(p.name)}"><svg class="i"><use href="#i-plus"/></svg></button>
          </div>
        </div>
        <button type="button" class="bag-remove" data-remove="${esc(p.id)}">Retirer</button>
      </li>`;
    }).join('');
    const total = bag.reduce((s, x) => s + (byId(x.id).amount || 0) * x.qty, 0);
    $('#bag-empty').hidden = bag.length > 0;
    $('#bag-foot').hidden = bag.length === 0;
    $('#bag-total').textContent = total ? money(total) : '—';
    $('#bag-deposit').textContent = total ? money(depositOf(total)) : '—';
    $('#bag-balance').textContent = total ? money(total - depositOf(total)) : '—';
    $('#bag-send').href = waLink(bagMessage(total));
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
      const n = parsePrice(input.value);
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
        perfume.value.trim() ? `Parfum souhaité : ${perfume.value.trim()}` : '',
        msg.value.trim(),
      ].filter(Boolean).join('\n');
      const link = waLink(text);
      const w = window.open(link, '_blank');
      if (w) w.opener = null; else window.location.href = link;
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
  bindConfig();
  $$('[data-split]').forEach(splitWords);
  initReveal();
  renderCatalogue();
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
