// Escenarios reutilizables: apartamento (escenas 1, 2, 9, 12), teléfono, reloj de pared.
import * as THREE from 'three';
import { M, rbox, box, woodTex, noiseTex, fabricTex, keyLight, v3, dustField, glowTex, rng, lerp, clamp } from './lib.js';

export function setEnvIntensity(obj, k) {
  obj.traverse(o => { if (o.isMesh && o.material && 'envMapIntensity' in o.material) o.material.envMapIntensity = k; });
}

// ---------- Teléfono con pantalla dinámica ----------
export function makePhone() {
  const g = new THREE.Group();
  const body = rbox(0.074, 0.152, 0.009, 0.008, M.phys(0x1b1d22, { roughness: 0.25, metalness: 0.6, clearcoat: 1 }));
  g.add(body);
  const c = document.createElement('canvas'); c.width = 256; c.height = 520;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.142), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.75, roughness: 0.15, metalness: 0 }));
  scr.position.z = 0.0047; g.add(scr);
  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.0025, 12), M.basic(0x050505)); cam.position.set(0, 0.066, 0.0049); g.add(cam);
  const light = new THREE.PointLight(0x9fc4ff, 0.0, 0.6, 2); light.position.z = 0.08; g.add(light);
  let lastKey = '';
  g.userData = {
    screen: scr, light,
    /** state: 'feed' | 'chat' | 'off'; k: animación interna (scroll, minutos) */
    draw(state, k = 0, extra = {}) {
      const key = state + '_' + Math.round(k * 60) + '_' + JSON.stringify(extra);
      if (key === lastKey) return; lastKey = key;
      const x = c.getContext('2d');
      const R = (X, Y, W, H, r, col) => { x.fillStyle = col; x.beginPath(); x.roundRect(X, Y, W, H, r); x.fill(); };
      if (state === 'off') { x.fillStyle = '#000'; x.fillRect(0, 0, 256, 520); tex.needsUpdate = true; return; }
      if (state === 'feed') {
        x.fillStyle = '#f4f1ec'; x.fillRect(0, 0, 256, 520);
        const r = rng(3); const cols = ['#ff8a5b', '#5bc0eb', '#9bc53d', '#fde74c', '#c879ff', '#ff5d8f'];
        const off = -(k * 900) % 900;
        for (let i = 0; i < 8; i++) {
          const y = off + i * 225 + 40;
          R(14, y, 228, 205, 16, '#ffffff');
          x.fillStyle = cols[i % 6]; x.beginPath(); x.arc(36, y + 22, 12, 0, 7); x.fill();
          R(56, y + 14, 90, 8, 4, '#cfcac3');
          const gr = x.createLinearGradient(0, y + 44, 0, y + 170); gr.addColorStop(0, cols[(i + 1) % 6]); gr.addColorStop(1, cols[(i + 3) % 6]);
          x.fillStyle = gr; x.beginPath(); x.roundRect(22, y + 44, 212, 126, 10); x.fill();
          // "imagen": sol y montañas simples
          x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.arc(190, y + 78, 14, 0, 7); x.fill();
          x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.moveTo(22, y + 170); x.lineTo(90, y + 100); x.lineTo(140, y + 150); x.lineTo(180, y + 120); x.lineTo(234, y + 170); x.fill();
          R(22, y + 180, 140 * (0.5 + r() * 0.5), 7, 3, '#ddd8d0');
        }
        R(0, 0, 256, 30, 0, '#ffffff'); R(100, 10, 56, 8, 4, '#222');
      }
      if (state === 'chat') {
        // conversación: burbujas sin texto legible; k = minutos transcurridos (0..1)
        x.fillStyle = '#eef1f6'; x.fillRect(0, 0, 256, 520);
        R(0, 0, 256, 64, 0, '#ffffff');
        x.fillStyle = '#7fb069'; x.beginPath(); x.arc(40, 36, 16, 0, 7); x.fill();
        R(66, 26, 80, 9, 4, '#3a3f4a'); R(66, 40, 46, 7, 3, '#b3b9c4');
        const bubble = (mine, y, w, lines) => {
          const X = mine ? 256 - 16 - w : 16;
          R(X, y, w, 18 + lines * 14, 14, mine ? '#3b82f6' : '#ffffff');
          for (let l = 0; l < lines; l++) R(X + 12, y + 11 + l * 14, (w - 24) * (l === lines - 1 ? 0.6 : 1), 6, 3, mine ? 'rgba(255,255,255,.85)' : '#c9ced8');
        };
        bubble(false, 90, 150, 2);
        bubble(true, 150, 120, 1);
        bubble(false, 190, 170, 3);
        bubble(true, 270, 130, 1);
        // mensaje enviado (destacado)
        const pop = clamp(extra.sent ?? 1);
        x.globalAlpha = pop; bubble(true, 330 + (1 - pop) * 20, 176, 2); x.globalAlpha = 1;
        // check de "visto" que no llega: dos marcas grises
        x.strokeStyle = '#9aa3b2'; x.lineWidth = 3;
        x.beginPath(); x.moveTo(206, 384); x.lineTo(212, 390); x.lineTo(222, 378); x.stroke();
        x.beginPath(); x.moveTo(214, 384); x.lineTo(220, 390); x.lineTo(230, 378); x.stroke();
        // barra de escritura vacía
        R(12, 470, 190, 36, 18, '#ffffff'); x.fillStyle = '#3b82f6'; x.beginPath(); x.arc(226, 488, 18, 0, 7); x.fill();
        // reloj superior (minutos que pasan, como barra que avanza)
        R(20, 8, 40, 7, 3, '#333'); R(196, 8, 40 * (0.4 + 0.6 * (1 - k * 0.5)), 7, 3, '#333');
      }
      tex.needsUpdate = true;
    },
  };
  g.userData.draw('feed', 0);
  return g;
}

