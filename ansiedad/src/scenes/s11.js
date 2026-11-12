// ESCENA 11 — Comprender la respuesta (86.0–94.6 s)
// Camina por un sendero iluminado. A los lados flotan pequeñas representaciones de escenas anteriores (corazón,
// cerebro, arbusto, reloj, burbuja, escalera); las observa al pasar y se desvanecen progresivamente.
// Tracking frontal → órbita suave → la cámara le adelanta y atraviesa una puerta hacia el apartamento.
import * as THREE from 'three';
import { setEnvIntensity, Character, walkPose, makeHero, makeClock, mindSpace, M, rbox, glow, heartGeo, brainGeo, brainMaterial, v3, ramp, aim, lerp, noise1, smoother, easeInOut, easeIn, rng } from '../shared.js';

export function create() {
  const scene = new THREE.Scene();
  const env = mindSpace(scene, { top: 0x0a1030, mid: 0x3a3a7a, bottom: 0x0a0a18, fog: 0x2a2a58, fogDensity: 0.05, floor: 0x10122a });
  // sendero de losas luminosas
  const tiles = [];
  for (let i = 0; i < 24; i++) {
    const m = new THREE.MeshStandardMaterial({ color: 0xf6e6c8, roughness: 0.4, emissive: 0xffb860, emissiveIntensity: 0.1 });
    const tl = rbox(0.7, 0.05, 0.42, 0.04, m, (i % 2) * 0.04 - 0.02, 0.025, 4.5 - i * 0.48, scene); tiles.push({ tl, m, z: 4.5 - i * 0.48 });
  }
  // puerta al final del camino con la luz cálida del apartamento
  const door = new THREE.Group(); door.position.set(0, 0, -5.2); scene.add(door);
  const fm = M.std(0xf2ece2, 0.5);
  rbox(0.12, 2.3, 0.18, 0.03, fm, -0.62, 1.15, 0, door); rbox(0.12, 2.3, 0.18, 0.03, fm, 0.62, 1.15, 0, door); rbox(1.36, 0.12, 0.18, 0.03, fm, 0, 2.3, 0, door);
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 2.24), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.9, 1.45, 1.0) })); portal.position.set(0, 1.12, -0.02); door.add(portal);
  const doorGlow = glow(0xffcf90, 2.5, 0.25); doorGlow.position.set(0, 1.2, 0.1); door.add(doorGlow);
  const doorL = new THREE.PointLight(0xffc080, 4, 6, 2); doorL.position.set(0, 1.4, 0.6); door.add(doorL);

  // viñetas de escenas anteriores
  const ghostMat = (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.5, roughness: 0.4, transparent: true, opacity: 1 });
  const vign = [];
  const addV = (obj, x, z, color) => {
    const g = new THREE.Group(); g.position.set(x, 1.15, z); scene.add(g);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.04, 32), ghostMat(0x9aa8ff)); ped.position.y = -0.3; g.add(ped);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.006, 6, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2), transparent: true })); ring.rotation.x = Math.PI / 2; ring.position.y = -0.28; g.add(ring);
    g.add(obj); const gl = glow(color, 0.9, 0.35); g.add(gl);
    const mats = []; g.traverse(o => { if (o.material) { o.material.transparent = true; mats.push(o.material); } });
    vign.push({ g, obj, z, mats, base: mats.map(m => m.opacity ?? 1) });
  };
  const heart = new THREE.Mesh(heartGeo(), ghostMat(0xff4a5a)); heart.scale.setScalar(0.11); addV(heart, -0.62, 3.0, 0xff4a5a);
  const brain = new THREE.Mesh(brainGeo(0.5), brainMaterial()); brain.material.transparent = true; brain.scale.setScalar(0.13); addV(brain, 0.62, 2.0, 0xff9ac0);
  const bush = new THREE.Group(); const bm = ghostMat(0x4aa060); for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 1), bm); l.position.set((i - 1.5) * 0.06, Math.sin(i) * 0.03, 0); bush.add(l); }
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), ghostMat(0xd8c0a8)); bun.position.set(0.12, -0.05, 0.06); bush.add(bun); addV(bush, -0.62, 1.0, 0x6ad080);
  const clock = makeClock(); clock.scale.setScalar(0.55); addV(clock, 0.62, 0.0, 0xb98aff);
  const bub = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xff8a5a, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.45, emissive: 0xff6a3a, emissiveIntensity: 0.3 })); addV(bub, -0.62, -1.0, 0xff8a5a);
  const st = new THREE.Group(); for (let i = 0; i < 4; i++) { const s = rbox(0.06, 0.03 + i * 0.03, 0.08, 0.008, ghostMat(0xffd28a), i * 0.05 - 0.08, (0.03 + i * 0.03) / 2 - 0.1, 0, st); } addV(st, 0.62, -2.0, 0xffd28a);

  const hero = makeHero(); scene.add(hero.root);
  const key = new THREE.DirectionalLight(0xdcdcff, 1.8); key.position.set(-2.5, 4.5, -4); key.castShadow = true; scene.add(key);
  scene.add(new THREE.HemisphereLight(0xa0a8ff, 0x2a2030, 0.7));
  setEnvIntensity(scene, 0.12);
  const camera = new THREE.PerspectiveCamera(40, 9 / 16, 0.02, 80);

  return {
    scene, camera,
    update(t) {
      env.update(t + 86);
      // ---- caminar (hacia -z) ----
      const speed = 0.68, dist = Math.max(0, t) * speed;
      const hz = 3.6 - dist;
      const passing = vign.reduce((acc, v) => Math.abs(v.z - hz) < 0.8 ? v : acc, null);
      const p = walkPose(dist / 1.25, 1);
      p.z = hz; p.x = 0; p.ry = Math.PI;
      // gira la cabeza hacia la viñeta que está pasando
      const look = vign.reduce((acc, v) => acc + Math.exp(-Math.pow((v.z - hz + 0.3) / 0.6, 2)) * (v.g.position.x > 0 ? -1 : 1), 0);
      p.headY = look * 0.55; p.neckY = look * 0.2;
      p.breathRate = 0.25; p.breath = 0.6;
      hero.setPose(p);
      hero.setExpr({ worry: lerp(0.3, 0, ramp(t, 0, 6)), smile: lerp(0.05, 0.35, ramp(t, 1, 7)), eyeOpen: 0.98, gazeX: look * 0.4, gazeY: 0.05 });
      hero.apply(t + 86);
      // ---- viñetas: flotan, giran y se desvanecen después de que él pasa ----
      vign.forEach((v, i) => {
        v.obj.rotation.y = t * 0.6 + i;
        v.g.position.y = 1.15 + Math.sin(t * 1.1 + i) * 0.04;
        const f = 1 - ramp(hz, v.z - 0.2, v.z - 1.6);          // se desvanece al quedar atrás
        const appear = ramp(t, i * 0.25 - 0.3, i * 0.25 + 0.4);
        v.mats.forEach((m, j) => { m.opacity = v.base[j] * f * appear; });
        v.g.scale.setScalar(Math.max(0.001, lerp(0.6, 1, f) * appear));
        v.g.visible = f * appear > 0.01;
      });
      // losas: se encienden por delante de él
      tiles.forEach(o => { o.m.emissiveIntensity = 0.06 + 0.3 * Math.exp(-Math.pow((o.z - (hz - 0.6)) / 1.0, 2)); });

      // ---- cámara ----
      const hp = v3(0, 1.0, hz);
      let pos, tgt;
      const orbit = ramp(t, 3.2, 6.4, easeInOut);       // de delante (0) a detrás (π)
      const a = orbit * Math.PI * 0.95;
      const R = lerp(3.5, 2.8, orbit);
      pos = hp.clone().add(v3(Math.sin(a) * R * 0.9, lerp(0.75, 0.6, orbit), -Math.cos(a) * R));
      tgt = hp.clone().add(v3(0, 0.25, 0));
      // final: le adelanta y entra por la puerta
      const fly = ramp(t, 6.4, 8.75, easeIn);
      if (fly > 0) {
        const behind = pos.clone();
        const doorIn = v3(0, 1.3, -5.6);
        pos = behind.lerp(doorIn, fly);
        tgt = tgt.clone().lerp(v3(0, 1.25, -7), ramp(t, 6.4, 7.6, easeInOut));
      }
      pos.add(v3(noise1(t * 0.6, 111) * 0.008, noise1(t * 0.6, 112) * 0.008, 0));
      aim(camera, pos, tgt, 40);
      const focus = fly > 0.4 ? pos.distanceTo(v3(0, 1.2, -5.2)) : pos.distanceTo(hp);
      return { focus, aperture: 1.2, maxBlur: 0.012, exposure: 0.98 + fly * 0.15, saturation: 1.08, contrast: 1.06, tint: [1.0, 0.99, 1.03], bloom: 0.4 + fly * 0.4, bloomThreshold: 1.5, vignette: 0.4 };
    },
  };
}
