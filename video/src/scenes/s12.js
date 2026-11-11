// ESCENA 12 — No todo lo que piensas es real (109.8–118.5 s)
// De vuelta en el sofá con luz natural: mira el teléfono, lo deja en la mesa, respira y mira a su alrededor.
// Las representaciones imaginarias se desvanecen detrás; dolly-out hasta plano general y fundido a negro.
import * as THREE from 'three';
import { Character, POSES } from '../character.js';
import { buildApartment, makePhone } from '../sets.js';
import { v3, ramp, aim, lerp, noise1, smoother, easeInOut, M, rng } from '../lib.js';
import { makeHero, worryOrb, ghostMaterial, glow } from '../common.js';

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1512);
  const apt = buildApartment(); scene.add(apt.root);
  const hero = makeHero(); scene.add(hero.root);
  const phone = makePhone(); scene.add(phone);
  // ecos de las escenas anteriores (esferas, ficha, puerta) que se desvanecen detrás de él
  const ghosts = new THREE.Group(); scene.add(ghosts);
  const gm = ghostMaterial(0xb08aff, 1);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.9, 0.05), gm); door.position.set(-1.6, 1.4, -2.9); ghosts.add(door);
  const dom = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.08), gm); dom.position.set(1.4, 1.9, -2.85); dom.rotation.z = 0.3; ghosts.add(dom);
  const orbs = []; const r = rng(3);
  for (let i = 0; i < 6; i++) { const o = worryOrb(0.07 + r() * 0.04); o.position.set(-1.2 + r() * 2.4, 1.6 + r() * 0.9, -2.6 + r() * 0.4); ghosts.add(o); orbs.push(o); }
  const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.02, 60);

  return {
    scene, camera,
    update(t) {
      apt.setMood({ dim: 0, warm: 1, dusk: 0.15 });
      // ---- acciones ----
      const putDown = ramp(t, 1.6, 3.0, smoother);       // se inclina y deja el teléfono
      const back = ramp(t, 3.0, 4.0, smoother);          // vuelve a recostarse
      const lookAround = ramp(t, 4.3, 5.2);
      let p = { ...POSES.sitPhone, z: -2.0 };
      const reach = Math.sin(putDown * Math.PI);
      p = Character.mix(p, { ...POSES.sit, z: -2.0, spineX: 0.35, rFlex: 0.9, rElb: 0.6, rAbd: 0.15, rCurl: 0.3, lFlex: 0.3, lElb: 0.9, headX: 0.3 }, Math.min(1, putDown * 1.4) * (1 - back));
      if (back > 0) p = Character.mix(p, { ...POSES.sit, z: -2.0, spineX: -0.1, lFlex: 0.3, lElb: 0.9, lAbd: 0.18, rFlex: 0.3, rElb: 0.9, rAbd: 0.18, headX: -0.05 }, back);
      p.headY = lookAround * Math.sin((t - 4.3) * 0.9) * 0.45;
      p.breathRate = 0.2; p.breath = lerp(0.6, 1.2, ramp(t, 3.5, 4.5));
      hero.setPose(p);
      hero.setExpr({ smile: lerp(0.0, 0.45, ramp(t, 3.5, 5)), worry: lerp(0.3, 0, ramp(t, 1, 4)), eyeOpen: lerp(1, 0.75, ramp(t, 3.6, 4.2)) + ramp(t, 4.6, 5.2) * 0.25, gazeY: lerp(-0.5, 0.05, back), gazeX: p.headY * 0.6 });
      hero.apply(t + 110);
      // teléfono: en la mano → sobre la mesa
      hero.root.updateMatrixWorld(true);
      const hand = hero.arm.R.hand.group;
      const inHand = new THREE.Vector3(0, -0.078, 0.022);
      const hp = hand.localToWorld(inHand.clone()), hq = hand.getWorldQuaternion(new THREE.Quaternion());
      const tableP = apt.tablePhoneSpot.clone().add(v3(0, 0.006, 0)), tableQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0.3));
      const placed = ramp(t, 2.2, 2.6, smoother);
      phone.position.copy(hp).lerp(tableP, placed); phone.quaternion.copy(hq).slerp(tableQ, placed);
      phone.userData.draw(placed > 0.5 ? 'off' : 'chat', 1, { sent: 1 }); phone.userData.light.intensity = 0.3 * (1 - placed);
      // ecos que se desvanecen
      const fade = 1 - ramp(t, 1.0, 5.5);
      gm.uniforms.strength.value = fade * 0.8;
      orbs.forEach((o, i) => { o.visible = fade > 0.01; o.scale.setScalar(Math.max(0.001, fade)); o.position.y += Math.sin(t + i) * 0.0005; });
      ghosts.visible = fade > 0.01;

      // ---- cámara: plano medio frontal → travelling circular → dolly-out a plano general ----
      const head = hero.headPos(v3(0, 0.11, 0));
      const a = lerp(-0.25, 0.25, ramp(t, -0.5, 6, easeInOut));
      const d = lerp(1.25, 4.6, ramp(t, 3.2, 8.7, easeInOut));
      const center = v3(0, 0.95, -2.0);
      const pos = v3(Math.sin(a) * d, lerp(1.1, 1.7, ramp(t, 3.2, 8.7)), center.z + Math.cos(a) * d);
      const tgt = head.clone().lerp(center, ramp(t, 3.2, 7));
      pos.add(v3(noise1(t * 0.5, 91) * 0.006, noise1(t * 0.5, 92) * 0.006, 0));
      aim(camera, pos, tgt, lerp(34, 42, ramp(t, 3.2, 8.7)));
      return { focus: pos.distanceTo(head), aperture: lerp(1.6, 0.6, ramp(t, 3, 8)), maxBlur: 0.014, exposure: 1.02, saturation: 1.08, contrast: 1.05, tint: [1.03, 1.0, 0.95], bloom: 0.5, vignette: 0.35 };
    },
  };
}
