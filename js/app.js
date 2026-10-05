/* Nosy_Hype : interactions du site (en-tête, gammes, bandeaux, livraison, copie MVola).
   Aucune dépendance. Données : js/config.js (boutique) et js/univers.js (gammes).
   La boutique est gérée par js/boutique.js, l'anneau de flacons de l'accueil par js/anneau.js. */
(function () {
  'use strict';

  const SHOP = window.SHOP || {};
  const CAT = window.CATALOGUE || {};
  const EASE = 'cubic-bezier(.2,.7,.1,1)';
  const COLORS = ['#21D1CA', '#A181EF', '#F77CB0', '#F77C56', '#F5AE4B', '#67D283'];

  /* ---------- Outils ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const calm = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finePointer = () => !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  const wa = (text) => 'https://wa.me/' + SHOP.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');

  /* ---------- Micro-animations ---------- */
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest && e.target.closest('button, a[href]');
    if (b && b.animate && !calm()) b.animate([{ scale: '1' }, { scale: '.95' }, { scale: '1' }], { duration: 280, easing: EASE });
  });

  // Socles lumineux animés seulement quand ils sont visibles.
  let liveIo = null;
  if ('IntersectionObserver' in window) {
    liveIo = new IntersectionObserver((entries) => entries.forEach((en) => en.target.classList.toggle('is-live', en.isIntersecting)), { rootMargin: '60px 0px' });
  }
  function watchLive(root) {
    if (liveIo && !calm()) $$('.studio', root).forEach((el) => liveIo.observe(el));
  }

  // Lueur qui suit la souris (ordinateur).
  const glow = $('[data-cursor-glow]');
  if (glow && finePointer() && !calm()) {
    let gx = 0, gy = 0, raf = 0;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      gx = e.clientX; gy = e.clientY;
      glow.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)'; });
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('is-on'));
  }

  /* ---------- Bandeaux défilants ---------- */
  const villesTrack = $('[data-villes]');
  if (villesTrack) {
    villesTrack.innerHTML = (SHOP.villes || []).map((v, i) => '<span class="city">' + esc(v) + '<span class="dot" style="--c:' + COLORS[i % COLORS.length] + '"></span></span>').join('');
  }
  // Duplique le contenu pour une boucle sans couture, puis règle la durée pour garder une vitesse constante (px/s).
  function marquee(track) {
    const speed = +track.getAttribute('data-marquee') || 40;
    const base = Array.prototype.slice.call(track.children);
    const w = track.scrollWidth;
    if (!base.length || !w) return;
    const need = Math.max(window.innerWidth, (window.screen && window.screen.width) || 0, 1200);
    const copies = Math.max(1, Math.ceil(need / w));
    const frag = document.createDocumentFragment();
    for (let i = 1; i < copies * 2; i++) {
      base.forEach((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); frag.appendChild(c); });
    }
    track.appendChild(frag);
    track.style.setProperty('--dur', (copies * w / speed).toFixed(1) + 's');
    track.classList.add('is-running');
  }
  let marqueesOn = false;
  const startMarquees = () => { if (marqueesOn) return; marqueesOn = true; $$('[data-marquee]').forEach(marquee); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(startMarquees, startMarquees);
  else window.addEventListener('load', startMarquees);

  /* ---------- Heure d'Antananarivo, année ---------- */
  const clockEl = $('[data-clock]');
  function tickClock() {
    if (!clockEl) return;
    const o = { hour: '2-digit', minute: '2-digit' };
    let c;
    try { c = new Date().toLocaleTimeString('fr-FR', Object.assign({ timeZone: 'Indian/Antananarivo' }, o)); }
    catch (e) { c = new Date().toLocaleTimeString('fr-FR', o); }
    clockEl.textContent = c;
  }
  tickClock();
  setInterval(tickClock, 15000);
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Liens WhatsApp et email ---------- */
  const hello = 'Bonjour ' + SHOP.name + ' ! ';
  const WA_TEXT = {
    hello: () => hello,
    ask: () => hello + 'Je cherche un parfum précis : ',
    city: () => hello + 'Livrez-vous dans ma ville : … ? Quels sont les frais et le délai ?'
  };
  $$('[data-wa]').forEach((a) => {
    const f = WA_TEXT[a.getAttribute('data-wa')];
    if (f) a.href = wa(f());
  });
  $$('[data-mail]').forEach((a) => { a.href = 'mailto:' + SHOP.email; });
  if (SHOP.instagram) $$('[data-ig]').forEach((a) => { a.href = SHOP.instagram; });

  /* ---------- En-tête : menu mobile ---------- */
  const hdr = $('[data-hdr]');
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-toggle]');
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menuBtn.firstElementChild.className = 'i ' + (open ? 'i-x' : 'i-menu');
  }
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(menu.hidden));

  function scrollToId(id, smooth) {
    const behavior = smooth && !calm() ? 'smooth' : 'auto';
    if (id === 'top') { window.scrollTo({ top: 0, behavior: behavior }); return; }
    const el = document.getElementById(id);
    if (!el) return;
    const off = hdr ? hdr.getBoundingClientRect().height : 70;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - off + 1, behavior: behavior });
  }

  /* ---------- Gammes ---------- */
  function renderGammes() {
    const el = $('[data-gammes]');
    if (!el) return;
    const H = [300, 380, 300];
    el.innerHTML = (CAT.gammes || []).map((g, i) =>
      '<article class="gamme studio" style="--c:' + g.color + ';--h:' + H[i % 3] + 'px">' +
        '<span class="studio__rim"></span><span class="studio__ring"></span><span class="studio__floor"></span>' +
        '<img class="gamme__img" src="' + esc(g.img) + '" alt="' + esc(g.label) + '" loading="lazy" decoding="async">' +
        '<div class="gamme__top"><h3 class="gamme__name">' + esc(g.key) + '</h3><span class="gamme__tag">' + esc(g.tag) + '</span></div>' +
        '<div class="gamme__bottom">' +
          '<span class="gamme__label"><em>' + esc(g.label) + '</em><span class="gamme__count">N°' + String(i + 1).padStart(2, '0') + '</span></span>' +
          '<a class="btn-see" href="#boutique" data-nav aria-label="Voir la boutique (gamme ' + esc(g.key) + ')">Voir<span class="i i-arrow-up-right"></span></a>' +
        '</div></article>'
    ).join('');
    watchLive(el);
  }

  /* ---------- Héros ---------- */
  // Le bouton WhatsApp flottant reste caché tant que le héros occupe l'écran (l'anneau de flacons est dans js/anneau.js).
  const hero = $('[data-hero]');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      document.body.classList.toggle('is-hero-view', es[0].intersectionRatio > 0.35);
    }, { threshold: [0, 0.35, 0.6] }).observe(hero);
  }

  /* ---------- Copier le numéro MVola ---------- */
  let copyT = 0;
  function copyNumber() {
    const t = SHOP.mvola;
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* ignoré */ }
      ta.remove();
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(fallback);
      else fallback();
    } catch (e) { fallback(); }
    $$('[data-copy-label]').forEach((el) => { el.textContent = 'Numéro copié'; });
    clearTimeout(copyT);
    copyT = setTimeout(() => $$('[data-copy-label]').forEach((el) => { el.textContent = 'Copier le numéro'; }), 2200);
  }

  /* ---------- Clics (délégation) ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t.closest) return;
    let el;
    if ((el = t.closest('a[data-nav]'))) {
      e.preventDefault();
      setMenu(false);
      scrollToId((el.getAttribute('href') || '#top').slice(1), true);
      return;
    }
    if (t.closest('[data-copy]')) copyNumber();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Démarrage ---------- */
  renderGammes();
  if (/^#(commande|merci)$/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
})();
