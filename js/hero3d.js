/* Flacons 3D de l'accueil (three.js) : cinq flacons en verre, un par univers olfactif,
   qui tournent sur eux-mêmes et en orbite sur un fond « aura », avec faisceau, anneaux et poussière holographiques.
   La qualité s'adapte à l'appareil : verre réfractif sur les machines puissantes, verre translucide léger
   et 30 images/s sur les petites machines (et repli automatique si l'affichage rame).
   Dialogue avec app.js : reçoit hero:goto / hero:nav ; envoie hero:ready / hero:active / hero:select / hero:fail. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.min.js';

const hero = document.querySelector('[data-hero]');
const canvas = document.querySelector('[data-hero-canvas]');
const stageEl = document.querySelector('[data-hero-stage]');
const emit = (type, detail) => window.dispatchEvent(new CustomEvent(type, { detail }));

if (hero && canvas && stageEl) start().catch(() => emit('hero:fail'));

async function start() {
  const CAT = window.CATALOGUE || {};
  const FAM = (CAT.familles || []).map((f) => ({ name: f.key, n: f.n, color: f.color }));
  const N = FAM.length;
  if (!N) return;

  // ---- Niveau de qualité selon l'appareil ----
  const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  let tier = (mem <= 4 || cores <= 4) ? 'low' : coarse ? 'mid' : 'high';
  const forced = new URLSearchParams(location.search).get('q');   // test : ?q=low | mid | high
  if (forced === 'low' || forced === 'mid' || forced === 'high') tier = forced;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: tier !== 'low', powerPreference: 'high-performance' });
  } catch (e) {
    emit('hero:fail');
    return;
  }
  const maxDpr = { high: 1.75, mid: 1.5, low: 1 };
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr[tier]));
  renderer.setClearColor('#07070A', 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.transmissionResolutionScale = 0.5;

  const BG = '#07070A', CAM_Z = 9, PLANE_Z = -6, R = 1.25, BASE = -0.82, STEP = Math.PI * 2 / N;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, 0, 0);

  // ---- Studio virtuel : softboxes + panneaux colorés, pour les reflets du verre et du métal ----
  {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(14, 9, 14), new THREE.MeshBasicMaterial({ color: '#0b0b10', side: THREE.BackSide })));
    const panel = (w, h, color, k, x, y, z) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(7, 1.6, '#ffffff', 8, 0, 4.2, 1.5);
    panel(1.1, 6, '#ffffff', 5.5, -6.5, 0.6, 2.5);
    panel(1.1, 6, '#ffffff', 4.5, 6.5, 0.6, 1.5);
    panel(3, 0.6, '#ffffff', 3, 0, 1.5, 6.8);
    panel(4, 2.4, '#21D1CA', 1.8, -5, -1.2, -5);
    panel(4, 2.4, '#F77CB0', 1.8, 5, -1.2, -5);
    panel(5, 1.6, '#F5AE4B', 1.1, 0, -3.8, 5);
    panel(3, 3, '#A181EF', 1.2, 0, 1, -6.5);
    panel(2, 4, '#E2C08D', 2.4, 6, 2, -2);
    panel(7, 2.6, '#FFF3E0', 1.3, 0, 0.6, 7.2);   // grande boîte à lumière face aux flacons : métaux lumineux
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.035).texture;
    pm.dispose();
  }

  // ---- Fond « aura » opaque (le verre le réfracte) ----
  const bgU = {
    uBg: { value: new THREE.Color(BG) }, uA: { value: new THREE.Color(FAM[0].color) }, uB: { value: new THREE.Color(FAM[1 % N].color) },
    uC: { value: new THREE.Color('#A181EF') }, uCenter: { value: new THREE.Vector2() }, uScale: { value: 1 }, uTime: { value: 0 }
  };
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), new THREE.ShaderMaterial({
    uniforms: bgU, depthWrite: false, toneMapped: false,
    vertexShader: 'varying vec2 vP; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xy; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `
      uniform vec3 uBg, uA, uB, uC; uniform vec2 uCenter; uniform float uScale, uTime; varying vec2 vP;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 p = (vP - uCenter) / uScale;
        vec2 a = p * vec2(0.8, 0.68);
        float g1 = exp(-dot(a, a) / 2.6);
        vec2 b = p - vec2(2.7 + 0.35 * sin(uTime * 0.21), 2.0 + 0.25 * cos(uTime * 0.17));
        float g2 = exp(-dot(b, b) / 2.6);
        vec2 c = p - vec2(-3.0 + 0.3 * cos(uTime * 0.15), -2.2 + 0.2 * sin(uTime * 0.19));
        float g3 = exp(-dot(c, c) / 3.0);
        vec3 col = uBg + uA * g1 * 0.2 + uB * g2 * 0.1 + uC * g3 * 0.1;
        col += (hash(gl_FragCoord.xy) - 0.5) / 1800.0;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`
  }));
  backdrop.position.z = PLANE_Z;
  scene.add(backdrop);

  // ---- Matières ----
  const metal = {
    gold: new THREE.MeshStandardMaterial({ color: '#E2C08D', metalness: 1, roughness: 0.22, envMapIntensity: 1.3 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#E8EAEE', metalness: 1, roughness: 0.1, envMapIntensity: 1.4 }),
    rose: new THREE.MeshStandardMaterial({ color: '#F2C4AE', metalness: 1, roughness: 0.3, envMapIntensity: 1.8, flatShading: true }),
    goldFacet: new THREE.MeshStandardMaterial({ color: '#E2C08D', metalness: 1, roughness: 0.16, envMapIntensity: 1.4, flatShading: true }),
    lacquer: new THREE.MeshPhysicalMaterial({ color: '#0C0C10', metalness: 0.2, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 })
  };
  const glassMeshes = [];
  function glassMaterial(color, flat, low) {
    const tint = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.55);
    const common = { color: '#ffffff', metalness: 0, iridescence: 0.45, iridescenceIOR: 1.3, iridescenceThicknessRange: [120, 400], clearcoat: 1, clearcoatRoughness: 0.03, flatShading: !!flat };
    if (low) return new THREE.MeshPhysicalMaterial(Object.assign(common, { roughness: 0.06, transparent: true, opacity: 0.3, envMapIntensity: 1.8, depthWrite: false }));
    return new THREE.MeshPhysicalMaterial(Object.assign(common, { roughness: 0.04, transmission: 1, thickness: 0.6, ior: 1.5, attenuationColor: tint, attenuationDistance: 2.2, envMapIntensity: 1.5, specularIntensity: 1 }));
  }
  const liquidMaterial = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, emissive: color, emissiveIntensity: 0.22, envMapIntensity: 1.1 });

  // ---- Géométries ----
  const V = (x, y) => new THREE.Vector2(x, y);
  function radiusAt(profile, y) {
    for (let i = 1; i < profile.length; i++) {
      const [r0, y0] = profile[i - 1], [r1, y1] = profile[i];
      if (y >= y0 && y <= y1) return y1 === y0 ? Math.max(r0, r1) : r0 + (r1 - r0) * (y - y0) / (y1 - y0);
    }
    return profile[profile.length - 1][0];
  }
  // Liquide : même silhouette que le flacon, rétrécie (épaisseur du verre) et remplie jusqu'à y1.
  function liquidLathe(profile, y0, y1, k) {
    const pts = [V(0, y0)];
    for (let i = 0; i <= 20; i++) { const y = y0 + (y1 - y0) * i / 20; pts.push(V(Math.max(0.01, radiusAt(profile, y) * k - 0.012), y)); }
    pts.push(V(0, y1));
    return new THREE.LatheGeometry(pts, 48);
  }
  function roundedRect(w, d, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  // Prisme aux arêtes arrondies, posé sur y = 0 (extrusion verticale).
  function prism(w, d, r, h, bevel) {
    const g = new THREE.ExtrudeGeometry(roundedRect(w, d, r), { depth: Math.max(0.01, h - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 10 });
    g.rotateX(-Math.PI / 2);
    g.computeBoundingBox();
    g.translate(0, -g.boundingBox.min.y, 0);
    return g;
  }
  function cyl(rTop, rBot, h, seg, y0, mat, rotY) {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
    if (rotY) g.rotateY(rotY);
    const m = new THREE.Mesh(g, mat);
    m.position.y = y0 + h / 2;
    return m;
  }

  // Étiquette dorée : nom de l'univers + numéro.
  function labelTexture(f) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 224;
    const x = c.getContext('2d');
    // Plaque noire laquée, filets et lettres d'or.
    x.fillStyle = 'rgba(8,8,12,.82)'; x.fillRect(6, 6, 500, 212);
    x.strokeStyle = 'rgba(226,192,141,.9)'; x.lineWidth = 3; x.strokeRect(12, 12, 488, 200);
    x.strokeStyle = 'rgba(226,192,141,.45)'; x.lineWidth = 1.5; x.strokeRect(24, 24, 464, 176);
    x.fillStyle = '#EBCB98'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = "300 76px 'Noto Serif Display', serif";
    if ('letterSpacing' in x) x.letterSpacing = '8px';
    x.fillText(f.name.toUpperCase(), 256, 104);
    x.font = "500 22px 'DM Mono', monospace";
    if ('letterSpacing' in x) x.letterSpacing = '7px';
    x.fillText('UNIVERS N°' + f.n, 256, 168);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }
  const labelMat = (f) => new THREE.MeshBasicMaterial({ map: labelTexture(f), transparent: true, depthWrite: false, toneMapped: false });
  function flatLabel(f, w, h, y, z) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), labelMat(f));
    m.position.set(0, y, z);
    return m;
  }
  function curvedLabel(f, radius, h, y, arc) {
    const g = new THREE.CylinderGeometry(radius, radius, h, 32, 1, true, -arc / 2, arc);
    const m = new THREE.Mesh(g, labelMat(f));
    m.position.y = y;
    return m;
  }

  // Cinq flacons, un par univers (base posée sur y = 0, hauteur ~1,5).
  function bottleParts(i, f, low) {
    const g = new THREE.Group(), liquid = liquidMaterial(f.color);
    const addGlass = (geo, flat) => { const m = new THREE.Mesh(geo, glassMaterial(f.color, flat, low)); m.renderOrder = 2; g.add(m); glassMeshes.push({ mesh: m, color: f.color, flat: !!flat }); return m; };
    const add = (m) => { g.add(m); return m; };
    if (i === 0) {          // Frais : colonne, bouchon chromé
      addGlass(prism(0.56, 0.34, 0.07, 1.05, 0.035));
      add(new THREE.Mesh(prism(0.47, 0.25, 0.05, 0.78, 0.015).translate(0, 0.06, 0), liquid));
      addGlass(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 32).translate(0, 1.075, 0));
      add(cyl(0.095, 0.095, 0.05, 32, 1.1, metal.chrome));
      add(cyl(0.115, 0.115, 0.4, 48, 1.15, metal.chrome));
      add(flatLabel(f, 0.36, 0.158, 0.46, 0.208));
    } else if (i === 1) {   // Floral : flasque ronde, bouchon or rose à facettes
      const prof = [[0, 0], [0.3, 0], [0.4, 0.03], [0.47, 0.12], [0.52, 0.26], [0.53, 0.4], [0.5, 0.56], [0.42, 0.7], [0.3, 0.8], [0.17, 0.87], [0.11, 0.92], [0.1, 0.98]];
      addGlass(new THREE.LatheGeometry(prof.map(([r, y]) => V(r, y)), 64));
      add(new THREE.Mesh(liquidLathe(prof, 0.05, 0.62, 0.86), liquid));
      add(cyl(0.12, 0.12, 0.06, 40, 0.98, metal.rose));
      const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), metal.rose);
      gem.position.y = 1.25; gem.scale.set(1, 1.15, 1); g.add(gem);
      add(curvedLabel(f, radiusAt(prof, 0.38) + 0.005, 0.15, 0.38, 0.8));
    } else if (i === 2) {   // Oriental : prisme octogonal à facettes, bouchon or
      addGlass(new THREE.CylinderGeometry(0.4, 0.42, 1.0, 8).rotateY(Math.PI / 8).translate(0, 0.5, 0), true);
      addGlass(new THREE.CylinderGeometry(0.12, 0.4, 0.1, 8).rotateY(Math.PI / 8).translate(0, 1.05, 0), true);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.35, 0.72, 8).rotateY(Math.PI / 8).translate(0, 0.42, 0), liquid));
      add(cyl(0.11, 0.11, 0.05, 32, 1.1, metal.gold));
      add(cyl(0.17, 0.21, 0.3, 8, 1.15, metal.goldFacet, Math.PI / 8));
      add(flatLabel(f, 0.27, 0.118, 0.5, 0.41 * Math.cos(Math.PI / 8) + 0.004));
    } else if (i === 3) {   // Boisé : bloc massif, bouchon laqué noir cerclé d'or
      addGlass(prism(0.62, 0.46, 0.1, 0.92, 0.04));
      add(new THREE.Mesh(prism(0.52, 0.36, 0.07, 0.62, 0.015).translate(0, 0.12, 0), liquid));
      addGlass(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 32).translate(0, 0.945, 0));
      add(cyl(0.12, 0.12, 0.04, 32, 0.97, metal.gold));
      add(cyl(0.19, 0.19, 0.34, 48, 1.01, metal.lacquer));
      add(cyl(0.193, 0.193, 0.03, 48, 1.06, metal.gold));
      add(flatLabel(f, 0.4, 0.175, 0.44, 0.273));
    } else {                // Gourmand : goutte, bouchon sphère dorée
      const prof = [[0, 0], [0.24, 0], [0.36, 0.04], [0.45, 0.14], [0.49, 0.28], [0.47, 0.44], [0.4, 0.6], [0.3, 0.74], [0.2, 0.86], [0.12, 0.96], [0.1, 1.02]];
      addGlass(new THREE.LatheGeometry(prof.map(([r, y]) => V(r, y)), 64));
      add(new THREE.Mesh(liquidLathe(prof, 0.05, 0.55, 0.86), liquid));
      add(cyl(0.12, 0.12, 0.06, 40, 1.02, metal.gold));
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 48, 32), metal.gold);
      ball.position.y = 1.24; g.add(ball);
      add(curvedLabel(f, radiusAt(prof, 0.3) + 0.005, 0.15, 0.3, 0.85));
    }
    return g;
  }

  // ---- Lueurs, sol et effets holographiques ----
  const radial = (stops) => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach((s) => gr.addColorStop(s[0], s[1]));
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  };
  const glowTex = radial([[0, 'rgba(255,255,255,0.8)'], [0.35, 'rgba(255,255,255,0.25)'], [1, 'rgba(255,255,255,0)']]);
  const floorTex = radial([[0, 'rgba(255,255,255,0.65)'], [0.5, 'rgba(255,255,255,0.16)'], [1, 'rgba(255,255,255,0)']]);
  const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false };

  // Attend (au plus 1,5 s) les polices utilisées par les étiquettes.
  if (document.fonts && document.fonts.load) {
    await Promise.race([
      Promise.all([document.fonts.load("300 76px 'Noto Serif Display'"), document.fonts.load("500 22px 'DM Mono'")]).catch(() => {}),
      new Promise((r) => setTimeout(r, 1500))
    ]);
  }

  const holder = new THREE.Group(); holder.rotation.x = 0.16; scene.add(holder);
  const ring = new THREE.Group(); holder.add(ring);
  const bottles = FAM.map((f, i) => {
    const b = new THREE.Group();
    const glow = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: glowTex, color: f.color, opacity: 0.32 }, add)));
    glow.scale.set(2.2, 2.2, 1); glow.position.set(0, BASE + 0.8, -0.2); b.add(glow);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.55), new THREE.MeshBasicMaterial(Object.assign({ map: floorTex, color: f.color }, add)));
    pool.rotation.x = -Math.PI / 2; pool.position.set(0, BASE - 0.005, 0); b.add(pool);
    const body = bottleParts(i, f, tier === 'low');
    body.position.y = BASE; body.scale.setScalar(1.06);
    b.add(body);
    b.userData = { body, glow, pool, spin: i * 1.3 };
    ring.add(b);
    return b;
  });

  // Faisceau de lumière sur le flacon de devant.
  const beamU = { uColor: { value: new THREE.Color(FAM[0].color) }, uOpacity: { value: 0.22 }, uH: { value: 2.8 } };
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.8, 48, 1, true), new THREE.ShaderMaterial({
    uniforms: beamU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = position.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity, uH; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float t = clamp(0.5 - vY / uH, 0.0, 1.0); float edge = pow(abs(dot(normalize(vN), normalize(vV))), 2.0); gl_FragColor = vec4(uColor, uOpacity * t * t * edge); }'
  }));
  beam.position.set(0, BASE + 1.4, R);
  holder.add(beam);

  // Anneau HUD tournant + onde qui s'élargit sous le flacon de devant.
  const hudTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d'); x.translate(256, 256);
    x.strokeStyle = 'rgba(255,255,255,0.9)';
    x.lineWidth = 3; x.setLineDash([22, 14]); x.beginPath(); x.arc(0, 0, 236, 0, Math.PI * 2); x.stroke();
    x.setLineDash([]); x.lineWidth = 1.5; x.beginPath(); x.arc(0, 0, 214, 0, Math.PI * 2); x.stroke();
    for (let a = 0; a < 72; a++) { const r0 = a % 6 === 0 ? 188 : 198; x.beginPath(); x.moveTo(Math.cos(a * Math.PI / 36) * r0, Math.sin(a * Math.PI / 36) * r0); x.lineTo(Math.cos(a * Math.PI / 36) * 206, Math.sin(a * Math.PI / 36) * 206); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t;
  })();
  const hud = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial(Object.assign({ map: hudTex, color: '#E2C08D', opacity: 0.55 }, add)));
  hud.rotation.x = -Math.PI / 2; hud.position.set(0, BASE + 0.004, R);
  holder.add(hud);
  const waveMat = new THREE.MeshBasicMaterial(Object.assign({ color: FAM[0].color, opacity: 0.6, side: THREE.DoubleSide }, add));
  const wave = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.64, 96), waveMat);
  wave.rotation.x = -Math.PI / 2; wave.position.set(0, BASE + 0.006, R);
  holder.add(wave);

  // Orbites, « planètes » et poussière dorée.
  const orbitMat = new THREE.MeshBasicMaterial({ color: '#E2C08D', transparent: true, opacity: 0.2, depthWrite: false, toneMapped: false });
  const o1 = new THREE.Mesh(new THREE.TorusGeometry(R * 1.55, 0.0045, 6, 320), orbitMat);
  o1.rotation.x = Math.PI / 2; o1.position.y = BASE; holder.add(o1);
  const o2m = orbitMat.clone(); o2m.opacity = 0.1; o2m.color.set('#ffffff');
  const o2 = new THREE.Mesh(new THREE.TorusGeometry(R * 2.05, 0.0035, 6, 320), o2m);
  o2.rotation.set(Math.PI / 2 - 0.42, 0.25, 0); holder.add(o2);
  const planets = [[o1, R * 1.55, '#21D1CA', 0.26, 0], [o1, R * 1.55, '#F77CB0', 0.26, Math.PI], [o2, R * 2.05, '#E2C08D', -0.16, 1.2]].map(([o, r, c, sp, ph]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 12), new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
    o.add(m);
    return { m, r, sp, ph };
  });
  const dotTex = radial([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]);
  const DN = tier === 'low' ? 110 : 190, dpos = new Float32Array(DN * 3), dcol = new Float32Array(DN * 3);
  const dustColors = FAM.map((f) => f.color).concat(['#E2C08D', '#E2C08D', '#F8E9CB']);
  for (let i = 0; i < DN; i++) {
    const a = Math.random() * Math.PI * 2, r = 0.9 + Math.random() * 3.2;
    dpos.set([Math.cos(a) * r, (Math.random() - 0.4) * 3, Math.sin(a) * r * 0.7], i * 3);
    const c = new THREE.Color(dustColors[i % dustColors.length]);
    dcol.set([c.r, c.g, c.b], i * 3);
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  dg.setAttribute('color', new THREE.BufferAttribute(dcol, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.045, map: dotTex, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  holder.add(dust);

  // ---- Mise en place : le carrousel se centre sur la zone « scène » de la page ----
  function stageRect() {
    const hr = hero.getBoundingClientRect(), sr = stageEl.getBoundingClientRect();
    if (!hr.width || !hr.height || !sr.width || !sr.height) return null;
    return { x: (sr.left - hr.left) / hr.width, y: (sr.top - hr.top) / hr.height, w: sr.width / hr.width, h: sr.height / hr.height };
  }
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const st = stageRect() || (w / h > 1.1 ? { x: 0.36, y: 0.08, w: 0.4, h: 0.84 } : { x: 0.04, y: 0.5, w: 0.92, h: 0.44 });
    const Hh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z, Ww = Hh * camera.aspect;
    const cx = (st.x + st.w / 2 - 0.5) * Ww, cy = (0.5 - (st.y + st.h / 2)) * Hh;
    const k = THREE.MathUtils.clamp(Math.min((st.h * Hh) / 2.75, (st.w * Ww) / 3.3), 0.4, 1.45);
    holder.position.set(cx, cy, 0);
    holder.scale.setScalar(k);
    const f = (CAM_Z - PLANE_Z) / CAM_Z;
    bgU.uCenter.value.set(cx * f, cy * f);
    bgU.uScale.value = k * f;
  }
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    ro.observe(stageEl);
  }
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();

  // ---- État du carrousel ----
  let angle = 0, target = 0, cur = 0, active = 0, lastAuto = performance.now(), lastInteract = 0;
  const mod = (i) => ((i % N) + N) % N;
  function goTo(idx, notify = true) {
    cur = idx; target = -idx * STEP; lastAuto = performance.now();
    const a = mod(idx);
    if (a !== active || notify) { active = a; if (notify) emit('hero:active', { index: a }); }
  }
  function nearest(i) {
    let d = i - mod(cur);
    if (d > N / 2) d -= N;
    if (d < -N / 2) d += N;
    return cur + d;
  }

  // ---- Glisser pour tourner (avec inertie), cliquer un flacon pour ouvrir son univers ----
  const mouse = new THREE.Vector2(), ray = new THREE.Raycaster();
  let dragging = false, lastX = 0, moved = 0, vel = 0;
  hero.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    if (r.width) mouse.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  });
  hero.addEventListener('pointerleave', () => mouse.set(0, 0));
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; moved = 0; vel = 0;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignoré */ }
    canvas.classList.add('is-drag');
    lastInteract = performance.now();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX; moved += Math.abs(dx);
    const d = dx * 0.006 / Math.max(0.5, holder.scale.x);
    angle += d; vel = d; lastInteract = performance.now();
  });
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(bottles, true)[0];
    if (!hit) return;
    let o = hit.object;
    while (o && !bottles.includes(o)) o = o.parent;
    const i = bottles.indexOf(o);
    if (i < 0) return;
    if (i === active) emit('hero:select', { index: i });
    else goTo(nearest(i));
  }
  canvas.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove('is-drag');
    if (moved < 6) pick(e);
    else goTo(Math.round(-(angle + vel * 8) / STEP));
    lastInteract = performance.now();
  });
  canvas.addEventListener('pointercancel', () => {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove('is-drag');
    goTo(Math.round(-angle / STEP));
  });
  window.addEventListener('hero:goto', (e) => { if (!e.detail) return; lastInteract = performance.now(); goTo(nearest(e.detail.index), false); });
  window.addEventListener('hero:nav', (e) => { if (!e.detail) return; lastInteract = performance.now(); goTo(cur + (e.detail.dir > 0 ? 1 : -1)); });

  // ---- Visibilité, perte du contexte WebGL ----
  let visible = true, lost = false, readySent = false;
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(canvas);
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; readySent = false; emit('hero:fail'); });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; layout(); });

  // ---- Passage en qualité légère si l'affichage rame ----
  function goLow() {
    if (tier === 'low') return;
    tier = 'low';
    glassMeshes.forEach((g) => { const old = g.mesh.material; g.mesh.material = glassMaterial(g.color, g.flat, true); old.dispose(); });
    renderer.setPixelRatio(1);
    layout();
  }
  let perfFrames = 0, perfStart = 0, perfDone = false;
  function watchPerf(now) {
    if (perfDone) return;
    if (!perfStart) { perfStart = now; perfFrames = 0; return; }
    perfFrames++;
    const span = now - perfStart;
    if (span < 2500) return;
    const avg = span / perfFrames;
    if (tier !== 'low' && avg > 42) { goLow(); perfStart = 0; return; }
    if (tier === 'low' && avg > 60) renderer.setPixelRatio(0.75);
    perfDone = true;
  }

  // Compile les matières avant la première image (évite un à-coup).
  try { if (renderer.compileAsync) await renderer.compileAsync(scene, camera); } catch (e) { /* compilation au premier rendu */ }

  // ---- Boucle d'animation ----
  const cA = new THREE.Color(), cB = new THREE.Color();
  let t = 0, lastT = performance.now(), lastRender = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || lost || document.hidden || !canvas.clientWidth) { lastT = now; return; }
    // Petites machines : 30 images/s suffisent.
    if (tier === 'low' && now - lastRender < 31) return;
    const dt = Math.min(Math.max(0, now - lastT) / 1000, 0.05);
    lastT = now; lastRender = now;
    t += dt;
    if (!dragging) angle += (target - angle) * (1 - Math.exp(-dt * 4.5));
    const n = performance.now();
    if (!reduce.matches && !dragging && n - lastInteract > 7000 && n - lastAuto > 5200) goTo(cur + 1);
    const a = mod(Math.round(-angle / STEP));
    bottles.forEach((b, i) => {
      const th = i * STEP + angle, fr = (Math.cos(th) + 1) / 2;
      b.position.set(Math.sin(th) * R, Math.sin(t * 1.1 + i * 1.7) * 0.04, Math.cos(th) * R);
      b.scale.setScalar(0.62 + 0.42 * Math.pow(fr, 1.6));
      // Chaque flacon tourne sur lui-même ; celui de devant un peu plus vite.
      b.userData.spin += dt * (reduce.matches ? 0.08 : (i === a ? 0.55 : 0.28));
      b.userData.body.rotation.y = b.userData.spin;
      b.userData.glow.material.opacity = 0.14 + 0.3 * Math.pow(fr, 3);
    });
    planets.forEach((p) => { const ang = p.ph + t * p.sp; p.m.position.set(Math.cos(ang) * p.r, Math.sin(ang) * p.r, 0); });
    dust.rotation.y = t * 0.03;
    hud.rotation.z = t * 0.25;
    const wt = (t % 2.6) / 2.6;
    wave.scale.setScalar(1 + wt * 0.9);
    waveMat.opacity = 0.55 * (1 - wt);
    holder.rotation.y += (mouse.x * 0.07 - holder.rotation.y) * 0.05;
    holder.rotation.x += ((0.16 - mouse.y * 0.04) - holder.rotation.x) * 0.05;
    cA.set(FAM[a].color); cB.set(FAM[(a + 1) % N].color);
    bgU.uA.value.lerp(cA, 1 - Math.exp(-dt * 3));
    bgU.uB.value.lerp(cB, 1 - Math.exp(-dt * 2));
    beamU.uColor.value.lerp(cA, 1 - Math.exp(-dt * 3));
    waveMat.color.lerp(cA, 1 - Math.exp(-dt * 3));
    bgU.uTime.value = t;
    renderer.render(scene, camera);
    if (!readySent) { readySent = true; emit('hero:ready'); }
    else watchPerf(now);
  }
  goTo(0, false);
  requestAnimationFrame(frame);
}
