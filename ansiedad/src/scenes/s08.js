// ESCENA 08 — Sensaciones reales (66.5–72.0 s)
// De vuelta en el apartamento: un modelo semitransparente muestra el corazón latiendo y la tensión en los hombros;
// los pulsos luminosos se expanden y desaparecen mientras la cámara gira suavemente.
// (Basada en la escena anatómica del proyecto anterior, reajustada al ritmo de esta locución.)
import * as THREE from 'three';
import { Character, POSES } from '../shared.js';
import { buildApartment } from '../shared.js';
import { v3, ramp, aim, lerp, noise1, smoother, clamp, M } from '../shared.js';
import { makeHero, P, ghostMaterial, glow } from '../shared.js';

function heartGeo() {
  // corazón estilizado: dos lóbulos + punta, por revolución deformada
  const g = new THREE.SphereGeometry(1, 64, 48), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const y = v.y;
    let x = v.x * (1 + 0.25 * Math.max(0, y)), z = v.z * 0.75;
    let yy = y < 0 ? y * (1.35 - 0.2 * Math.abs(v.x)) : y * 0.85;
    yy -= Math.abs(v.x) < 0.25 && y > 0.4 ? (0.25 - Math.abs(v.x)) * 0.8 * (y - 0.4) : 0; // hendidura superior
    if (y < 0) { x *= 1 + y * 0.55; z *= 1 + y * 0.4; }
    p.setXYZ(i, x, yy, z);
  }
  g.computeVertexNormals();
  return g;
}

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1512);
  const apt = buildApartment(); scene.add(apt.root);
  const hero = makeHero(); scene.add(hero.root);
  // copia "rayos X" del personaje (mismo rig, material fresnel)
  const ghost = makeHero(); scene.add(ghost.root);
  const gm = ghostMaterial(0x6ab8ff, 1);
  ghost.root.traverse(o => { if (o.isMesh) { o.material = gm; o.castShadow = false; o.receiveShadow = false; } });
  ghost.mouth.material = gm;
  // materiales originales para desvanecer
  const mats = new Set(); hero.root.traverse(o => { if (o.isMesh) mats.add(o.material); });
  mats.forEach(m => { m.transparent = true; });

  // corazón dentro del pecho
  const heart = new THREE.Group(); hero.chest.add(heart); heart.position.set(0.035, 0.3, 0.015); heart.rotation.z = -0.35;
  const hm = new THREE.Mesh(heartGeo(), new THREE.MeshPhysicalMaterial({ color: 0xc8243a, emissive: 0xff1030, emissiveIntensity: 0.9, roughness: 0.25, clearcoat: 1, transparent: true }));
  hm.scale.setScalar(0.05); heart.add(hm);
  const hglow = glow(0xff4a5a, 0.35, 0.7); heart.add(hglow);
  // arterias estilizadas
  const art = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 8, 20, Math.PI), new THREE.MeshStandardMaterial({ color: 0xb02030, emissive: 0xff3048, emissiveIntensity: 0.6, transparent: true }));
  art.position.set(0.0, 0.05, 0); art.rotation.z = 0.2; heart.add(art);
  // ondas luminosas que recorren torso y hombros
  const waves = [];
  for (let i = 0; i < 5; i++) {
    const w = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 2.2, 3.5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    w.rotation.x = Math.PI / 2; hero.chest.add(w); waves.push(w);
  }
  const chestLight = new THREE.PointLight(0xff4050, 0, 1.2, 2); hero.chest.add(chestLight); chestLight.position.set(0.03, 0.3, 0.15);
  // tensión en hombros y cuello (naranja), sobre el modelo semitransparente
  const tense = [];
  const tmat = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.8, 0.25), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const sd of [-1, 1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), tmat()); m.scale.set(0.085, 0.045, 0.06); m.position.set(0.12 * sd, 0.43, -0.01); m.rotation.z = -0.35 * sd; ghost.chest.add(m); tense.push(m); }
  const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.01, 60);

  return {
    scene, camera,
    update(t0) {
      const t = 3.0 + t0;   // la acción original arranca aquí (la visualización aparece enseguida)
      const xr0 = ramp(t, 3.6, 4.8) * (1 - ramp(t, 7.6, 8.6));
      apt.setMood({ dim: 0.45 + xr0 * 0.55, warm: 0.7 - xr0 * 0.6 });
      const xr = ramp(t, 3.6, 4.8) * (1 - ramp(t, 7.6, 8.6));   // visualización anatómica
      const calm = ramp(t, 8.0, 10.5);
      const hand = ramp(t, 0.6, 1.4);
      let p = Character.mix({ ...POSES.sit, z: -2.0, lFlex: 0.35, lElb: 0.9, lAbd: 0.15, rFlex: 0.35, rElb: 0.9, rAbd: 0.15, spineX: -0.02 }, { ...POSES.sit, z: -2.0, rFlex: 0.35, rElb: 0.9, rAbd: 0.15, ...P.handChest, spineX: 0.06, neckX: 0.08 }, hand);
      p.breathRate = lerp(0.85, 0.3, calm); p.breath = lerp(2.4, 0.6, calm);
      p.headX = (p.headX || 0) + Math.sin(t * Math.PI * 2 * p.breathRate) * 0.03 * (1 - calm);
      hero.setPose(p); ghost.setPose(p);
      const ex = { smile: lerp(-0.4, 0.05, calm), worry: lerp(0.9, 0.3, calm), eyeOpen: lerp(1.1, 0.9, calm), mouthOpen: (0.25 + Math.max(0, Math.sin(t * Math.PI * 2 * p.breathRate)) * 0.25) * (1 - calm), gazeX: -0.2, gazeY: -0.15 };
      hero.setExpr(ex); ghost.setExpr(ex);
      hero.apply(t + 76); ghost.apply(t + 76);
      // desvanecer cuerpo / mostrar fantasma
      mats.forEach(m => { m.opacity = 1 - xr * 0.88; m.depthWrite = xr < 0.5; });
      gm.uniforms.strength.value = xr * 0.55;
      ghost.root.visible = xr > 0.01;
      // latido rápido (≈ 1.6 Hz) que se calma
      const bpm = lerp(1.7, 1.1, calm);
      const ph = (t * bpm) % 1;
      const beat = Math.exp(-ph * 9) + 0.6 * Math.exp(-Math.max(0, ph - 0.18) * 11) * (ph > 0.18 ? 1 : 0);
      hm.scale.setScalar(0.05 * (1 + beat * 0.18));
      hm.material.opacity = 0.2 + xr * 0.8; art.material.opacity = 0.2 + xr * 0.8;
      hm.material.emissiveIntensity = 0.25 + beat * 0.7 * xr;
      hglow.material.opacity = (0.05 + beat * 0.3) * xr;
      heart.visible = xr > 0.02;
      chestLight.intensity = beat * 0.4 * xr;
      tense.forEach(m => { m.material.opacity = xr * (0.25 + 0.15 * Math.sin(t * 9)); });
      waves.forEach((w, i) => {
        const k = ((t * bpm) - i * 0.22) % 1;
        const kk = k < 0 ? k + 1 : k;
        w.scale.setScalar(0.04 + kk * 0.26); w.position.set(0.03, 0.3 + kk * 0.12, 0);
        w.material.opacity = (1 - kk) * xr * 0.9;
      });

      // cámara: plano medio con movimiento circular suave alrededor del torso
      const chest = hero.world(hero.chest, v3(0.02, 0.3, 0.05));
      const head = hero.headPos(v3(0, 0.11, 0));
      const k = ramp(t0, -0.3, 5.8, smoother);
      const a = lerp(-0.75, 0.55, k), R = lerp(1.7, 1.3, k);
      let pos = chest.clone().add(v3(Math.sin(a) * R, 0.22, Math.cos(a) * R));
      const tgt = chest.clone().add(v3(0, 0.16, 0));
      const focus = pos.distanceTo(chest);
      pos.add(v3(noise1(t * 0.7, 61) * 0.006, noise1(t * 0.7, 62) * 0.006, 0));
      aim(camera, pos, tgt, 36);
      return { focus, aperture: 1.6, maxBlur: 0.014, exposure: lerp(0.95, 0.6, xr), saturation: lerp(1.0, 0.85, xr), contrast: 1.08, tint: [1, lerp(1, 0.96, xr), lerp(1, 1.12, xr)], bloom: 0.5, bloomThreshold: 1.0, vignette: 0.38 + xr * 0.2 };
    },
  };
}
