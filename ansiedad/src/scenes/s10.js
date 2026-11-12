// ESCENA 10 — La ciencia del tratamiento (77.0–86.0 s)
// De la luz cálida de una lámpara de escritorio la cámara revela una consulta: terapeuta y paciente conversan frente
// a frente. Sobre la mesa aparecen tres objetos: una burbuja de pensamiento, una lupa (examinar interpretaciones) y
// una escalera (afrontar poco a poco, dentro de un tratamiento). La cámara rodea los objetos y vuelve a ellos.
// Sin "cura instantánea": él se va relajando gradualmente. La escalera se ilumina como un camino (→ escena 11).
import * as THREE from 'three';
import { Character, POSES, P, makeHero, M, box, rbox, glow, glowTex, v3, ramp, aim, lerp, noise1, smoother, easeInOut, easeOut, easeOutBack, track, setEnvIntensity } from '../shared.js';

function armchair(color) {
  const g = new THREE.Group(); const m = M.phys(color, { roughness: 0.8, sheen: 0.6, sheenColor: new THREE.Color(0xffffff) });
  rbox(0.7, 0.18, 0.62, 0.07, m, 0, 0.36, 0, g);
  rbox(0.7, 0.62, 0.16, 0.07, m, 0, 0.68, -0.27, g);
  rbox(0.13, 0.3, 0.62, 0.06, m, -0.32, 0.55, 0, g); rbox(0.13, 0.3, 0.62, 0.06, m, 0.32, 0.55, 0, g);
  for (const [x, z] of [[-0.28, -0.24], [0.28, -0.24], [-0.28, 0.24], [0.28, 0.24]]) box(0.04, 0.27, 0.04, M.std(0x5a3e2a, 0.5), x, 0.135, z, g);
  return g;
}

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a2018);
  // ---- consulta ----
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), M.std(0x9a7656, 0.7)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.5, 64), M.phys(0xd9c2a0, { roughness: 1, sheen: 1, sheenColor: new THREE.Color(0xffffff) })); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.005; rug.receiveShadow = true; scene.add(rug);
  const wallM = M.std(0xcdb79a, 0.9);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), wallM); back.position.set(0, 1.6, -2.0); back.receiveShadow = true; scene.add(back);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), wallM); side.position.set(-2.8, 1.6, 0); side.rotation.y = Math.PI / 2; scene.add(side);
  // estantería y planta
  const shelf = new THREE.Group(); shelf.position.set(-1.6, 0, -1.8); scene.add(shelf);
  rbox(1.1, 1.7, 0.32, 0.02, M.std(0x8a5e3c, 0.6), 0, 0.85, 0, shelf);
  const bookCols = [0x3c6e8f, 0xd2557e, 0xe0a030, 0x4a8a6a, 0x7a5aa0];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) box(0.09, 0.26 + (i % 3) * 0.03, 0.22, M.std(bookCols[(i + r) % 5], 0.7), -0.42 + i * 0.13, 0.42 + r * 0.5, 0.03, shelf);
  const pot = rbox(0.3, 0.32, 0.3, 0.06, M.std(0xc8774a, 0.6), 1.9, 0.16, -1.6, scene);
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.7, 5), M.std(0x3e7a44, 0.7)); l.position.set(1.9 + Math.sin(i * 2.4) * 0.08, 0.6, -1.6 + Math.cos(i * 2.4) * 0.08); l.rotation.set(Math.cos(i * 2.4) * 0.4, 0, -Math.sin(i * 2.4) * 0.4); scene.add(l); }
  // sillones y mesa baja
  const chA = armchair(0x3c6e8f); chA.position.set(0, 0, 0.95); chA.rotation.y = Math.PI; scene.add(chA);
  const chB = armchair(0xc8a060); chB.position.set(0, 0, -0.95); chB.rotation.y = 0; scene.add(chB);
  const table = new THREE.Group(); scene.add(table);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 48), M.std(0xf2eadc, 0.45)); top.position.y = 0.48; top.castShadow = top.receiveShadow = true; table.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 0.46, 24), M.std(0x5a3e2a, 0.5)); leg.position.y = 0.23; table.add(leg);
  // lámpara de escritorio (la luz cálida que viene de la alarma)
  const deskS = new THREE.Group(); deskS.position.set(1.35, 0, -1.45); deskS.rotation.y = -0.4; scene.add(deskS);
  rbox(0.8, 0.05, 0.45, 0.02, M.std(0x8a5e3c, 0.6), 0, 0.72, 0, deskS);
  for (const x of [-0.35, 0.35]) box(0.04, 0.7, 0.4, M.std(0x6a4a30, 0.6), x, 0.35, 0, deskS);
  const lampHead = new THREE.Group(); lampHead.position.set(-0.15, 1.12, 0.05); deskS.add(lampHead);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.13, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xffb054, roughness: 0.5, side: THREE.DoubleSide, emissive: 0xff9a3a, emissiveIntensity: 0.4 })); lampHead.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 1.7, 0.8) })); bulb.position.y = -0.05; lampHead.add(bulb);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8), M.std(0x2a2a2a, 0.4, 0.6)); stem.position.set(-0.15, 0.93, 0.05); deskS.add(stem);
  const lampGlow = glow(0xffb054, 0.5, 0.45); lampGlow.position.y = -0.06; lampHead.add(lampGlow);
  const lampL = new THREE.PointLight(0xffb468, 2.2, 5, 2); lampL.position.y = -0.08; lampHead.add(lampL);

  // ---- personajes ----
  const hero = makeHero(); scene.add(hero.root);
  const th = new Character({ seed: 5, shirt: 0x4a8a84, pants: 0x3a3a44, hair: 0xb9b4ac, hairStyle: 'tall', skin: 0xc99a7a, iris: 0x3a3a3a }); scene.add(th.root);
  [hero, th].forEach(c => c.root.traverse(o => { if (o.isMesh) o.castShadow = true; }));

  // ---- objetos simbólicos ----
  const objs = new THREE.Group(); objs.position.y = 0.5; scene.add(objs);
  // 1) burbuja de pensamiento
  const bub = new THREE.Group(); bub.position.set(-0.13, 0.13, 0.08); objs.add(bub);
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xbfd8ff, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.45, emissive: 0x6a8cff, emissiveIntensity: 0.25 });
  [[0, 0.04, 0, 0.075], [0.06, 0.06, 0.01, 0.055], [-0.06, 0.05, -0.01, 0.05], [0.0, 0.09, 0.0, 0.05], [0.05, -0.05, 0.02, 0.022], [0.07, -0.09, 0.02, 0.013]].forEach(([x, y, z, r]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), glassM); s.position.set(x, y, z); bub.add(s); });
  const thought = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), M.emit(0xff8a3a, 2.2)); thought.position.y = 0.05; bub.add(thought);
  // 2) lupa
  const mag = new THREE.Group(); objs.add(mag);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.009, 12, 48), M.std(0xc0a060, 0.25, 0.9)); mag.add(ring);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.058, 32), new THREE.MeshPhysicalMaterial({ color: 0xe8f4ff, roughness: 0, transparent: true, opacity: 0.3, clearcoat: 1, side: THREE.DoubleSide })); mag.add(lens);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.1, 12), M.std(0x5a3424, 0.5)); handle.position.set(0, -0.11, 0); mag.add(handle);
  // 3) escalera con una pequeña figura que sube
  const stairs = new THREE.Group(); stairs.position.set(0.12, 0, -0.06); stairs.rotation.y = 0.9; objs.add(stairs);
  const stepMs = [];
  for (let i = 0; i < 5; i++) { const m = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.5, emissive: 0xffb054, emissiveIntensity: 0 }); stepMs.push(m); const s = rbox(0.07, 0.03 + i * 0.03, 0.09, 0.008, m, i * 0.055, (0.03 + i * 0.03) / 2, 0, stairs); }
  const fig = new THREE.Group(); stairs.add(fig);
  const figM = M.emit(0x7ab8ff, 1.6);
  const fb = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.025, 4, 8), figM); fb.position.y = 0.025; fig.add(fb);
  const fh = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 8), figM); fh.position.y = 0.06; fig.add(fh);
  const stairGlow = glow(0xffb054, 0.5, 0); stairGlow.position.set(0.12, 0.1, 0); stairs.add(stairGlow);

  const key = new THREE.DirectionalLight(0xfff0dc, 1.5); key.position.set(-2, 4, 3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 }); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xfff4e4, 0x6a5040, 0.4));
  setEnvIntensity(scene, 0.35);
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.01, 60);
  const lampW = new THREE.Vector3();

  return {
    scene, camera,
    update(t) {
      // ---- personajes: el terapeuta habla con gestos tranquilos; él escucha y se relaja poco a poco ----
      const talk = 0.5 + 0.5 * Math.sin(t * 2.2);
      th.setPose({ ...POSES.sit, x: 0, z: -0.92, ry: 0, ...P.gestureA, rFlex: 0.45 + talk * 0.25, rElb: 1.1 + talk * 0.3, rAbd: 0.25, lFlex: 0.3, lElb: 0.9, spineX: 0.05, headX: 0.08, headY: noise1(t * 0.5, 3) * 0.15 });
      th.setExpr({ smile: 0.35, worry: 0, eyeOpen: 0.95, mouthOpen: Math.max(0, Math.sin(t * 11)) * 0.18 * (t < 6.5 ? 1 : 0.4), gazeX: 0 });
      th.apply(t + 5);
      const relax = ramp(t, 1.5, 8.5);
      const nod = t > 6.6 ? Math.sin((t - 6.6) * 5) * 0.08 * (1 - ramp(t, 7.6, 8.0)) : 0;
      hero.setPose({ ...POSES.sit, x: 0, z: 0.92, ry: Math.PI, lFlex: 0.32, lElb: 0.95, lAbd: 0.16, rFlex: 0.32, rElb: 0.95, rAbd: 0.16, spineX: lerp(0.12, -0.04, relax), headX: 0.12 + nod - relax * 0.06, breathRate: lerp(0.4, 0.22, relax), breath: lerp(1, 0.6, relax) });
      hero.setExpr({ worry: lerp(0.6, 0.15, relax), smile: lerp(-0.1, 0.3, relax), eyeOpen: 1, gazeY: t > 2 && t < 6.6 ? -0.45 : 0, gazeX: 0 });
      hero.apply(t + 77);

      // ---- objetos ----
      const pop = i => easeOutBack(ramp(t, 1.6 + i * 0.35, 2.1 + i * 0.35, k => k));
      bub.scale.setScalar(Math.max(0.001, pop(0))); mag.scale.setScalar(Math.max(0.001, pop(1))); stairs.scale.setScalar(Math.max(0.001, pop(2)));
      thought.rotation.set(t, t * 1.3, 0);
      // la lupa examina la burbuja (3.3–4.8) y luego se aparta
      const ex = ramp(t, 3.2, 3.8, easeInOut) * (1 - ramp(t, 4.7, 5.2, easeInOut));
      const magHome = v3(-0.2, 0.12, -0.16);
      const magEx = bub.position.clone().add(v3(0.03 + Math.sin(t * 2) * 0.02, 0.05, 0.11));
      mag.position.copy(magHome).lerp(magEx, ex);
      mag.rotation.set(lerp(-0.2, -0.35, ex), lerp(0.6, 0, ex), lerp(0.4, 0.2, ex));
      thought.material.emissive.setHex(0xff8a3a).lerp(new THREE.Color(0x7ab8ff), ramp(t, 4.0, 4.8));   // la interpretación se revisa
      // la figura sube un peldaño cada vez, con pausas (gradual)
      const climb = Math.min(4, Math.max(0, (t - 4.8) / 0.55));
      const stepI = Math.floor(climb), stepF = smoother(Math.min(1, (climb - stepI) * 1.8));
      const sx = stepI * 0.055 + stepF * 0.055, sy = 0.03 + stepI * 0.03 + stepF * 0.03 + Math.sin(stepF * Math.PI) * 0.025;
      fig.position.set(Math.min(4, climb) >= 4 ? 4 * 0.055 : sx, t < 4.8 ? 0.03 : sy, 0);
      fig.visible = t > 2.4;
      const endGlow = ramp(t, 8.0, 9.0);
      stepMs.forEach((m, i) => { m.emissiveIntensity = Math.max(climb > i ? 0.25 : 0, endGlow * 0.7 * ramp(t, 8.0 + i * 0.1, 8.3 + i * 0.1)); });
      stairGlow.material.opacity = endGlow * 0.45; stairGlow.scale.setScalar(0.35 + endGlow * 0.5);

      // ---- cámara ----
      lampHead.getWorldPosition(lampW);
      const tc = v3(0, 0.6, 0);
      let pos, tgt, focusP;
      if (t < 2.0) {
        const k = ramp(t, -0.2, 2.0, easeInOut);
        pos = lampW.clone().add(v3(-0.2, -0.06, 0.45)).lerp(v3(1.25, 1.6, 2.3), k);
        tgt = lampW.clone().lerp(v3(-0.05, 0.85, -0.2), ramp(t, 0.2, 1.8, easeInOut));
        focusP = k < 0.5 ? lampW : tc;
      } else if (t < 6.6) {
        const k = ramp(t, 2.0, 6.6, easeInOut);
        const a = lerp(2.2, 0.9, k), R = lerp(1.2, 1.05, k);
        pos = v3(Math.sin(a) * R, lerp(1.05, 0.95, k), Math.cos(a) * R);
        const pB = bub.getWorldPosition(new THREE.Vector3()), pS = stairs.getWorldPosition(new THREE.Vector3()).add(v3(0.08, 0.06, -0.06));
        focusP = t < 4.8 ? pB : pS;
        tgt = pB.clone().lerp(pS, ramp(t, 4.4, 5.2, easeInOut));
        const start = v3(1.25, 1.6, 2.3), bl = ramp(t, 2.0, 2.8, easeInOut);
        pos = start.clone().lerp(pos, bl); tgt = v3(-0.05, 0.85, -0.2).lerp(tgt, bl);
      } else {
        const k = ramp(t, 6.6, 7.6, easeInOut);
        const a1 = 0.9, from = v3(Math.sin(a1) * 1.05, 0.95, Math.cos(a1) * 1.05);
        pos = from.lerp(v3(1.1, 1.55, 2.2), k); tgt = tc.clone().lerp(v3(-0.05, 0.95, -0.25), k);
        focusP = th.headPos();
        const sw = stairs.getWorldPosition(new THREE.Vector3());
        const pk = ramp(t, 8.0, 9.1, easeInOut);
        pos.lerp(sw.clone().add(v3(0.05, 0.3, 0.6)), pk); tgt.lerp(sw.clone().add(v3(0.1, 0.06, 0)), pk);
        if (pk > 0.3) focusP = sw;
      }
      pos.add(v3(noise1(t * 0.6, 101) * 0.005, noise1(t * 0.6, 102) * 0.005, 0));
      aim(camera, pos, tgt, 38);
      return { focus: pos.distanceTo(focusP), aperture: 1.6, maxBlur: 0.014, exposure: 0.86, saturation: 1.08, contrast: 1.1, tint: [1.03, 1.0, 0.95], bloom: 0.5 + endGlow * 0.2, bloomThreshold: 1.2, vignette: 0.32 };
    },
  };
}
