// ESCENA 11 — Cambiar de perspectiva (98.75–109.8 s)
// En calma, observa las esferas: una se abre y muestra una escena imaginada, otra un recuerdo, la tercera está vacía.
import * as THREE from 'three';
import { Character } from '../character.js';
import { M, v3, ramp, aim, lerp, noise1, smoother, easeInOut, rng, glowTex } from '../lib.js';
import { makeHero, makeFriend, mindSpace, P, glow, tintCharacter, setEnvIntensity } from '../common.js';

function shellOrb(color, radius) {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.12, clearcoat: 1, emissive: color, emissiveIntensity: 0.15, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
  const top = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  const bot = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat);
  const rimM = M.emit(color, 3);
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.006, 8, 64), rimM); r1.rotation.x = Math.PI / 2; top.add(r1);
  const r2 = r1.clone(); bot.add(r2);
  const inner = new THREE.Group(); g.add(top, bot, inner);
  const halo = glow(color, radius * 4, 0.3); g.add(halo);
  const light = new THREE.PointLight(color, 0.8, 1.5, 2); g.add(light);
  return { g, top, bot, inner, halo, light, mat };
}

export function create() {
  const scene = new THREE.Scene();
  const env = mindSpace(scene, { top: 0x0b1a3a, mid: 0x2a4a7a, bottom: 0x070d1c, fog: 0x13284a, fogDensity: 0.04, floor: 0x0e1a30 });
  const hero = makeHero(); scene.add(hero.root);
  const key = new THREE.SpotLight(0xcfe0ff, 18, 12, 0.5, 0.7, 1.5); key.position.set(1.5, 4.5, 3); key.target.position.set(0, 1, 0); key.castShadow = true; scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0x8ab0ff, 0x10182a, 0.5));
  const warm = new THREE.PointLight(0xffb070, 1.2, 5, 2); warm.position.set(-1.2, 1.8, 1.5); scene.add(warm);

  const R = 0.32;
  const orbs = [shellOrb(0xb06aff, R), shellOrb(0xffb46a, R), shellOrb(0x7a9aff, R)];
  const home = [v3(-0.75, 1.75, 1.0), v3(0.0, 1.95, 1.2), v3(0.75, 1.7, 1.0)];
  orbs.forEach((o, i) => { o.g.position.copy(home[i]); scene.add(o.g); });
  // 1: escena imaginada (amigo enfadado en miniatura, violeta)
  const mini1 = makeFriend(); tintCharacter(mini1, 0xb04aff, 0.35); mini1.root.scale.setScalar(0.17); mini1.root.position.y = -0.15; orbs[0].inner.add(mini1.root);
  // 2: recuerdo (dos amigos riendo en una mesa, tono sepia cálido)
  const m2a = makeHero(), m2b = makeFriend();
  [m2a, m2b].forEach((c, i) => { tintCharacter(c, 0xffa050, 0.25); c.root.scale.setScalar(0.13); c.root.position.set(i ? 0.09 : -0.09, -0.15, 0); orbs[1].inner.add(c.root); });
  const tbl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 20), M.std(0xc99a6a, 0.5)); tbl.position.y = -0.055; orbs[1].inner.add(tbl);
  // 3: vacío — sólo polvo de estrellas
  const sg = new THREE.BufferGeometry(); const sa = new Float32Array(60 * 3); const rr = rng(9);
  for (let i = 0; i < 60; i++) { const d = v3(rr() - 0.5, rr() - 0.5, rr() - 0.5).multiplyScalar(0.4); sa.set([d.x, d.y, d.z], i * 3); }
  sg.setAttribute('position', new THREE.BufferAttribute(sa, 3));
  orbs[2].inner.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xbfd0ff, size: 0.012, map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  setEnvIntensity(scene, 0.15);
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.02, 80);
  const opens = [[2.8, 3.6], [5.0, 5.8], [7.0, 7.8]];

  return {
    scene, camera,
    update(t) {
      env.update(t + 99);
      // personaje: se detiene, observa con calma
      const look = t < 2.8 ? -0.1 : t < 5.0 ? 0.35 : t < 7.0 ? 0.0 : t < 9 ? -0.35 : 0;
      const lookS = lerp(hero.pose.headY || 0, look, 0.12);
      hero.setPose({ ry: 0, headY: look * ramp(t % 2.2, 0, 0.8) + 0, headX: -0.28, neckX: -0.1, lFlex: 0.06, rFlex: 0.06, breathRate: 0.22, breath: 0.8 });
      hero.pose.headY = t < 2.8 ? -0.05 : t < 5.0 ? lerp(-0.05, 0.3, ramp(t, 2.8, 3.4)) : t < 7.0 ? lerp(0.3, 0.0, ramp(t, 5.0, 5.6)) : t < 9.0 ? lerp(0.0, -0.3, ramp(t, 7.0, 7.6)) : lerp(-0.3, 0.0, ramp(t, 9.0, 9.8));
      hero.setExpr({ smile: lerp(0.0, 0.3, ramp(t, 8.0, 10)), worry: lerp(0.4, 0.0, ramp(t, 1, 6)), eyeOpen: 0.95, gazeY: 0.35, gazeX: hero.pose.headY * 0.6 });
      hero.apply(t + 99);
      // esferas: flotan, se abren una a una y luego se alejan
      const away = ramp(t, 9.0, 11.2, smoother);
      orbs.forEach((o, i) => {
        const open = ramp(t, opens[i][0], opens[i][1], smoother) * (1 - ramp(t, 8.8, 9.6) * 0.0);
        o.top.position.y = open * R * 0.9; o.bot.position.y = -open * R * 0.55;
        o.top.rotation.x = -open * 0.35; o.bot.rotation.x = open * 0.25;
        o.inner.scale.setScalar(Math.max(0.001, open));
        o.inner.rotation.y = t * 0.4;
        const drift = v3(Math.sin(t * 0.7 + i) * 0.03, Math.sin(t * 0.9 + i * 2) * 0.04, 0);
        const exit = v3((i - 1) * 3.5, 2.5 + i * 0.5, -2.5);
        o.g.position.copy(home[i]).add(drift).lerp(exit, away);
        o.g.scale.setScalar(1 - away * 0.4);
        o.light.intensity = 0.8 * (1 - away);
      });
      // cámara: órbita lenta de 120°, detalles de cada esfera, rack focus rostro ↔ esferas
      const head = hero.headPos(v3(0, 0.11, 0));
      let pos, tgt, focus;
      const a = lerp(-1.1, 1.0, ramp(t, -0.5, 11, k => smoother(k)));
      // órbita frente al personaje: esferas en primer plano, su rostro detrás
      pos = v3(Math.sin(a) * 2.4, 1.62, 0.5 + Math.cos(a) * 2.4);
      tgt = v3(0, 1.62, 0.45);
      let det = -1;
      opens.forEach(([s, e], i) => { if (t > s - 0.3 && t < e + 1.0) det = i; });
      const dk = det >= 0 ? ramp(t, opens[det][0] - 0.3, opens[det][0] + 0.4) * (1 - ramp(t, opens[det][1] + 0.6, opens[det][1] + 1.1)) : 0;
      if (det >= 0) {
        const o = orbs[det].g.position;
        const close = o.clone().add(pos.clone().sub(o).normalize().multiplyScalar(0.85));
        pos.lerp(close, dk * 0.8); tgt.lerp(o, dk);
      }
      // rack focus: rostro al principio y al final, esferas en los detalles
      focus = lerp(pos.distanceTo(head), pos.distanceTo(det >= 0 ? orbs[det].g.position : tgt), Math.max(dk, t < 2.6 ? ramp(t, 1.2, 2.2) : 0));
      if (t > 9.0) focus = lerp(focus, pos.distanceTo(head), ramp(t, 9.0, 9.8));
      pos.add(v3(noise1(t * 0.5, 81) * 0.008, noise1(t * 0.5, 82) * 0.008, 0));
      aim(camera, pos, tgt, 38);
      return { focus, aperture: 2.0, maxBlur: 0.015, exposure: 0.95, saturation: 1.05, contrast: 1.06, tint: [0.98, 1.0, 1.04], bloom: 0.6, bloomThreshold: 1.0, vignette: 0.4 };
    },
  };
}
