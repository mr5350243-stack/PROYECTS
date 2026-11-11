// ESCENA 02 — El mensaje sin respuesta (9.8–16.9 s)
// Plano detalle del teléfono → rack focus al rostro → reloj acelerado (luz cambia) → mira el teléfono una y otra vez.
import * as THREE from 'three';
import { Character, POSES } from '../character.js';
import { buildApartment, makePhone } from '../sets.js';
import { track, v3, ramp, aim, noise1, lerp, smoother, pulse, clamp } from '../lib.js';
import { makeHero } from '../common.js';

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1512);
  const apt = buildApartment(); scene.add(apt.root);
  const hero = makeHero(); scene.add(hero.root);
  const phone = makePhone(); hero.arm.R.hand.group.add(phone); phone.position.set(0, -0.078, 0.022);
  const camera = new THREE.PerspectiveCamera(35, 9 / 16, 0.01, 60);
  const clockPos = apt.clock.getWorldPosition(new THREE.Vector3());

  return {
    scene, camera,
    update(t) {
      // el tiempo pasa: la luz de la ventana se vuelve de tarde
      const dusk = ramp(t, 4.4, 6.2);
      apt.setMood({ dim: 0.35 + dusk * 0.1, dusk, warm: 0.6 + dusk * 0.6 });
      apt.clock.userData.set(12 + ramp(t, 4.4, 6.0, k => k) * 95 + t * 0.2);

      // mirar el teléfono repetidamente: sube / baja (después del reloj)
      const check = t > 5.9 ? Math.max(0, Math.sin((t - 5.9) * 5.2)) : 1;
      const lowered = t > 4.3 && t < 5.9 ? 0.75 : (t >= 5.9 ? 1 - check : 0);
      const base = { ...POSES.sitPhone, z: -2.0 };
      const p = Character.mix(base, { rFlex: 0.15, rElb: 1.15, rWr: 0.0, headX: 0.05, neckX: 0.05, spineX: -0.02 }, lowered);
      p.rCurl = 0.22; p.breathRate = 0.42; p.breath = 0.8;
      p.headY = t > 4.3 && t < 5.9 ? -0.35 * ramp(t, 4.4, 4.9) : 0; // mira el reloj
      p.headX += t > 4.3 && t < 5.9 ? -0.25 * ramp(t, 4.4, 4.9) : 0;
      hero.setPose(p);
      const lookPhone = 1 - lowered;
      hero.setExpr({
        smile: -0.15, worry: lerp(0.45, 0.9, ramp(t, 3, 7)), eyeOpen: 1.05,
        gazeX: t > 4.3 && t < 5.9 ? -0.4 : noise1(t * 1.5, 4) * 0.25,
        gazeY: lerp(0.05, -0.55, lookPhone) + (t > 4.3 && t < 5.9 ? 0.4 : 0),
      });
      hero.apply(t + 9.8);
      phone.userData.draw('chat', ramp(t, 4.4, 6.2), { sent: ramp(t, 0.35, 0.7) });
      phone.userData.light.intensity = 0.4;

      const head = hero.headPos(v3(0, 0.12, 0.06));
      const ph = phone.getWorldPosition(new THREE.Vector3());
      let pos, tgt, fov, focus, aperture = 2.5;
      if (t < 2.6) {
        // plano detalle: sobre el hombro, la pantalla llena el encuadre
        const k = ramp(t, -0.5, 2.6);
        const dir = head.clone().sub(ph).normalize();
        pos = ph.clone().add(dir.multiplyScalar(lerp(0.42, 0.3, k))).add(v3(0.06, 0.03, 0.05));
        tgt = ph.clone().add(v3(0, -0.01, 0)); fov = 30;
        focus = pos.distanceTo(ph); aperture = 2.2;
      } else if (t < 4.4) {
        // rack focus: teléfono en primer plano (desenfocado) → rostro preocupado
        const k = ramp(t, 2.6, 4.4);
        pos = v3(lerp(0.36, 0.26, k), 0.92, lerp(-0.98, -1.06, k));
        tgt = head.clone().lerp(ph, 0.3); fov = 32;
        const rf = ramp(t, 2.9, 3.7);
        focus = lerp(pos.distanceTo(ph), pos.distanceTo(head), rf); aperture = 4;
      } else if (t < 5.9) {
        // reloj de pared con manecillas aceleradas, la luz cambia
        const k = ramp(t, 4.4, 5.9);
        pos = clockPos.clone().add(v3(lerp(-0.25, -0.1, k), lerp(-0.2, -0.12, k), lerp(1.2, 0.85, k)));
        tgt = clockPos.clone().add(v3(0, -0.02, 0)); fov = 30;
        focus = pos.distanceTo(clockPos); aperture = 3;
      } else {
        // plano medio: lo mira otra vez y otra vez
        const k = ramp(t, 5.9, 7.4);
        pos = v3(lerp(0.9, 0.7, k), 1.05, lerp(-0.7, -0.85, k));
        tgt = head.clone().lerp(ph, 0.35); fov = 34;
        focus = pos.distanceTo(head); aperture = 2.5;
      }
      pos.add(v3(noise1(t * 0.7, 11) * 0.006, noise1(t * 0.7, 12) * 0.006, 0));
      aim(camera, pos, tgt, fov);
      return { focus, aperture, maxBlur: 0.016, exposure: (t > 4.4 && t < 5.9 ? 0.75 : t < 2.6 ? 0.62 : 0.92) - dusk * 0.05, saturation: 0.95, tint: [1, 0.97, lerp(1.02, 0.92, dusk)], vignette: 0.42, bloom: 0.4 };
    },
  };
}