// ---------- Reloj de pared ----------
export function makeClock() {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 16, 48), M.phys(0x2a2b30, { roughness: 0.35, metalness: 0.5 }));
  g.add(rim);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 48), M.std(0xd9d2c4, 0.6));
  face.rotation.x = Math.PI / 2; face.position.z = -0.01; g.add(face);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const tick = box(i % 3 === 0 ? 0.012 : 0.007, i % 3 === 0 ? 0.04 : 0.025, 0.004, M.std(0x26272b, 0.5), Math.sin(a) * 0.165, Math.cos(a) * 0.165, 0.003, g);
    tick.rotation.z = -a; tick.castShadow = false;
  }
  const hand = (len, w, col) => { const p = new THREE.Group(); const m = box(w, len, 0.004, M.std(col, 0.4), 0, len / 2 - 0.02, 0, p); m.castShadow = false; g.add(p); return p; };
  const hour = hand(0.11, 0.014, 0x1e1f23); hour.position.z = 0.006;
  const min = hand(0.16, 0.009, 0x1e1f23); min.position.z = 0.01;
  const sec = hand(0.17, 0.003, 0xd8402f); sec.position.z = 0.014;
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.02, 16), M.std(0xd8402f, 0.4)); pin.rotation.x = Math.PI / 2; pin.position.z = 0.016; g.add(pin);
  g.userData.set = (minutes) => {
    min.rotation.z = -(minutes / 60) * Math.PI * 2;
    hour.rotation.z = -(minutes / 720) * Math.PI * 2 - 0.9;
    sec.rotation.z = -(minutes * 60 / 60) * Math.PI * 2;
  };
  g.userData.set(12);
  return g;
}

