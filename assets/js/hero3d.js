/* =========================================================
   NOSY HYPE — 3D signature bottle for the hero
   Real-time three.js scene: glass flacon with amber juice,
   gold cap, holographic platform, floating gold dust.
   Drag (or swipe) to turn the bottle.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

const stage = document.querySelector('[data-hero3d]');
const canvas = stage && stage.querySelector('canvas');

function announce() {
  window.__hero3dReady = true;
  window.dispatchEvent(new Event('hero3d:ready'));
}

if (!canvas) {
  announce();
} else {
  const go = () => {
    try {
      init();
    } catch (err) {
      stage.classList.add('is-fallback');
      announce();
    }
  };
  // the engraved label uses the web font: wait for it (1.5 s max)
  const font = document.fonts && document.fonts.load ? document.fonts.load('500 96px "Cormorant Garamond"') : Promise.resolve();
  Promise.race([font, new Promise((r) => setTimeout(r, 1500))]).then(go, go);
}

function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.innerWidth < 768;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x050505, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const target = new THREE.Vector3(0, 1.08, 0);

  /* ---------- helpers ---------- */
  const makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const radial = (stops, size = 256) => {
    const c = makeCanvas(size, size); const g = c.getContext('2d');
    const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    return tex(c, false);
  };
  const roundedRect = (w, h, r, x0, y0) => {
    const s = new THREE.Shape();
    s.moveTo(x0 + r, y0);
    s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    s.lineTo(x0 + w, y0 + h - r); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
    s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
    s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
    return s;
  };
  // rounded block standing on y = 0, centred on x and z
  const block = (w, h, d, r, bevel) => {
    const shape = roundedRect(w - 2 * bevel, h - 2 * bevel, Math.max(0.01, r - bevel), -(w / 2) + bevel, bevel);
    const g = new THREE.ExtrudeGeometry(shape, { depth: d - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 16 });
    g.translate(0, 0, -(d - 2 * bevel) / 2);
    g.computeVertexNormals();
    return g;
  };

  /* ---------- studio environment (soft strip lights, for reflections) ---------- */
  {
    const env = new THREE.Scene();
    const sc = makeCanvas(64, 256); const sx = sc.getContext('2d');
    const gx = sx.createLinearGradient(0, 0, 64, 0);
    gx.addColorStop(0, 'rgba(255,255,255,0)'); gx.addColorStop(0.5, 'rgba(255,255,255,1)'); gx.addColorStop(1, 'rgba(255,255,255,0)');
    sx.fillStyle = gx; sx.fillRect(0, 0, 64, 256);
    sx.globalCompositeOperation = 'destination-in';
    const gy = sx.createLinearGradient(0, 0, 0, 256);
    gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(0.25, 'rgba(0,0,0,1)'); gy.addColorStop(0.75, 'rgba(0,0,0,1)'); gy.addColorStop(1, 'rgba(0,0,0,0)');
    sx.fillStyle = gy; sx.fillRect(0, 0, 64, 256);
    const soft = tex(sc, false);
    const panel = (w, h, pos, color, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), map: soft, transparent: true, side: THREE.DoubleSide }));
      m.position.set(...pos); m.lookAt(0, pos[1] * 0.3, 0); env.add(m);
    };
    panel(1.6, 14, [-7, 2, 2.5], '#fff4e2', 7);
    panel(1.2, 14, [7, 2, 1.5], '#ffd88a', 4.5);
    panel(0.6, 12, [-4.5, 2, -6], '#ffe6b0', 5);
    panel(0.6, 12, [4.5, 2, -6], '#ffcf70', 5);
    panel(8, 3, [0, 9, 0], '#fff2dc', 1.2);
    panel(1.4, 12, [-3.6, 2, 6.5], '#fff6ea', 2.4);
    panel(0.5, 12, [3.2, 2, 6.8], '#ffe2a6', 1.4);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.02).texture;
    pm.dispose();
  }

  /* ---------- backdrop: warm glow that the glass refracts ---------- */
  {
    const c = makeCanvas(1024, 1024); const g = c.getContext('2d');
    g.fillStyle = '#050505'; g.fillRect(0, 0, 1024, 1024);
    const glow = (x, y, r, a, b) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, a); gr.addColorStop(0.4, b); gr.addColorStop(1, 'rgba(5,5,5,0)');
      g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
    };
    glow(512, 470, 470, 'rgba(110,76,28,0.9)', 'rgba(40,26,8,0.55)');
    glow(512, 600, 210, 'rgba(255,190,100,0.95)', 'rgba(150,95,30,0.6)');
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ map: tex(c, true), toneMapped: false }));
    bd.position.set(0, 1.2, -7);
    scene.add(bd);
  }

  /* ---------- bottle ---------- */
  const bottle = new THREE.Group();
  const W = 1.3, H = 1.45, D = 0.62;
  {
    const tint = new THREE.Color('#d88a2a');
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: 0.03, transmission: 1, thickness: 0.7, ior: 1.5,
      attenuationColor: tint, attenuationDistance: 1.0, clearcoat: 1, clearcoatRoughness: 0.02,
      envMapIntensity: 1.4, specularIntensity: 1,
    });
    glass.onBeforeCompile = (sh) => {
      sh.uniforms.uFillTop = { value: 1.16 };
      sh.uniforms.uFillBottom = { value: 0.16 };
      sh.uniforms.uTint = { value: tint };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vLocalY;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocalY = position.y;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vLocalY;\nuniform float uFillTop;\nuniform float uFillBottom;\nuniform vec3 uTint;')
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', `vec4 diffuseColor = vec4( diffuse, opacity );
          float inJuice = smoothstep(uFillBottom - 0.006, uFillBottom + 0.006, vLocalY) * (1.0 - smoothstep(uFillTop - 0.004, uFillTop + 0.004, vLocalY));
          float meniscus = exp(-abs(vLocalY - uFillTop) * 90.0);
          diffuseColor.rgb *= mix(vec3(1.0), uTint, inJuice * 0.2);`)
        .replace('material.attenuationColor = attenuationColor;', 'material.attenuationColor = mix(vec3(1.0), attenuationColor, inJuice);')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += uTint * meniscus * 0.35 + uTint * inJuice * 0.06;');
    };
    bottle.add(new THREE.Mesh(block(W, H, D, 0.1, 0.07), glass));

    const gold = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#e0b955'), metalness: 1, roughness: 0.26, clearcoat: 0.5, clearcoatRoughness: 0.12, envMapIntensity: 1.9 });
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.1, 64), gold);
    collar.position.y = H + 0.05;
    bottle.add(collar);
    const capSize = 0.54;
    const cap = new THREE.Mesh(block(capSize, capSize * 0.86, capSize, 0.06, 0.03), gold);
    cap.position.y = H + 0.1;
    bottle.add(cap);

    // engraved gold label (front only)
    const c = makeCanvas(1024, 512); const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 1024, 512);
    g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.letterSpacing = '22px';
    g.font = '500 96px "Cormorant Garamond", Georgia, serif';
    g.fillText('NOSY HYPE', 512, 222);
    g.lineWidth = 3; g.beginPath(); g.moveTo(440, 300); g.lineTo(584, 300); g.stroke();
    g.letterSpacing = '12px';
    g.font = '400 38px "Cormorant Garamond", Georgia, serif';
    g.fillText('EAU DE PARFUM', 512, 360);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.7, W * 0.35), new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e6c46a'), metalness: 0.85, roughness: 0.35, emissive: new THREE.Color('#d4af37'), emissiveIntensity: 0.35,
      alphaMap: tex(c, false), transparent: true, depthWrite: false,
    }));
    label.position.set(0, H * 0.48, D / 2 + 0.004);
    label.renderOrder = 5;
    bottle.add(label);
  }
  const lift = 0.16;
  bottle.position.y = lift;
  scene.add(bottle);

  /* ---------- holographic platform ---------- */
  const platform = new THREE.Group();
  {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.62, 0.07, 128), new THREE.MeshPhysicalMaterial({
      color: 0x0c0b08, metalness: 0.6, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.8,
    }));
    disc.position.y = -0.035;
    platform.add(disc);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.585, 0.008, 8, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd98a').multiplyScalar(1.3), toneMapped: false }));
    rim.rotation.x = Math.PI / 2; rim.position.y = 0.001;
    platform.add(rim);

    // concentric dashed rings drawn on a canvas, additive
    const c = makeCanvas(1024, 1024); const g = c.getContext('2d');
    g.translate(512, 512);
    g.strokeStyle = 'rgba(244,215,125,0.9)';
    [[470, 2, [6, 10]], [420, 1.2, []], [360, 2, [40, 14]], [300, 1, [2, 8]], [220, 1.5, []]].forEach(([r, w, dash]) => {
      g.lineWidth = w; g.setLineDash(dash); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
    });
    g.setLineDash([]);
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2; const r0 = i % 6 ? 482 : 470;
      g.lineWidth = i % 6 ? 1 : 2;
      g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * 500, Math.sin(a) * 500); g.stroke();
    }
    const ringMat = new THREE.MeshBasicMaterial({ map: tex(c, true), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    const rings = new THREE.Mesh(new THREE.CircleGeometry(1.5, 96), ringMat);
    rings.rotation.x = -Math.PI / 2; rings.position.y = 0.004; rings.name = 'rings';
    platform.add(rings);

    // amber light pooled under the bottle
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({
      map: radial([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.4)'], [1, 'rgba(255,255,255,0)']]),
      color: new THREE.Color('#e89a3a').multiplyScalar(0.9), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    pool.rotation.x = -Math.PI / 2; pool.position.y = 0.006;
    platform.add(pool);

    // expanding scan pulse
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 128), new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffd98a').multiplyScalar(1.6), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    }));
    pulse.rotation.x = -Math.PI / 2; pulse.position.y = 0.008; pulse.name = 'pulse';
    platform.add(pulse);
  }
  scene.add(platform);

  /* ---------- floating gold dust ---------- */
  const DUST = small ? 90 : 160;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST * 3);
  const dustSpeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    const a = Math.random() * Math.PI * 2; const r = 0.6 + Math.random() * 2.6;
    dustPos[i * 3] = Math.cos(a) * r; dustPos[i * 3 + 1] = Math.random() * 3.4; dustPos[i * 3 + 2] = Math.sin(a) * r - 0.4;
    dustSpeed[i] = 0.05 + Math.random() * 0.14;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: small ? 0.05 : 0.04, map: radial([[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']], 64),
    color: new THREE.Color('#f4d77d'), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(dust);

  /* ---------- lights ---------- */
  const spot = new THREE.SpotLight(0xfff0d6, 160, 30, 0.42, 1, 2);
  spot.position.set(0.8, 8, 3.5); spot.target.position.set(0, 0.8, 0);
  scene.add(spot, spot.target);
  const rimLight = new THREE.SpotLight(0xffc766, 70, 30, 0.35, 1, 2);
  rimLight.position.set(-2.5, 6, -6); rimLight.target.position.set(0, 1.2, 0);
  scene.add(rimLight, rimLight.target);
  const key = new THREE.DirectionalLight(0xfff1d6, 2.4);
  key.position.set(3, 5, 6);
  scene.add(key);

  /* ---------- interaction: drag to turn, idle auto-rotation ---------- */
  let angle = -0.5;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  let idle = 0;
  const autoSpeed = reduceMotion ? 0 : 0.42;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; velocity = 0;
    canvas.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    const delta = (dx / r.width) * Math.PI * 2;
    angle += delta;
    velocity = delta * 60;
    idle = 0;
  });
  const release = () => { dragging = false; stage.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => { pointer.tx = 0; pointer.ty = 0; });

  /* ---------- sizing ---------- */
  function resize() {
    const w = stage.clientWidth; const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole bottle + platform in frame whatever the aspect ratio
    const fitH = 4.0; const fitW = 4.2;
    const vFov = (camera.fov * Math.PI) / 180;
    const distH = fitH / 2 / Math.tan(vFov / 2);
    const distW = fitW / 2 / (Math.tan(vFov / 2) * camera.aspect);
    camera.userData.dist = Math.max(distH, distW);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  /* ---------- adaptive quality: lower the resolution on slow devices ---------- */
  let samples = 0; let sum = 0; let level = 0;
  const ratios = [renderer.getPixelRatio(), 1, 0.75];
  function adapt(raw) {
    if (raw <= 0 || raw > 1 || level >= ratios.length - 1) return;
    samples++; sum += raw;
    if (samples < 45) return;
    const avg = sum / samples;
    samples = 0; sum = 0;
    if (avg > 1 / 28) {
      level++;
      renderer.setPixelRatio(Math.min(ratios[0], ratios[level]));
      resize();
    }
  }

  /* ---------- render loop (only while visible) ---------- */
  let visible = true;
  let running = false;
  let last = performance.now();
  let t = 0;
  let firstFrame = true;
  const rings = platform.getObjectByName('rings');
  const pulse = platform.getObjectByName('pulse');
  const angleLabel = document.querySelector('[data-hud-angle]');
  let labelTick = 0;

  function frame(now) {
    if (!visible || document.hidden) { running = false; return; }
    running = true;
    const raw = (now - last) / 1000; last = now;
    const dt = Math.min(0.1, raw); t += dt;
    adapt(raw);

    if (!dragging) {
      idle += dt;
      velocity *= Math.pow(0.04, dt);
      const auto = idle > 1.2 ? autoSpeed : autoSpeed * (idle / 1.2);
      angle += (velocity + auto) * dt;
    }
    bottle.rotation.y = angle;
    bottle.position.y = lift + (reduceMotion ? 0 : Math.sin(t * 1.3) * 0.035);
    rings.rotation.z = -t * 0.12;
    const p = (t % 3.2) / 3.2;
    pulse.scale.setScalar(0.25 + p * 1.35);
    pulse.material.opacity = 0.6 * (1 - p);

    const pos = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) {
      pos[i * 3 + 1] += dustSpeed[i] * dt;
      if (pos[i * 3 + 1] > 3.6) pos[i * 3 + 1] = 0;
    }
    dustGeo.attributes.position.needsUpdate = true;

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    const dist = camera.userData.dist || 9;
    camera.position.set(pointer.x * 0.55, 1.62 - pointer.y * 0.25, dist);
    camera.lookAt(target);

    renderer.render(scene, camera);
    if (angleLabel && ++labelTick % 6 === 0) {
      const deg = Math.round((((angle * 180) / Math.PI) % 360 + 360) % 360);
      angleLabel.textContent = `${String(deg).padStart(3, '0')}°`;
    }
    if (firstFrame) {
      firstFrame = false;
      stage.classList.add('is-live');
      announce();
    }
    requestAnimationFrame(frame);
  }
  const kick = () => { if (!running && visible && !document.hidden) { last = performance.now(); requestAnimationFrame(frame); } };
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; kick(); }, { rootMargin: '100px' }).observe(stage);
  document.addEventListener('visibilitychange', kick);
  kick();
}
