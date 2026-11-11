// ESCENA 06 — Muchos futuros posibles (47.9–61.4 s)
// Espacio surrealista con tres puertas: conversación tranquila / discusión imaginaria / habitación vacía.
import * as THREE from 'three';
import { setEnvIntensity } from '../sets.js';
import { Character } from '../character.js';
import { M, rbox, box, v3, ramp, aim, lerp, noise1, smoother, easeInOut, track } from '../lib.js';
import { makeHero, makeFriend, mindSpace, P, glow, tintCharacter } from '../common.js';

function room(color, intensity) {
  const g = new THREE.Group();
  const wm = M.phys(0x2a2440, { roughness: 0.7 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.2), M.phys(0x1c1830, { roughness: 0.35, clearcoat: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.012, -1.6); fl.receiveShadow = true; g.add(fl);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.8), wm); back.position.set(0, 1.4, -3.2); g.add(back);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.8), wm); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 1.3, 1.4, -1.6); g.add(w); }
  const l = new THREE.PointLight(color, intensity, 5, 1.8); l.position.set(0, 2.3, -1.6); g.add(l);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), M.emit(color, 4)); lamp.position.set(0, 2.5, -1.6); g.add(lamp);
  return { g, l };
}

export function create() {
  const scene = new THREE.Scene();
  const env = mindSpace(scene, { top: 0x0d0828, mid: 0x3b2470, bottom: 0x090514, fog: 0x1c1038, fogDensity: 0.03 });
  const doorsX = [-2.1, 0, 2.1], DZ = -3.2;
  const frameM = M.phys(0xe9e2ff, { roughness: 0.25, metalness: 0.3, clearcoat: 1 });
  const colors = [0xffb46a, 0xff3b4a, 0x6a8cff];
  const rooms = [], leaves = [];
  // pared negra flotante en la que están las puertas (con huecos)
  const wallM = M.phys(0x120c22, { roughness: 0.6 });
  const W = 7.2, H = 3.2, dw = 1.1, dh = 2.25;
  const segX = [-3.6, -2.65, -1.55, -0.55, 0.55, 1.55, 2.65, 3.6];
  for (let i = 0; i < segX.length - 1; i += 2) { const w = segX[i + 1] - segX[i]; box(w, H, 0.15, wallM, (segX[i] + segX[i + 1]) / 2, H / 2, DZ, scene); }
  for (const x of doorsX) box(dw, H - dh, 0.15, wallM, x, dh + (H - dh) / 2, DZ, scene);
  doorsX.forEach((x, i) => {
    const f = new THREE.Group(); f.position.set(x, 0, DZ + 0.09); scene.add(f);
    rbox(0.08, dh + 0.08, 0.12, 0.02, frameM, -dw / 2 - 0.04, dh / 2, 0, f); rbox(0.08, dh + 0.08, 0.12, 0.02, frameM, dw / 2 + 0.04, dh / 2, 0, f);
    rbox(dw + 0.16, 0.08, 0.12, 0.02, frameM, 0, dh + 0.04, 0, f);
    const glowLine = new THREE.Mesh(new THREE.BoxGeometry(dw, 0.02, 0.02), M.emit(colors[i], 3)); glowLine.position.set(0, 0.01, 0.05); f.add(glowLine);
    const hinge = new THREE.Group(); hinge.position.set(-dw / 2, 0, 0); f.add(hinge);
    const leaf = rbox(dw - 0.02, dh - 0.02, 0.05, 0.015, M.phys(0xd8d0f0, { roughness: 0.3, clearcoat: 1 }), dw / 2, dh / 2, 0, hinge);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), M.std(0xffd27a, 0.2, 1)); knob.position.set(dw - 0.12, 1.05, 0.05); hinge.add(knob);
    leaves.push(hinge);
    const rm = room(colors[i], i === 2 ? 1.0 : 2.4); rm.g.position.set(x, 0, DZ); scene.add(rm.g); rooms.push(rm);
    const halo = glow(colors[i], 2.8, 0.25); halo.position.set(x, 1.1, DZ - 0.6); scene.add(halo);
  });
  // habitación 1: conversación tranquila (sentados, sonrientes)
  const a1 = makeHero(), b1 = makeFriend(); [a1, b1].forEach(c => { tintCharacter(c, 0xffb46a, 0.12); scene.add(c.root); });
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32), M.phys(0xc9a27a, { roughness: 0.4 })); table.position.set(doorsX[0], 0.72, DZ - 1.8); scene.add(table);
  box(0.05, 0.7, 0.05, M.std(0x333333, 0.4), doorsX[0], 0.35, DZ - 1.8, scene);
  for (const s of [-1, 1]) { const st = rbox(0.4, 0.45, 0.4, 0.04, M.phys(0x6a4a8a, { roughness: 0.7 }), doorsX[0] + s * 0.42, 0.225, DZ - 1.8 - s * 0.46, scene); }
  const mugs = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 16), M.phys(0xffffff, { roughness: 0.3 })); m.position.set(doorsX[0] + s * 0.15, 0.785, DZ - 1.8); scene.add(m); return m; });
  // habitación 2: discusión imaginaria (de pie, gestos bruscos)
  const a2 = makeHero(), b2 = makeFriend(); [a2, b2].forEach(c => { tintCharacter(c, 0xff2a3a, 0.18); scene.add(c.root); });
  // habitación 3: vacía (silla sola)
  const chair = new THREE.Group(); chair.position.set(doorsX[2], 0, DZ - 2.0); chair.rotation.y = 0.5; scene.add(chair);
  rbox(0.45, 0.06, 0.45, 0.02, M.phys(0x8a8ab0, { roughness: 0.5 }), 0, 0.45, 0, chair); rbox(0.45, 0.5, 0.05, 0.02, M.phys(0x8a8ab0, { roughness: 0.5 }), 0, 0.72, -0.2, chair);
  for (const x of [-0.19, 0.19]) for (const z of [-0.19, 0.19]) box(0.035, 0.45, 0.035, M.std(0x555566, 0.4), x, 0.225, z, chair);

  const hero = makeHero(); scene.add(hero.root);
  const key = new THREE.SpotLight(0xd8ccff, 40, 14, 0.5, 0.6, 1.5); key.position.set(1.5, 5, 3.5); key.target.position.set(0, 1, 0.6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key, key.target);
  const rimL = new THREE.PointLight(0xff8a4a, 3, 6, 2); rimL.position.set(-2.5, 1.8, -1.5); scene.add(rimL);
  const rimR = new THREE.PointLight(0x5a7aff, 3, 6, 2); rimR.position.set(2.5, 1.8, -1.5); scene.add(rimR);
  scene.add(new THREE.HemisphereLight(0x7a6aff, 0x100820, 0.45));
  setEnvIntensity(scene, 0.12);
  const camera = new THREE.PerspectiveCamera(40, 9 / 16, 0.05, 90);

  const HZ = 0.6;
  const camTrack = track([
    [0.0, [0, 1.55, 5.6, 0, 1.25, -3]],          // plano general simétrico
    [2.4, [0, 1.5, 4.4, 0, 1.25, -3]],
    [4.6, [-2.2, 1.55, 2.0, 0.0, 1.3, HZ]],      // travelling circular alrededor del personaje
    [5.6, [-2.6, 1.45, 0.2, 0.0, 1.45, HZ]],
    [6.6, [-2.1, 1.35, -1.6, -2.1, 1.1, -5.0]],  // atraviesa la puerta 1
    [7.9, [-2.1, 1.3, -3.35, -2.1, 0.95, -5.0]],
    [8.3, [-1.4, 1.4, -3.5, 0.0, 1.1, -5.1]],  // desplazamiento lateral por detrás de las puertas
    [9.6, [0.0, 1.45, -3.45, 0.0, 1.15, -4.9]],    // escena 2: discusión
    [10.4, [1.0, 1.45, -3.6, 2.1, 1.0, -5.2]],
    [11.2, [2.1, 1.4, -3.7, 2.1, 0.8, -5.2]],    // escena 3: habitación vacía
    [12.0, [2.1, 1.45, -1.6, 0.4, 1.35, 0.6]],
    [13.6, [0.0, 1.6, 4.6, 0.0, 1.3, -1]],       // dolly-out de regreso al protagonista
  ], easeInOut);

  return {
    scene, camera,
    update(t) {
      env.update(t + 50);
      leaves.forEach((h, i) => { h.rotation.y = -lerp(0.15, 1.35, ramp(t, 0.6 + i * 0.35, 2.2 + i * 0.35)); });
      // protagonista frente a las puertas
      const look = t < 5 ? Math.sin(t * 0.9) * 0.5 : t < 11.5 ? 0 : Math.sin(t * 1.5) * 0.3;
      hero.setPose({ z: HZ, ry: Math.PI, headY: look, spineX: 0.02, lFlex: 0.05, rFlex: 0.05, neckX: -0.03 });
      hero.setExpr({ smile: -0.05, worry: 0.6, eyeOpen: 1.05, gazeX: look * 0.6 });
      hero.apply(t + 48);
      // conversación tranquila
      const x1 = doorsX[0], z1 = DZ - 1.8;
      const talkA = Math.sin(t * 2.2) > 0;
      a1.setPose({ ...P.sit, x: x1 - 0.38, z: z1 + 0.42, ry: Math.PI * 0.75, rFlex: 0.5 + (talkA ? Math.sin(t * 5) * 0.12 : 0), rElb: 1.2, headZ: 0.05 });
      a1.setExpr({ smile: 0.6, worry: 0, eyeOpen: 1, mouthOpen: talkA ? Math.abs(Math.sin(t * 11)) * 0.5 : 0 }); a1.apply(t);
      b1.setPose({ ...P.sit, x: x1 + 0.38, z: z1 - 0.42, ry: -Math.PI * 0.25, lFlex: 0.5 + (!talkA ? Math.sin(t * 5) * 0.12 : 0), lElb: 1.2, headZ: -0.05 });
      b1.setExpr({ smile: 0.7, worry: 0, eyeOpen: 0.9, mouthOpen: !talkA ? Math.abs(Math.sin(t * 10)) * 0.5 : 0 }); b1.apply(t + 1);
      // discusión
      const x2 = doorsX[1], z2 = DZ - 1.7;
      const jab = Math.max(0, Math.sin(t * 6));
      a2.setPose({ x: x2 - 0.32, z: z2 + 0.38, ry: Math.PI * 0.75, ...P.gestureA, rFlex: 0.6 + jab * 0.5, rElb: 1.4 - jab * 0.8, spineX: 0.1, headX: -0.05 });
      a2.setExpr({ smile: -0.6, anger: 1, worry: 0, eyeOpen: 0.85, mouthOpen: jab * 0.7 }); a2.apply(t);
      b2.setPose({ x: x2 + 0.32, z: z2 - 0.38, ry: -Math.PI * 0.25, lFlex: 0.6 + (1 - jab) * 0.6, lElb: 1.3, lAbd: 0.4, rFlex: 0.4, rElb: 1.6, rAbd: 0.5, spineX: -0.05 });
      b2.setExpr({ smile: -0.6, anger: 1, worry: 0, eyeOpen: 0.85, mouthOpen: (1 - jab) * 0.6 }); b2.apply(t + 2);
      rooms[1].l.intensity = 5 + Math.sin(t * 12) * 1.5;

      const c = camTrack(t);
      const pos = v3(c[0], c[1], c[2]).add(v3(noise1(t * 0.6, 41) * 0.012, noise1(t * 0.6, 42) * 0.012, 0)), tgt = v3(c[3], c[4], c[5]);
      aim(camera, pos, tgt, 40);
      const inRooms = ramp(t, 6.2, 6.8) * (1 - ramp(t, 11.4, 12.0));
      const heroD = pos.distanceTo(v3(0, 1.4, HZ));
      return { focus: lerp(heroD, 1.9, inRooms), aperture: 1.4, maxBlur: 0.014, exposure: 0.95, saturation: 1.12, contrast: 1.1, tint: [1.0, 0.96, 1.06], bloom: 0.7, bloomThreshold: 0.9, vignette: 0.45, ca: 0.0025 };
    },
  };
}