// ---------- Apartamento ----------
// Sofá contra la pared del fondo (z = -2.45), ventana en la pared izquierda (x = -3.4).
export function buildApartment(opts = {}) {
  const root = new THREE.Group();
  const W = 7.2, D = 6.4, H = 2.9;
  const wood = woodTex().clone(); wood.needsUpdate = true; wood.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M.std(0xffffff, 0.55, 0, { map: wood }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; root.add(floor);
  const wallTex = noiseTex('wall', '#ddd2c4', 10, 256, 9);
  const wallMat = M.std(0xffffff, 0.92, 0, { map: wallTex });
  const accentMat = M.std(0x7b8f86, 0.9, 0, { map: noiseTex('wall2', '#c8c8c8', 12, 256, 4) });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), accentMat); back.position.set(0, H / 2, -D / 2); back.receiveShadow = true; root.add(back);
  // pared izquierda con hueco de ventana (4 paneles)
  const wz0 = -2.6, wz1 = 0.2, wy0 = 0.75, wy1 = 2.45;
  const leftPanels = [
    [(-D / 2 + wz0) / 2, H / 2, wz0 + D / 2, H],           // detrás de la ventana
    [(wz1 + D / 2) / 2, H / 2, D / 2 - wz1, H],              // delante
    [(wz0 + wz1) / 2, wy0 / 2, wz1 - wz0, wy0],              // bajo
    [(wz0 + wz1) / 2, (wy1 + H) / 2, wz1 - wz0, H - wy1],    // alto
  ];
  for (const [z, y, w, h] of leftPanels) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat); p.rotation.y = Math.PI / 2; p.position.set(-W / 2, y, z); p.receiveShadow = true; p.castShadow = true; root.add(p);
  }
  const right = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat); right.rotation.y = -Math.PI / 2; right.position.set(W / 2, H / 2, 0); right.receiveShadow = true; root.add(right);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M.std(0xf0ebe4, 0.95)); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; root.add(ceil);
  // zócalos
  const skirt = M.std(0xf4efe8, 0.6);
  box(W, 0.1, 0.02, skirt, 0, 0.05, -D / 2 + 0.01, root);
  box(0.02, 0.1, D, skirt, W / 2 - 0.01, 0.05, 0, root);

  // marco de ventana + parteluces + exterior luminoso
  const frameMat = M.std(0xf6f4f0, 0.4);
  const fw = 0.07;
  box(0.14, fw, wz1 - wz0 + fw, frameMat, -W / 2, wy0, (wz0 + wz1) / 2, root);
  box(0.14, fw, wz1 - wz0 + fw, frameMat, -W / 2, wy1, (wz0 + wz1) / 2, root);
  box(0.14, wy1 - wy0, fw, frameMat, -W / 2, (wy0 + wy1) / 2, wz0, root);
  box(0.14, wy1 - wy0, fw, frameMat, -W / 2, (wy0 + wy1) / 2, wz1, root);
  box(0.06, wy1 - wy0, 0.035, frameMat, -W / 2, (wy0 + wy1) / 2, (wz0 + wz1) / 2, root);
  box(0.06, 0.035, wz1 - wz0, frameMat, -W / 2, wy0 + (wy1 - wy0) * 0.62, (wz0 + wz1) / 2, root);
  box(0.3, 0.04, wz1 - wz0 + 0.2, frameMat, -W / 2 + 0.12, wy0 - 0.03, (wz0 + wz1) / 2, root); // alféizar
  const skyMat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#8fbfff'); gr.addColorStop(0.55, '#ffe2b8'); gr.addColorStop(1, '#ffc58a'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.fillStyle = 'rgba(80,110,90,.55)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(i * 20, 230 - Math.sin(i) * 20, 40, 0, 7); g.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), skyMat); sky.rotation.y = Math.PI / 2; sky.position.set(-W / 2 - 1.5, 1.8, -1.2); root.add(sky);
  // cortinas
  const curtainMat = M.phys(0xefe6d6, { roughness: 0.9, sheen: 0.5, sheenColor: new THREE.Color(0xffffff), transmission: 0.0, side: THREE.DoubleSide });
  for (const z of [wz0 - 0.25, wz1 + 0.25]) {
    const cg = new THREE.PlaneGeometry(0.5, 2.5, 16, 1);
    const p = cg.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 40) * 0.03);
    cg.computeVertexNormals();
    const cm = new THREE.Mesh(cg, curtainMat); cm.rotation.y = Math.PI / 2; cm.position.set(-W / 2 + 0.12, 1.4, z); cm.castShadow = true; root.add(cm);
  }

  // ---- sofá ----
  const sofa = new THREE.Group(); sofa.position.set(0, 0, -2.0); root.add(sofa);
  const sofaMat = M.phys(0xffffff, { map: fabricTex('sofa', '#4f6d5e'), roughness: 0.9, sheen: 0.8, sheenColor: new THREE.Color(0x9cc5b0), sheenRoughness: 0.6 });
  rbox(2.3, 0.25, 0.95, 0.06, sofaMat, 0, 0.22, 0, sofa);                 // base
  rbox(1.08, 0.16, 0.8, 0.07, sofaMat, -0.55, 0.42, 0.06, sofa);          // cojines asiento
  rbox(1.08, 0.16, 0.8, 0.07, sofaMat, 0.55, 0.42, 0.06, sofa);
  rbox(2.3, 0.62, 0.22, 0.08, sofaMat, 0, 0.62, -0.38, sofa);             // respaldo
  rbox(1.0, 0.42, 0.18, 0.08, sofaMat, -0.55, 0.72, -0.24, sofa).rotation.x = -0.12;
  rbox(1.0, 0.42, 0.18, 0.08, sofaMat, 0.55, 0.72, -0.24, sofa).rotation.x = -0.12;
  rbox(0.2, 0.5, 0.95, 0.08, sofaMat, -1.2, 0.45, 0, sofa);               // brazos
  rbox(0.2, 0.5, 0.95, 0.08, sofaMat, 1.2, 0.45, 0, sofa);
  const pillowMat = M.phys(0xe9b44c, { roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color(0xffe0a0) });
  const pil = rbox(0.38, 0.36, 0.12, 0.1, pillowMat, 0.95, 0.66, -0.12, sofa); pil.rotation.set(-0.2, -0.3, 0.15);
  for (const x of [-1.05, 1.05]) for (const z of [-0.35, 0.35]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.1, 8), M.std(0x2b1d14, 0.5)); l.position.set(x, 0.05, z); sofa.add(l); }

  // ---- mesa de centro + alfombra ----
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), M.std(0xffffff, 1, 0, { map: (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 360; const g = c.getContext('2d'); g.fillStyle = '#d9cbb5'; g.fillRect(0, 0, 512, 360); g.strokeStyle = '#b9a385'; g.lineWidth = 10; g.strokeRect(20, 20, 472, 320); g.lineWidth = 4; g.strokeRect(40, 40, 432, 280); const r = rng(5); for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.05})`; g.fillRect(r() * 512, r() * 360, 2, 2); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.005, -0.9); rug.receiveShadow = true; root.add(rug);
  const table = new THREE.Group(); table.position.set(0, 0, -0.85); root.add(table);
  const oak = M.std(0xffffff, 0.45, 0, { map: woodTex() });
  rbox(1.15, 0.05, 0.6, 0.02, oak, 0, 0.42, 0, table);
  for (const x of [-0.5, 0.5]) for (const z of [-0.24, 0.24]) box(0.04, 0.4, 0.04, M.std(0x2a2522, 0.4), x, 0.2, z, table);
  // objetos sobre la mesa
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 24), M.phys(0xe8e2d6, { roughness: 0.3, clearcoat: 0.6 })); mug.position.set(-0.32, 0.5, 0.05); mug.castShadow = true; table.add(mug);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 8, 16), mug.material); handle.position.set(-0.37, 0.5, 0.05); table.add(handle);
  rbox(0.24, 0.03, 0.32, 0.005, M.std(0xc0533f, 0.7), 0.3, 0.46, -0.05, table).rotation.y = 0.25; // libro
  rbox(0.22, 0.025, 0.3, 0.005, M.std(0x3d5a80, 0.7), 0.31, 0.485, -0.06, table).rotation.y = 0.1;
  const tablePhoneSpot = v3(0.05, 0.452, -0.85 + 0.12);

  // ---- lámpara de pie ----
  const lamp = new THREE.Group(); lamp.position.set(1.7, 0, -2.4); root.add(lamp);
  box(0.03, 1.55, 0.03, M.std(0x222222, 0.3, 0.8), 0, 0.78, 0, lamp);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.03, 32), M.std(0x222222, 0.3, 0.8)); base.position.y = 0.015; lamp.add(base);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.25, 0.3, 32, 1, true), M.phys(0xf3e6cc, { roughness: 0.8, side: THREE.DoubleSide, emissive: 0xffc27a, emissiveIntensity: 0.6 }));
  shade.position.y = 1.6; lamp.add(shade);
  const lampLight = new THREE.PointLight(0xffb36b, 3.5, 6, 2); lampLight.position.set(0, 1.5, 0); lamp.add(lampLight);

  // ---- planta ----
  const plant = new THREE.Group(); plant.position.set(-1.65, 0, -2.45); root.add(plant);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.42, 24), M.phys(0xd7cfc2, { roughness: 0.5 })); pot.position.y = 0.21; plant.add(pot);
  const leafMat = M.phys(0x3f7d4a, { roughness: 0.6, side: THREE.DoubleSide, sheen: 0.3, sheenColor: new THREE.Color(0xb6f0a0) });
  const rr = rng(21);
  for (let i = 0; i < 16; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), leafMat); leaf.scale.set(0.35, 1.2, 0.08);
    const a = rr() * Math.PI * 2, tilt = 0.3 + rr() * 0.6;
    const stem = new THREE.Group(); stem.position.y = 0.42; stem.rotation.set(Math.cos(a) * tilt, 0, Math.sin(a) * tilt); plant.add(stem);
    leaf.position.y = 0.25 + rr() * 0.35; leaf.rotation.y = a; stem.add(leaf);
  }

  // ---- estantería + cuadros en la pared del fondo ----
  const shelfMat = M.std(0xffffff, 0.5, 0, { map: woodTex() });
  box(1.3, 0.04, 0.25, shelfMat, -0.6, 1.75, -D / 2 + 0.13, root);
  const bookCols = [0xc0533f, 0x3d5a80, 0xe9b44c, 0x6a8d73, 0x8d6a9f, 0xd8d2c4];
  for (let i = 0; i < 9; i++) { const h = 0.18 + rr() * 0.1; box(0.045, h, 0.17, M.std(bookCols[i % 6], 0.7), -1.15 + i * 0.05, 1.77 + h / 2, -D / 2 + 0.13, root); }
  const vase = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 16), M.phys(0x2f4858, { roughness: 0.2, clearcoat: 1 })); vase.scale.y = 1.3; vase.position.set(-0.2, 1.87, -D / 2 + 0.13); root.add(vase);
  const frame = (w, h, x, y, col, col2) => {
    rbox(w, h, 0.03, 0.006, M.std(0x1d1d1f, 0.4), x, y, -D / 2 + 0.02, root);
    const c = document.createElement('canvas'); c.width = 128; c.height = 160; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 128, 160); gr.addColorStop(0, col); gr.addColorStop(1, col2); g.fillStyle = gr; g.fillRect(0, 0, 128, 160); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(80, 60, 24, 0, 7); g.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const art = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.08, h - 0.08), M.std(0xffffff, 0.8, 0, { map: t })); art.position.set(x, y, -D / 2 + 0.04); root.add(art);
  };
  frame(0.5, 0.65, 0.55, 1.45, '#f2a65a', '#c0533f');
  frame(0.38, 0.38, 1.05, 1.62, '#5bc0eb', '#3d5a80');
  const clock = makeClock(); clock.position.set(1.15, 2.18, -D / 2 + 0.04); root.add(clock);

  // ---- iluminación ----
  const sun = keyLight(0xffd2a1, 4.2, v3(-9, 5.2, 0.4), v3(0, 0.6, -1.6), 4.5);
  root.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x8a6a50, 0.55); root.add(hemi);
  const fill = new THREE.PointLight(0xbfd3ff, 1.2, 9, 2); fill.position.set(1.8, 2.2, 1.5); root.add(fill);
  const bounce = new THREE.PointLight(0xffc89a, 0.8, 4, 2); bounce.position.set(-1.0, 0.4, -0.8); root.add(bounce);

  // haz de luz volumétrico que entra por la ventana
  const beamMat = new THREE.ShaderMaterial({ // haz suave
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { color: { value: new THREE.Color(0xffd7a8) }, strength: { value: 0.08 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 color; uniform float strength; varying vec2 vUv; void main(){ float a = smoothstep(0.,.25,vUv.x)*smoothstep(1.,.75,vUv.x)*(1.-vUv.y*.85); gl_FragColor=vec4(color*a*strength,1.); }`,
  });
  const beams = new THREE.Group(); root.add(beams);
  for (let i = 0; i < 3; i++) {
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 4.5), beamMat);
    bm.position.set(-1.5, 1.2, -1.3 + (i - 1) * 0.55);
    bm.rotation.set(0, Math.PI / 2 + 0.2 * (i - 1), -1.03);
    beams.add(bm);
  }
  const dust = dustField(260, new THREE.Box3(v3(-3.2, 0.3, -2.8), v3(0.5, 2.6, 0.4)), 0xffe2bf, 0.018, 8, 0.5);
  root.add(dust);

  setEnvIntensity(root, 0.45);

  return {
    root, sun, hemi, fill, lampLight, bounce, beamMat, dust, clock, sofa, table, tablePhoneSpot, sky, shade,
    /** day: 1 = día cálido; worry: oscurece y enfría; dusk: tarde anaranjada */
    setMood({ warm = 1, dim = 0, dusk = 0 } = {}) {
      const k = 1 - dim * 0.55;
      sun.intensity = 4.2 * k * (1 - dusk * 0.25);
      sun.color.setRGB(1, lerp(0.82, 0.62, dusk), lerp(0.63, 0.38, dusk)).lerp(new THREE.Color(0.75, 0.8, 1.0), dim * 0.5);
      hemi.intensity = 0.55 * (1 - dim * 0.4);
      beamMat.uniforms.strength.value = 0.08 * k * (1 - dusk * 0.2);
      beamMat.uniforms.color.value.copy(sun.color);
      lampLight.intensity = 3.5 * warm + dusk * 2;
      fill.intensity = 1.2 * (1 - dim * 0.3);
      skyMat.color.setScalar(1 - dim * 0.4);
    },
  };
}
