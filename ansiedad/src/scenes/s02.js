// ESCENA 02 — El cuerpo en alerta (11.05–19.9 s)
// La onda roja se contrae y se convierte en un corazón dentro de una silueta translúcida. La cámara orbita
// el torso; se iluminan hombros y cuello (tensión). Partículas suben hacia la cabeza y la cámara las sigue
// hasta un cerebro 3D (transición a la escena 03).
import * as THREE from 'three';
import { POSES, makeHero, mindSpace, ghostify, glow, glowTex, heartGeo, alarmWave, brainGeo, brainMaterial, v3, ramp, aim, lerp, noise1, smoother, easeInOut, easeOut, rng } from '../shared.js';

export function create() {
  const scene = new THREE.Scene();
  const env = mindSpace(scene, { top: 0x04060f, mid: 0x0d1630, bottom: 0x02030a, fog: 0x070c1c, fogDensity: 0.05, floor: 0x060a16 });
  env.floor.visible = false;
  const hero = makeHero(); scene.add(hero.root);
  const gm = ghostify(hero, 0x5fb4ff, 0.75);
  scene.add(new THREE.HemisphereLight(0x6a8cff, 0x05060c, 0.4));

  // corazón dentro del pecho
  const heart = new THREE.Group(); hero.chest.add(heart); heart.position.set(0.035, 0.3, 0.02); heart.rotation.z = -0.35;
  const hm = new THREE.Mesh(heartGeo(), new THREE.MeshPhysicalMaterial({ color: 0xc8243a, emissive: 0xc0001a, emissiveIntensity: 0.3, roughness: 0.3, clearcoat: 1 }));
  hm.scale.setScalar(0.055); heart.add(hm);
  const veins = new THREE.Group(); heart.add(veins);
  const vm = new THREE.MeshStandardMaterial({ color: 0xa01830, emissive: 0xff2840, emissiveIntensity: 0.7 });
  [[0.0, 0.06, 0.0, 0.2], [-0.02, 0.055, 0.01, -0.5], [0.025, 0.05, -0.01, 0.6]].forEach(([x, y, z, rz]) => {
    const a = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 20, Math.PI), vm); a.position.set(x, y, z); a.rotation.z = rz; veins.add(a);
  });
  const hglow = glow(0xff3a4a, 0.4, 0); heart.add(hglow);
  const heartLight = new THREE.PointLight(0xff3040, 0, 1.5, 2); heart.add(heartLight); heartLight.position.z = 0.1;
  // la onda que llega desde la escena anterior y se contrae en el corazón
  const wave = alarmWave(0xff2440); scene.add(wave.g);

  // tensión muscular: hombros (trapecios) y cuello
  const tense = [];
  const tm = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.75, 0.25), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const s of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), tm()); m.scale.set(0.085, 0.045, 0.06); m.position.set(0.12 * s, 0.43, -0.01); m.rotation.z = -0.35 * s; hero.chest.add(m); tense.push(m);
    const d = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), tm()); d.scale.set(0.055, 0.075, 0.06); d.position.set(0.2 * s, 0.37, 0); hero.chest.add(d); tense.push(d);
  }
  const neckT = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 20), tm()); neckT.position.y = 0.04; hero.neck.add(neckT); tense.push(neckT);

  // partículas que suben del pecho a la cabeza
  const NP = 160, R = rng(21);
  const seeds = Array.from({ length: NP }, () => ({ ph: R(), sp: 0.35 + R() * 0.3, a: R() * 6.28, r: 0.02 + R() * 0.06, sz: R() }));
  const pg = new THREE.BufferGeometry(); const pa = new Float32Array(NP * 3), pc = new Float32Array(NP * 3);
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.022, map: glowTex(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  pts.frustumCulled = false; scene.add(pts);

  // cerebro dentro de la cabeza (crece y se ilumina al final)
  const brain = new THREE.Group(); scene.add(brain);
  const bm = new THREE.Mesh(brainGeo(), brainMaterial()); brain.add(bm);
  const bglow = glow(0xffb0d0, 3.2, 0); brain.add(bglow);
  const brainLight = new THREE.PointLight(0xff9ac0, 0, 2, 2); brain.add(brainLight);

  const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.01, 80);

  return {
    scene, camera,
    update(t) {
      env.update(t + 11);
      // de pie, respiración agitada, hombros algo encogidos por la tensión
      const tens = ramp(t, 1.5, 2.6);
      hero.setPose({ ry: 0, lFlex: 0.08, rFlex: 0.08, lAbd: 0.12 - tens * 0.04, rAbd: 0.12 - tens * 0.04, lElb: 0.25 + tens * 0.25, rElb: 0.25 + tens * 0.25, lCurl: 0.2 + tens * 0.5, rCurl: 0.2 + tens * 0.5, neckX: 0.04, headX: 0.05, breathRate: 0.75, breath: 2.0 });
      hero.setExpr({ worry: 0.8, smile: -0.3, eyeOpen: 1.1, mouthOpen: 0.15 });
      hero.apply(t + 11);
      hero.root.updateMatrixWorld(true);
      gm.uniforms.strength.value = 0.22;

      // latido rápido
      const bpm = 1.75;
      const ph = (t * bpm) % 1;
      const beat = Math.exp(-ph * 9) + 0.6 * (ph > 0.2 ? Math.exp(-(ph - 0.2) * 11) : 0);
      const born = ramp(t, 0.15, 0.75, easeOut);
      hm.scale.setScalar(0.055 * born * (1 + beat * 0.16));
      hm.material.emissiveIntensity = 0.15 + beat * 0.45;
      veins.scale.setScalar(Math.max(0.001, born));
      hglow.material.opacity = (0.05 + beat * 0.25) * born;
      heartLight.intensity = (0.1 + beat * 0.4) * born;
      // onda que se contrae hacia el corazón
      const hp = hero.world(hero.chest, v3(0.035, 0.3, 0.02));
      const wk = ramp(t, -0.3, 0.6, easeInOut);
      wave.g.position.copy(hp); wave.set(lerp(1.6, 0.02, wk), (1 - wk) * 0.9, -hp.y + 0.02);

      // tensión: hombros y cuello brillan en naranja, palpitando
      const pulse = 0.6 + 0.4 * Math.sin(t * 9);
      tense.forEach(m => { m.material.opacity = tens * pulse * 0.3; });

      // partículas: del corazón a la cabeza (empiezan con "empiezas a imaginar…")
      const flow = ramp(t, 3.0, 3.8);
      const head = hero.headPos(v3(0, 0.08, 0));
      for (let i = 0; i < NP; i++) {
        const s = seeds[i];
        const k = ((t - 3.0) * s.sp + s.ph) % 1;
        const kk = k < 0 ? k + 1 : k;
        const p = hp.clone().lerp(head, kk);
        const sw = Math.sin(kk * Math.PI);
        p.x += Math.cos(s.a + t * 2) * s.r * sw * 1.6; p.z += Math.sin(s.a + t * 2) * s.r * sw * 1.6;
        pa.set([p.x, p.y, p.z], i * 3);
        const a = flow * Math.min(1, kk * 6) * (1 - Math.max(0, kk - 0.85) / 0.15) * (t > 3.0 ? 1 : 0);
        const c = new THREE.Color().setHSL(0.09 + 0.06 * kk, 1, 0.55).multiplyScalar(a * (1.2 + s.sz));
        pc.set([c.r, c.g, c.b], i * 3);
      }
      pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true;

      // cerebro: aparece dentro de la cabeza cuando llegan las partículas
      const bk = ramp(t, 4.6, 6.0, smoother);
      brain.position.copy(hero.headPos(v3(0, 0.1, 0.0)));
      brain.quaternion.copy(hero.head.getWorldQuaternion(new THREE.Quaternion()));
      brain.scale.setScalar(Math.max(0.001, 0.068 * bk));
      bm.material.emissiveIntensity = 0.15 + bk * 0.25 + ramp(t, 7.6, 8.85) * 0.5;
      bglow.material.opacity = bk * 0.08 + ramp(t, 7.6, 8.85) * 0.2;
      brainLight.intensity = bk * 0.25;

      // cámara: órbita del torso → sigue las partículas hacia arriba → entra en el cerebro
      const a = lerp(-0.95, 0.75, ramp(t, -0.2, 5.4, smoother));
      const R0 = lerp(1.55, 1.75, ramp(t, 0, 3));
      const orbitPos = v3(Math.sin(a) * R0, hp.y + 0.05, hp.z + Math.cos(a) * R0);
      const up = ramp(t, 4.0, 6.6, easeInOut);
      const headPos = v3(Math.sin(0.75) * 0.9, head.y + 0.08, head.z + Math.cos(0.75) * 0.9);
      let pos = orbitPos.lerp(headPos, up);
      let tgt = hp.clone().add(v3(0, 0.12, 0)).lerp(head, up);
      const inK = ramp(t, 7.2, 8.85, k => k * k);
      const brainC = brain.position.clone();
      pos.lerp(brainC.clone().add(v3(Math.sin(0.75), 0.15, Math.cos(0.75)).normalize().multiplyScalar(0.12)), inK);
      tgt.lerp(brainC, Math.min(1, inK * 2));
      pos.add(v3(noise1(t * 0.6, 21) * 0.006, noise1(t * 0.6, 22) * 0.006, 0));
      aim(camera, pos, tgt, lerp(36, 40, inK));
      return {
        focus: pos.distanceTo(tgt), aperture: 0.8, maxBlur: 0.012, exposure: 1.0, saturation: 1.1, contrast: 1.08,
        tint: [1.0, 0.98, 1.04], bloom: 0.45, bloomThreshold: 1.3, vignette: 0.42,
      };
    },
  };
}
