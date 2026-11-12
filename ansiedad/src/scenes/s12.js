// ESCENA 12 — Cierre (94.6–100.6 s)
// Al cruzar la puerta volvemos al apartamento inicial: él está sentado, tranquilo, con luz cálida y natural.
// El teléfono descansa en la mesa. Mira por la ventana y sonríe. Dolly-out suave hasta plano general;
// aparece el texto final (capa de títulos) y fundido a negro.
import * as THREE from 'three';
import { POSES, buildApartment, makePhone, makeHero, v3, ramp, aim, lerp, noise1, smoother, easeInOut } from '../shared.js';

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1512);
  const apt = buildApartment(); scene.add(apt.root);
  const hero = makeHero(); scene.add(hero.root);
  const phone = makePhone(); scene.add(phone);
  phone.position.copy(apt.tablePhoneSpot).add(v3(0, 0.006, 0)); phone.rotation.set(-Math.PI / 2, 0, 0.3);
  const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.02, 60);

  return {
    scene, camera,
    update(t) {
      apt.setMood({ dim: 0, warm: 1, dusk: lerp(0.1, 0.3, ramp(t, 0, 6)) });
      phone.userData.draw('off', 1, {}); phone.userData.light.intensity = 0;
      const look = ramp(t, 1.4, 3.0, smoother);
      const p = { ...POSES.sit, z: -2.0, spineX: -0.12, lFlex: 0.3, lElb: 0.9, lAbd: 0.18, rFlex: 0.3, rElb: 0.9, rAbd: 0.18, headX: -0.04, headY: lerp(0, -0.4, look), neckY: lerp(0, -0.12, look) };
      p.breathRate = 0.2; p.breath = 0.9;
      hero.setPose(p);
      hero.setExpr({ smile: lerp(0.3, 0.55, ramp(t, 1.0, 3.5)), worry: 0, eyeOpen: lerp(0.95, 0.85, look), gazeX: -0.25 * look, gazeY: 0.05 });
      hero.apply(t + 95);
      // cámara: plano medio frontal → dolly-out a plano general (deja aire arriba para el texto final)
      const head = hero.headPos(v3(0, 0.1, 0));
      const k = ramp(t, -0.3, 6.2, easeInOut);
      const pos = v3(lerp(0.15, 0.55, k), lerp(1.3, 1.65, k), lerp(-0.75, 3.1, k));
      const tgt = head.clone().lerp(v3(-0.1, 1.25, -2.0), ramp(t, 0.5, 5));
      pos.add(v3(noise1(t * 0.5, 121) * 0.006, noise1(t * 0.5, 122) * 0.006, 0));
      aim(camera, pos, tgt, lerp(34, 44, k));
      return { focus: pos.distanceTo(head), aperture: lerp(1.5, 0.5, k), maxBlur: 0.014, exposure: 1.0, saturation: 1.08, contrast: 1.05, tint: [1.04, 1.0, 0.95], bloom: 0.45, bloomThreshold: 1.5, vignette: 0.35 };
    },
  };
}
