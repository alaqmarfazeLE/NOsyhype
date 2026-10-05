/* Nosy_Hype — accueil : l'anneau de vrais flacons qui tourne tout seul.
   Glisser au doigt ou à la souris pour le faire tourner ; le flacon de face a son lien « Demander le prix ».
   Flacons et réglages : js/parfums.js (RING, SITE.ringCount, SITE.ringSpeed). */
(function () {
  'use strict';

  const C = window.NosyHype;
  const hero = document.querySelector('[data-hero]');
  const stage = document.querySelector('[data-hero-stage]');
  const ringEl = document.querySelector('[data-ring]');
  if (!C || !hero || !stage || !ringEl) return;

  const $ = (sel) => document.querySelector(sel);
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ESC[ch]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad = (n) => String(n).padStart(2, '0');
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const SITE = Object.assign({ ringCount: 10, ringSpeed: 9 }, C.SITE || {});
  const wa = (p) => C.waLink(C.askText(p));
  // Lueur de la carte du flacon de face : une couleur par flacon, prise dans la palette du thème.
  const COLORS = ['#21D1CA', '#F77CB0', '#E2C08D', '#A181EF', '#67D283', '#F5AE4B', '#F77C56'];

  const byId = new Map();
  C.PERFUMES.forEach((p) => { if (!byId.has(p.id)) byId.set(p.id, p); });
  const items = (C.RING || []).filter((id) => byId.has(id)).slice(0, clamp(Math.round(SITE.ringCount), 6, 12)).map((id) => byId.get(id));
  if (!items.length) return;

  const front = {
    link: $('[data-ring-front]'), brand: $('[data-ring-brand]'), name: $('[data-ring-name]'),
    idx: $('[data-ring-idx]'), total: $('[data-ring-total]'), dots: $('[data-ring-dots]'),
  };
  const ring = { angle: 0, vel: 0, seek: null, drag: null, dragMoved: false, hover: false, lastInteract: -1e9, frontIdx: -1, visible: true, dirty: true, g: null };

  ringEl.insertAdjacentHTML('beforeend', items.map((p, i) => `<a class="ring__orb" href="${esc(wa(p))}" target="_blank" rel="noopener" draggable="false" aria-label="${esc(`Demander le prix : ${p.brand} ${p.name}`)}"><span class="ring__shadow" aria-hidden="true"></span><img src="${esc(C.BOTTLE(p.id))}" alt="${esc(`${p.brand} ${p.name}`)}" decoding="async" draggable="false"${i < 3 ? ' fetchpriority="high"' : ''}></a>`).join(''));
  const orbs = Array.from(ringEl.querySelectorAll('.ring__orb'));
  front.total.textContent = pad(items.length);
  front.dots.innerHTML = items.map((p, i) => `<button class="ring__dot" type="button" data-i="${i}" aria-label="${esc(`${p.brand} ${p.name}`)}" aria-pressed="false"></button>`).join('');
  const dots = Array.from(front.dots.children);
  hero.classList.add('is-ring');

  orbs.forEach((orb, i) => {
    const img = orb.querySelector('img');
    const ready = () => { orb.dataset.ready = '1'; };
    if (img.complete && img.naturalWidth) ready();
    img.addEventListener('load', ready);
    orb.addEventListener('click', (e) => {
      if (ring.dragMoved) { e.preventDefault(); return; }
      if (i !== ring.frontIdx) { e.preventDefault(); seekTo(i); }
    });
    orb.addEventListener('focus', () => { if (i !== ring.frontIdx) seekTo(i); });
    orb.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') ring.hover = true; });
    orb.addEventListener('pointerleave', () => { ring.hover = false; });
  });

  function setFront(i) {
    ring.frontIdx = i;
    const p = items[i];
    front.brand.textContent = C.SHORT[p.brand] || p.brand;
    front.name.textContent = p.name;
    front.link.href = wa(p);
    front.link.setAttribute('aria-label', `Demander le prix : ${p.brand} ${p.name}`);
    front.link.style.setProperty('--c', COLORS[i % COLORS.length]);
    ringEl.style.setProperty('--c', COLORS[i % COLORS.length]);
    front.idx.textContent = pad(i + 1);
    dots.forEach((d, k) => d.setAttribute('aria-pressed', String(k === i)));
  }

  // Géométrie : une ellipse posée au sol de la scène, au-dessus de la carte du flacon de face.
  function geo() {
    const W = stage.clientWidth || 1, H = stage.clientHeight || 1;
    const rx = Math.min(W * 0.36, 300);
    const bh = Math.min(H * 0.52, 320, W * 0.5);
    const ry = Math.max(16, rx * 0.17);
    const cx = W / 2;
    const cy = H - 96 - ry;
    const bw = bh * 0.74;
    const set = (k, v) => ringEl.style.setProperty(k, `${Math.round(v)}px`);
    set('--bw', bw); set('--bh', bh);
    set('--oL', cx - rx); set('--oT', cy - ry); set('--oW', 2 * rx); set('--oH', 2 * ry);
    set('--gX', cx); set('--gY', cy - bh * 0.45); set('--gD', bh * 1.5);
    return { cx, cy, rx, ry, bw, bh };
  }

  function tick(now, dt) {
    if (!ring.visible) return;
    if (ring.dirty || !ring.g) { ring.dirty = false; ring.g = geo(); }
    const g = ring.g, n = orbs.length, step = (Math.PI * 2) / n;
    if (ring.seek != null) {
      ring.angle += (ring.seek - ring.angle) * (1 - Math.exp(-dt * 6));
      if (Math.abs(ring.seek - ring.angle) < 0.0008) { ring.angle = ring.seek; ring.seek = null; }
    } else if (!ring.drag) {
      const idle = now - ring.lastInteract > 4000;
      const speed = (SITE.ringSpeed * Math.PI) / 180;
      ring.angle += ((!reduce && idle ? speed * (ring.hover ? 0.22 : 1) : 0) + ring.vel) * dt;
      ring.vel *= Math.exp(-dt * 2.4);
    }
    let best = -2, bi = 0;
    for (let i = 0; i < n; i++) {
      const el = orbs[i];
      const a = ring.angle + i * step, x = Math.sin(a), z = Math.cos(a), t = (z + 1) / 2;
      const s = 0.46 + 0.54 * t;
      const bob = reduce ? 0 : Math.sin(now * 0.0012 + i * 1.7) * 6 * s;
      const px = g.cx + g.rx * x - g.bw / 2, py = g.cy + g.ry * z - g.bh + bob;
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      el.style.zIndex = String(z >= 0 ? 101 + Math.round(z * 90) : 99 + Math.round(z * 90));
      el.style.opacity = el.dataset.ready === '1' ? (0.5 + 0.5 * t).toFixed(3) : '0';
      el.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
      if (z > best) { best = z; bi = i; }
    }
    if (bi !== ring.frontIdx) setFront(bi);
  }

  function seekTo(i) {
    const n = orbs.length, TAU = Math.PI * 2, base = -(((i % n) + n) % n) * (TAU / n);
    ring.seek = base + Math.round((ring.angle - base) / TAU) * TAU;
    ring.vel = 0;
    ring.lastInteract = performance.now();
  }

  ringEl.addEventListener('pointerdown', (e) => {
    if ((e.button && e.button > 0) || !ring.g) return;
    const x0 = e.clientX, a0 = ring.angle, rx = ring.g.rx || 300;
    const d = { moved: false, lx: x0, lt: performance.now(), v: 0 };
    ring.drag = d;
    ring.seek = null;
    ring.vel = 0;
    ring.lastInteract = performance.now();
    ringEl.classList.add('is-drag');
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
      ringEl.classList.remove('is-drag');
      if (d.moved) ring.vel = clamp(d.v, -3, 3);
      ring.dragMoved = d.moved;
      if (ring.drag === d) ring.drag = null;
      ring.lastInteract = performance.now();
      setTimeout(() => { ring.dragMoved = false; }, 60);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });

  $('[data-ring-prev]').addEventListener('click', () => seekTo(ring.frontIdx - 1));
  $('[data-ring-next]').addEventListener('click', () => seekTo(ring.frontIdx + 1));
  front.dots.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) seekTo(+b.dataset.i); });

  if ('IntersectionObserver' in window) new IntersectionObserver((en) => { ring.visible = en[en.length - 1].isIntersecting; }).observe(hero);
  if ('ResizeObserver' in window) new ResizeObserver(() => { ring.dirty = true; }).observe(stage);
  setFront(0);

  let last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (!document.hidden) tick(now, dt);
  }
  requestAnimationFrame(loop);
})();
