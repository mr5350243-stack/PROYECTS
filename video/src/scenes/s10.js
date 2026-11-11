// ESCENA 10 — Imaginación frente a realidad (86.7–98.75 s)
// Un único entorno dividido por un cristal: a la izquierda, lo que imagina (amigo enfadado);
// a la derecha, lo que ocurre (el amigo trabaja, el teléfono guardado). La cámara atraviesa el cristal; luego todo se funde.
import * as THREE from 'three';
import { Character } from '../character.js';
import { M, rbox, box, v3, ramp, aim, lerp, noise1, keyLight, woodTex, noiseTex, smoother, easeInOut, track, skyDome } from '../lib.js';
import { makeHero, makeFriend, P, glow, tintCharacter, setEnvIntensity } from '../common.js';

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0816);
  // ---- lado izquierdo: espacio imaginado (violeta) ----
  const L = new THREE.Group(); scene.add(L);
  const lf = new THREE.Mesh(new THREE.PlaneGeometry(8, 22), M.phys(0x150c28, { roughness: 0.2, clearcoat: 1 })); lf.rotation.x = -Math.PI / 2; lf.position.set(-4, 0, 6); lf.receiveShadow = true; L.add(lf);
  const lback = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), new THREE.MeshBasicMaterial({ color: 0x2a1450 })); lback.position.set(-4, 3.0, -3.4); L.add(lback);
  const lglow = glow(0xb04aff, 6, 0.35); lglow.position.set(-2.2, 1.6, -4.5); L.add(lglow);
  const lred = glow(0xff2a4a, 3, 0.4); lred.position.set(-1.4, 1.3, -2.6); L.add(lred);
  const lightL = new THREE.PointLight(0xa05aff, 5, 9, 1.6); lightL.position.set(-2.5, 2.6, -0.5); scene.add(lightL);
  const redL = new THREE.PointLight(0xff3050, 3, 5, 1.8); redL.position.set(-1.2, 2.0, -2.0); scene.add(redL);
  // ---- lado derecho: oficina real (cálida, realista) ----
  const R = new THREE.Group(); scene.add(R);
  const wood = woodTex().clone(); wood.needsUpdate = true; wood.repeat.set(2, 2);
  const rf = new THREE.Mesh(new THREE.PlaneGeometry(8, 22), M.std(0xffffff, 0.55, 0, { map: wood })); rf.rotation.x = -Math.PI / 2; rf.position.set(4, 0, 6); rf.receiveShadow = true; R.add(rf);
  const rwall = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), M.std(0xffffff, 0.9, 0, { map: noiseTex('office', '#d8cfc0', 10, 256, 8) })); rwall.position.set(4, 3.0, -3.4); rwall.receiveShadow = true; R.add(rwall);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.3), new THREE.MeshBasicMaterial({ color: 0xcfe6ff })); win.position.set(3.9, 1.75, -3.38); R.add(win);
  box(1.7, 0.06, 0.08, M.std(0xf5f2ee, 0.4), 3.9, 2.42, -3.35, R); box(1.7, 0.06, 0.08, M.std(0xf5f2ee, 0.4), 3.9, 1.08, -3.35, R);
  const desk = new THREE.Group(); desk.position.set(1.6, 0, -2.0); R.add(desk);
  rbox(1.4, 0.05, 0.7, 0.015, M.std(0xffffff, 0.45, 0, { map: woodTex() }), 0, 0.75, 0, desk);
  for (const x of [-0.65, 0.65]) box(0.05, 0.75, 0.6, M.std(0x2b2b30, 0.4, 0.5), x, 0.375, 0, desk);
  const lap = new THREE.Group(); lap.position.set(0, 0.775, -0.05); desk.add(lap);
  rbox(0.38, 0.018, 0.26, 0.008, M.std(0xb8bcc4, 0.3, 0.8), 0, 0.009, 0, lap);
  const lid = new THREE.Group(); lid.position.set(0, 0.018, -0.13); lid.rotation.x = -0.25; lap.add(lid);
  rbox(0.38, 0.26, 0.012, 0.008, M.std(0xb8bcc4, 0.3, 0.8), 0, 0.13, 0, lid);
  // pantalla con "trabajo": hoja de cálculo / gráficas sin texto
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const g = c.getContext('2d');
  g.fillStyle = '#f4f6fa'; g.fillRect(0, 0, 256, 160); g.fillStyle = '#3b82f6'; g.fillRect(0, 0, 256, 16);
  for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#e3e8f0' : '#ffffff'; g.fillRect(8, 24 + i * 14, 130, 12); g.fillStyle = '#aab3c2'; g.fillRect(12, 28 + i * 14, 40 + (i * 37) % 60, 4); }
  [40, 70, 55, 95, 80, 110].forEach((h, i) => { g.fillStyle = ['#ff8a5b', '#5bc0eb', '#9bc53d'][i % 3]; g.fillRect(150 + i * 16, 150 - h, 11, h); });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.21), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.8 })); scr.position.set(0, 0.135, 0.007); lid.add(scr);
  // mochila con el teléfono guardado (se asoma, pantalla apagada)
  const bag = rbox(0.34, 0.42, 0.18, 0.06, M.phys(0x3d5a80, { roughness: 0.8, sheen: 0.4 }), 0.95, 0.21, 0.1, desk); bag.rotation.y = -0.3;
  const phoneIn = rbox(0.074, 0.152, 0.009, 0.008, M.phys(0x1b1d22, { roughness: 0.25, metalness: 0.6 }), 0.9, 0.44, 0.14, desk); phoneIn.rotation.set(-0.2, -0.3, 0.1);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 16), M.phys(0xe8e2d6, { roughness: 0.3 })); mug.position.set(-0.45, 0.82, 0.1); desk.add(mug);
  const docs = rbox(0.22, 0.02, 0.3, 0.004, M.std(0xffffff, 0.8), 0.4, 0.785, 0.1, desk); docs.rotation.y = 0.2;
  const chair = rbox(0.48, 0.07, 0.46, 0.03, M.phys(0x3a3a44, { roughness: 0.6 }), 2.2, 0.46, -1.35, R); chair.position.x = 1.6;
  const sun = keyLight(0xffe2c0, 2.6, v3(7, 5, 3), v3(2.5, 0.8, -2), 5); scene.add(sun, sun.target);
  const warmFill = new THREE.PointLight(0xffd2a0, 1.5, 7, 2); warmFill.position.set(3.5, 2.4, 0.5); scene.add(warmFill);
  const hemi = new THREE.HemisphereLight(0xdfe6ff, 0x302838, 0.45); scene.add(hemi);

  // ---- cristal divisorio ----
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xdfe8ff, roughness: 0.04, metalness: 0, transmission: 1, thickness: 0.05, ior: 1.3, transparent: true, opacity: 1, specularIntensity: 1 });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.4, 8), glassMat); glass.position.set(0, 1.7, -1.5); scene.add(glass);
  const edgeM = M.emit(0xcfe0ff, 2.5);
  const edges = new THREE.Group(); scene.add(edges);
  box(0.05, 0.03, 8, edgeM, 0, 3.4, -1.5, edges).castShadow = false; box(0.05, 0.03, 8, edgeM, 0, 0.0, -1.5, edges).castShadow = false;
  // ---- personajes ----
  const hero = makeHero(); scene.add(hero.root);
  const imagined = makeFriend(); tintCharacter(imagined, 0xff2a4a, 0.22); scene.add(imagined.root);
  const friend = makeFriend(); scene.add(friend.root);
  setEnvIntensity(scene, 0.25);
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.03, 80);

  const camTrack = track([
    [0.0, [-2.5, 1.55, 2.6, -1.3, 1.25, -1.6]],
    [2.6, [-1.3, 1.5, 2.3, -0.9, 1.25, -1.8]],
    [4.4, [0.3, 1.45, 1.9, 1.0, 1.2, -2.0]],      // atraviesa el cristal
    [6.2, [1.1, 1.55, -0.55, 1.6, 1.1, -2.15]],    // sobre el hombro del amigo
    [8.6, [1.25, 1.5, -0.8, 1.55, 1.0, -2.1]],
    [11.6, [0.05, 2.4, 9.6, 0.05, 1.0, -1.6]],
    [12.6, [0.05, 2.45, 9.9, 0.05, 1.0, -1.6]],      // se funden ambos espacios
  ], easeInOut);

  return {
    scene, camera,
    update(t) {
      const merge = ramp(t, 8.8, 11.2, smoother);
      // protagonista (izquierda) imaginando
      hero.setPose({ x: -1.3, z: -0.6, ry: Math.PI * 0.82, spineX: 0.05, lFlex: 0.1, rFlex: 0.1, neckX: -0.02, headY: -0.15 + merge * 0.35 });
      hero.setExpr({ smile: lerp(-0.35, 0.2, merge), worry: lerp(0.9, 0.2, merge), eyeOpen: 1.05, gazeX: lerp(-0.1, 0.3, merge) });
      hero.apply(t + 86);
      // amigo imaginado: brazos cruzados, de espaldas
      imagined.setPose({ ...P.armsCrossed, x: -0.6, z: -2.5, ry: Math.PI + 0.3, headY: -0.3, spineX: -0.04 });
      imagined.setExpr({ smile: -0.6, anger: 1, eyeOpen: 0.7 });
      imagined.apply(t + 3);
      imagined.root.visible = merge < 0.98;
      imagined.root.scale.setScalar(1 - merge * 0.02);
      imagined.root.traverse(o => { if (o.isMesh && o.material) { o.material.transparent = true; o.material.opacity = 1 - merge; } });
      // amigo real: sentado trabajando, concentrado
      const type = Math.sin(t * 18);
      friend.setPose({ ...P.sit, x: 1.6, z: -1.45, ry: Math.PI, hipsY: 0.55, spineX: 0.15, lFlex: 0.6, lElb: 1.3, lAbd: 0.12, rFlex: 0.6, rElb: 1.3, rAbd: 0.12, lWr: 0.35, rWr: 0.35,
        lCurl: 0.3 + type * 0.12, rCurl: 0.3 - type * 0.12, headX: 0.18, neckX: 0.1 });
      friend.setExpr({ smile: 0.15, worry: 0, eyeOpen: 0.85, gazeY: -0.3, gazeX: Math.sin(t * 1.3) * 0.15 });
      friend.apply(t + 7);
      // el cristal se disuelve y la luz violeta se funde con la cálida
      glassMat.opacity = 1 - merge; glass.visible = merge < 0.99;
      edges.children.forEach(e => e.material.emissiveIntensity = 2.5 * (1 - merge));
      lightL.intensity = 5 * (1 - merge) + 1.0 * merge; lightL.color.setRGB(lerp(0.63, 1, merge), lerp(0.35, 0.82, merge), lerp(1, 0.63, merge));
      redL.intensity = 3 * (1 - merge);
      lglow.material.opacity = 0.35 * (1 - merge); lred.material.opacity = 0.4 * (1 - merge);
      lback.material.color.setRGB(lerp(0.16, 0.62, merge), lerp(0.08, 0.57, merge), lerp(0.31, 0.5, merge));
      lf.material.color.setRGB(lerp(0.08, 0.42, merge), lerp(0.05, 0.25, merge), lerp(0.16, 0.14, merge));

      const cc = camTrack(t);
      const pos = v3(cc[0], cc[1], cc[2]).add(v3(noise1(t * 0.6, 71) * 0.01, noise1(t * 0.6, 72) * 0.01, 0));
      const tgt = v3(cc[3], cc[4], cc[5]);
      aim(camera, pos, tgt, 38);
      const crossing = Math.exp(-Math.pow((pos.x - 0) / 0.25, 2));
      return { focus: pos.distanceTo(tgt), aperture: 1.4, maxBlur: 0.013, saturation: 1.05, contrast: 1.08, tint: [1, 1, 1], bloom: 0.55 + crossing * 0.2, bloomThreshold: 1.0, exposure: 0.95 - crossing * 0.25, vignette: 0.4, ca: 0.0015 + crossing * 0.006 };
    },
  };
}
