// ESCENA 01 — Algo malo va a pasar (0.0–9.8 s)
// Plano general → travelling lateral → dolly-in hasta los ojos → entramos en la pupila.
import * as THREE from 'three';
import { Character, POSES } from '../character.js';
import { buildApartment, makePhone } from '../sets.js';
import { track, v3, ramp, aim, noise1, lerp, smoother, easeInOut, easeIn } from '../lib.js';

export function create() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1512);
  const apt = buildApartment(); scene.add(apt.root);
  const hero = new Character({ seed: 1 }); scene.add(hero.root);
  const phone = makePhone(); hero.arm.R.hand.group.add(phone); phone.position.set(0, -0.078, 0.022);
  const camera = new THREE.PerspectiveCamera(40, 9 / 16, 0.01, 60);

  const camPos = track([
    [0.0, v3(2.9, 1.75, 2.9)],
    [2.6, v3(1.55, 1.45, 1.2)],
    [5.0, v3(0.55, 1.22, -0.55)],
    [7.4, v3(0.12, 1.2, -1.3)],
    [9.8, v3(0.05, 1.18, -1.68)],
  ], smoother);
  const fov = track([[0, 42], [5, 34], [8, 28], [10, 24]]);

  return {
    scene, camera,
    update(t) {
      const worry = ramp(t, 3.7, 5.0);
      apt.setMood({ dim: worry * 0.65, warm: 1 - worry * 0.5 });
      // ---- pose ----
      const base = { ...POSES.sitPhone, y: 0, z: -2.0, x: 0.0 };
      const scroll = Math.sin(t * 5) * (1 - worry);
      const look = Character.mix(base, { headX: 0.02, neckX: 0.06, rElb: 1.6, rFlex: 0.42, spineX: 0.02 }, worry);
      look.rCurl = 0.55 + scroll * 0.06;
      look.breathRate = lerp(0.25, 0.45, worry); look.breath = lerp(0.3, 0.9, worry);
      hero.setPose(look);
      // mirada: pantalla → arriba/izquierda/derecha nerviosa → cámara al final
      const dart = worry * (noise1(t * 2.6, 3) * 0.7 + (Math.sin(t * 9) > 0.6 ? 0.25 : -0.1));
      const toCam = ramp(t, 7.6, 8.8);
      hero.setExpr({
        smile: lerp(0.55, 0, ramp(t, 3.6, 4.4)) - worry * 0.25,
        worry: worry * 0.9,
        eyeOpen: 1 + worry * 0.15 - ramp(t, 8.2, 9.8) * 0.0,
        gazeX: lerp(dart, 0, toCam),
        gazeY: lerp(lerp(-0.55, 0.05 + noise1(t * 2, 9) * 0.2 * worry, worry), 0, toCam),
        blink: t < 7.5,
      });
      hero.apply(t);
      // teléfono en la mano derecha
      phone.userData.draw('feed', t * 0.18);
      phone.userData.light.intensity = 0.35;

      // ---- cámara ----
      const eye = hero.eyePos(0);
      const head = hero.headPos();
      const tgt = head.clone().lerp(eye, ramp(t, 5.0, 8.0));
      let pos = camPos(t);
      // en el tramo final la cámara se alinea con el ojo izquierdo y se acerca a la pupila
      const into = ramp(t, 7.0, 10.3, easeInOut);
      const eyeFwd = v3(0, 0, 1).applyQuaternion(hero.eyes[0].eye.getWorldQuaternion(new THREE.Quaternion()));
      const close = eye.clone().add(eyeFwd.clone().multiplyScalar(lerp(0.35, 0.004, ramp(t, 7.0, 10.25, easeIn))));
      pos = pos.lerp(close, into);
      const drift = v3(noise1(t * 0.5, 1) * 0.01, noise1(t * 0.5, 2) * 0.008, 0).multiplyScalar(1 - into);
      aim(camera, pos.add(drift), tgt, fov(t));
      const dist = camera.position.distanceTo(tgt);
      return {
        focus: dist, aperture: lerp(0.6, 2.2, ramp(t, 3, 8)), maxBlur: 0.014,
        exposure: lerp(1.05, 0.88, worry), saturation: lerp(1.08, 0.9, worry), tint: [1, lerp(1, 0.97, worry), lerp(0.96, 1.04, worry)],
        bloom: 0.45, vignette: 0.3 + worry * 0.2,
      };
    },
  };
}
