// ESCENA 07 — La preocupación crece (61.4–67.6 s)
// En su escritorio: una esfera naranja aparece, crece, se divide y lo rodea; intenta apartarlas; todo oscurece.
import * as THREE from 'three';
import { Character } from '../character.js';
import { M, rbox, box, v3, ramp, aim, lerp, noise1, rng, keyLight, woodTex, noiseTex, smoother, easeOutBack, easeIn, clamp } from '../lib.js';
import { makeHero, worryOrb, P } from '../common.js';
import { setEnvIntensity } from '../sets.js';

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0e0c10);
  const r = rng(71);
  // rincón de estudio
  const wood = woodTex().clone(); wood.needsUpdate = true; wood.repeat.set(2, 2);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), M.std(0xffffff, 0.6, 0, { map: wood })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wallM = M.std(0xffffff, 0.9, 0, { map: noiseTex('desk', '#b9b2c4', 10, 256, 6) });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), wallM); back.position.set(0, 1.6, -1.6); back.receiveShadow = true; scene.add(back);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), wallM); side.rotation.y = Math.PI / 2; side.position.set(-2.5, 1.6, 1); side.receiveShadow = true; scene.add(side);
  const desk = new THREE.Group(); desk.position.set(0, 0, 0.42); desk.rotation.y = Math.PI; scene.add(desk);
  const top = M.std(0xffffff, 0.45, 0, { map: woodTex() });
  rbox(1.5, 0.05, 0.7, 0.015, top, 0, 0.75, 0, desk);
  for (const x of [-0.7, 0.7]) box(0.05, 0.75, 0.6, M.std(0x2b2b30, 0.4, 0.5), x, 0.375, 0, desk);
  // portátil
  const lap = new THREE.Group(); lap.position.set(0, 0.775, 0.05); desk.add(lap);
  rbox(0.38, 0.018, 0.26, 0.008, M.std(0xb8bcc4, 0.3, 0.8), 0, 0.009, 0, lap);
  const lid = new THREE.Group(); lid.position.set(0, 0.018, -0.13); lid.rotation.x = -0.25; lap.add(lid);
  rbox(0.38, 0.26, 0.012, 0.008, M.std(0xb8bcc4, 0.3, 0.8), 0, 0.13, 0, lid);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.21), M.emit(0x9fc2ff, 1.0)); scr.position.set(0, 0.135, 0.007); lid.add(scr);
  const scrL = new THREE.PointLight(0x9fc2ff, 0.4, 1.8, 2); scrL.position.set(0, 0.15, 0.25); lid.add(scrL);
  // lámpara de escritorio
  const lampG = new THREE.Group(); lampG.position.set(0.55, 0.775, -0.15); desk.add(lampG);
  box(0.02, 0.4, 0.02, M.std(0x222222, 0.3, 0.8), 0, 0.2, 0, lampG);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.14, 24, 1, true), M.phys(0x2a2a2e, { side: THREE.DoubleSide, roughness: 0.4 })); shade.position.set(-0.05, 0.42, 0.03); shade.rotation.z = 0.5; lampG.add(shade);
  const deskL = new THREE.SpotLight(0xffc98a, 2.5, 3, 0.8, 0.6, 2); deskL.position.set(-0.5, 1.15, 0.6); deskL.target.position.set(0.0, 0.9, 0.0); deskL.castShadow = true; scene.add(deskL, deskL.target);
  // libros, taza, planta, cuadro
  rbox(0.2, 0.04, 0.28, 0.005, M.std(0xc0533f, 0.7), -0.55, 0.795, 0.05, desk).rotation.y = 0.2;
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 16), M.phys(0x3d5a80, { roughness: 0.3 })); mug.position.set(-0.4, 0.82, -0.18); desk.add(mug);
  rbox(0.8, 0.5, 0.03, 0.01, M.std(0x2a2a2e, 0.4), 0, 1.65, -1.58, scene);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.42), M.std(0xe0a060, 0.7)); art.position.set(0, 1.65, -1.56); scene.add(art);
  // silla
  const chair = new THREE.Group(); chair.position.set(0, 0, -0.4); chair.rotation.y = Math.PI; scene.add(chair);
  rbox(0.5, 0.07, 0.48, 0.03, M.phys(0x3a3a44, { roughness: 0.6 }), 0, 0.46, 0, chair);
  rbox(0.48, 0.55, 0.06, 0.03, M.phys(0x3a3a44, { roughness: 0.6 }), 0, 0.8, 0.24, chair).rotation.x = 0.1;
  box(0.05, 0.42, 0.05, M.std(0x222222, 0.3, 0.8), 0, 0.22, 0, chair);

  const hero = makeHero(); scene.add(hero.root);
  const sun = keyLight(0xdfe6ff, 1.6, v3(2.5, 4, 3), v3(0, 0.8, -0.8), 4); scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xd8dcff, 0x5a4a40, 0.55); scene.add(hemi);
  setEnvIntensity(scene, 0.4);

  // esferas
  const ORBS = 16, orbs = [];
  for (let i = 0; i < ORBS; i++) {
    const o = worryOrb(i === 0 ? 0.13 : 0.07 + r() * 0.05, i % 5 === 3 ? 0xff5a2a : 0xff8a2a);
    o.userData.born = i === 0 ? 0.4 : 2.0 + (i - 1) * 0.16 + r() * 0.1;
    o.userData.orbitR = 0.55 + r() * 0.55; o.userData.orbitY = 1.15 + r() * 0.9; o.userData.speed = (0.5 + r() * 0.6) * (r() < 0.5 ? 1 : -1); o.userData.ph = r() * Math.PI * 2;
    scene.add(o); orbs.push(o);
  }
  const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.03, 60);
  const HZ = -0.38;

  return {
    scene, camera,
    update(t) {
      const dark = ramp(t, 2.0, 5.0);
      sun.intensity = 1.6 * (1 - dark * 0.8); hemi.intensity = 0.55 * (1 - dark * 0.75); deskL.intensity = 2.5 * (1 - dark * 0.5);
      // personaje: escribe, se detiene, mira arriba, intenta apartar las esferas
      const typing = 1 - ramp(t, 0.6, 1.1);
      const swat = ramp(t, 2.8, 3.1) * (1 - ramp(t, 4.4, 4.9));
      const sw = Math.sin((t - 2.8) * 7);
      let p = { ...P.sit, z: HZ, ry: 0, hipsY: 0.55, spineX: lerp(0.15, -0.05, 1 - typing),
        lFlex: lerp(0.55, 0.3, 1 - typing), lElb: lerp(1.25, 1.0, 1 - typing), lAbd: 0.12, rFlex: lerp(0.55, 0.3, 1 - typing), rElb: lerp(1.25, 1.0, 1 - typing), rAbd: 0.12,
        lWr: 0.4 * typing, rWr: 0.4 * typing, lCurl: 0.3 + Math.sin(t * 20) * 0.15 * typing, rCurl: 0.3 + Math.sin(t * 23) * 0.15 * typing,
        headX: lerp(0.1, -0.35, ramp(t, 0.8, 1.6)) + dark * 0.15, neckX: -0.1 * ramp(t, 0.8, 1.6) };
      p = Character.mix(p, { rFlex: 1.6 + sw * 0.4, rAbd: 0.6 + sw * 0.4, rElb: 0.5, rCurl: 0.1, lFlex: 1.1, lAbd: 0.3, lElb: 1.0, lCurl: 0.1, spineY: sw * 0.2, headY: -sw * 0.3, spineX: -0.1 }, swat);
      p.breathRate = 0.35 + dark * 0.3; p.breath = 0.6 + dark * 0.6;
      hero.setPose(p);
      hero.setExpr({ smile: lerp(0.1, -0.4, ramp(t, 0.8, 2)), worry: ramp(t, 0.8, 2.5), eyeOpen: 1 + ramp(t, 0.9, 1.4) * 0.2, gazeY: lerp(-0.3, 0.55, ramp(t, 0.8, 1.4)), gazeX: Math.sin(t * 1.7) * 0.4 * ramp(t, 2, 3) });
      hero.apply(t + 61);
      const head = hero.headPos(v3(0, 0.11, 0));
      // esferas: la primera aparece sobre la cabeza y crece; luego se divide y rodean
      orbs.forEach((o, i) => {
        const u = o.userData;
        const age = t - u.born;
        let s = i === 0 ? lerp(0.2, 1.6, ramp(t, 0.4, 2.0, smoother)) * (1 - ramp(t, 2.0, 2.3) * 0.4) : easeOutBack(clamp(age / 0.5));
        o.visible = age > 0;
        o.scale.setScalar(Math.max(0.001, s * (1 + Math.sin(t * 5 + i) * 0.05)));
        const a = u.ph + t * u.speed;
        const spread = i === 0 ? 0 : ramp(age, 0, 0.8);
        const center = head.clone().add(v3(0, 0.38, 0));
        const orbitP = v3(Math.sin(a) * u.orbitR, u.orbitY - head.y + 0.25, Math.cos(a) * u.orbitR).add(head.clone().setY(head.y));
        // empujadas por la mano al apartarlas
        if (swat > 0 && i > 0) orbitP.add(v3(Math.sin(t * 7 + i) * 0.08 * swat, 0, 0));
        o.position.copy(i === 0 ? center.clone().add(v3(Math.sin(t) * 0.02, Math.sin(t * 2) * 0.02, 0)).lerp(orbitP, ramp(t, 2.3, 3.0)) : center.clone().lerp(orbitP, spread));
        o.userData.light.intensity = 0.2 + dark * 0.3;
      });

      // cámara: plano medio frontal → órbita 180° → grúa vertical → una esfera llena el encuadre
      let pos, tgt, fov = 36;
      const C = v3(0, 1.2, HZ);
      if (t < 1.6) {
        pos = v3(0.05, 1.32, 1.75 - ramp(t, -0.5, 1.6) * 0.2); tgt = C.clone().add(v3(0, 0.12, 0));
      } else if (t < 4.2) {
        const k = ramp(t, 1.6, 4.2, smoother);
        const a = lerp(0, Math.PI, k), ca = Math.cos(a);
        pos = v3(Math.sin(a) * 1.6, lerp(1.32, 1.6, k), HZ + ca * (ca > 0 ? 1.93 : 1.0)); tgt = C.clone().add(v3(0, 0.2, 0));
      } else {
        const k = ramp(t, 4.2, 5.6, smoother);
        pos = v3(lerp(0, 0.4, k), lerp(1.6, 3.5, k), lerp(HZ - 1.0, HZ + 1.9, k)); tgt = C.clone().add(v3(0, lerp(0.2, 0.0, k), 0));
        fov = lerp(36, 44, k);
        const into = ramp(t, 5.5, 6.4, easeIn);
        const o = orbs[3];
        pos.lerp(o.position.clone().add(v3(0, 0.1, 0.15)), into); tgt.lerp(o.position, ramp(t, 5.4, 5.9));
      }
      pos.add(v3(noise1(t * 0.8, 51) * 0.008, noise1(t * 0.8, 52) * 0.008, 0));
      aim(camera, pos, tgt, fov);
      return { focus: pos.distanceTo(head), aperture: 1.5, maxBlur: 0.013, exposure: lerp(0.85, 0.75, dark), saturation: lerp(1.05, 0.95, dark), contrast: 1.1, tint: [1.0, lerp(1, 0.94, dark), lerp(1, 1.06, dark)], bloom: 0.45, bloomThreshold: 1.2, vignette: 0.35 + dark * 0.3 };
    },
  };
}
