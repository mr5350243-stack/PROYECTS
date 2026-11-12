// ESCENA 01 — La alarma invisible (0.0–11.05 s)
// Travelling desde la ventana hasta el sofá → cambio de expresión, mano al pecho → onda roja que recorre
// la habitación → el mundo se congela ("ANSIEDAD") → dolly-in al rostro → el latido se concentra en el pecho.
import * as THREE from 'three';
import { Character, POSES, P, buildApartment, makeHero, track, v3, ramp, aim, lerp, noise1, smoother, easeInOut, easeOut, freezeTime, alarmWave, glow } from '../shared.js';

const FREEZE = [5.95, 7.15];

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1512);
  const apt = buildApartment(); scene.add(apt.root);
  // fachada exterior con hueco de ventana (la cámara arranca fuera y entra por la ventana)
  const shp = new THREE.Shape(); shp.moveTo(-3.2, 0); shp.lineTo(3.2, 0); shp.lineTo(3.2, 2.9); shp.lineTo(-3.2, 2.9); shp.lineTo(-3.2, 0);
  const hole = new THREE.Path(); hole.moveTo(-2.6, 0.75); hole.lineTo(0.2, 0.75); hole.lineTo(0.2, 2.45); hole.lineTo(-2.6, 2.45); hole.lineTo(-2.6, 0.75); shp.holes.push(hole);
  const facade = new THREE.Mesh(new THREE.ShapeGeometry(shp), new THREE.MeshStandardMaterial({ color: 0xe9dccb, roughness: 0.9 }));
  facade.rotation.y = -Math.PI / 2; facade.position.x = -3.63; scene.add(facade);

  const hero = makeHero(); scene.add(hero.root);
  const wave = alarmWave(0xff2440); scene.add(wave.g);
  const pulses = [alarmWave(0xff3048), alarmWave(0xff3048)]; pulses.forEach(p => scene.add(p.g));
  const chestGlow = glow(0xff3a4a, 0.5, 0); scene.add(chestGlow);
  const chestLight = new THREE.PointLight(0xff3040, 0, 4, 2); scene.add(chestLight);
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.02, 60);

  const camPos = track([
    [0.0, v3(-4.05, 1.52, -0.55)],
    [2.3, v3(-2.95, 1.46, -0.3)],
    [4.0, v3(-1.25, 1.36, 0.25)],
    [5.9, v3(-1.25, 1.42, 0.3)],
    [7.3, v3(0.95, 1.38, 0.25)],
    [10.3, v3(0.06, 1.23, -1.43)],
    [11.1, v3(0.04, 1.08, -1.62)],
  ], smoother);
  const fov = track([[0, 40], [4, 36], [5.9, 38], [7.3, 36], [10.3, 30], [11.1, 30]]);

  return {
    scene, camera,
    update(t) {
      const w = freezeTime(t, ...FREEZE);           // tiempo del mundo (se congela)
      const fz = ramp(t, FREEZE[0], FREEZE[0] + 0.2) * (1 - ramp(t, FREEZE[1] - 0.1, FREEZE[1] + 0.25));
      const alarm = ramp(w, 4.15, 4.8);             // "…la ANSIEDAD…" → cambio de expresión
      const hand = ramp(w, 4.55, 5.4, smoother);    // mano al pecho
      apt.setMood({ dim: alarm * 0.35, warm: 1 - alarm * 0.3 });
      apt.dust.userData.update(w);

      // ---- personaje ----
      const calm = { ...POSES.sit, z: -2.0, lFlex: 0.32, lElb: 0.95, lAbd: 0.16, rFlex: 0.32, rElb: 0.95, rAbd: 0.16, spineX: -0.1, headX: -0.04, headY: lerp(-0.35, 0.0, ramp(w, 1.0, 3.2, smoother)) };
      let p = Character.mix(calm, { ...calm, ...P.handChest, spineX: 0.05, neckX: 0.06, headX: 0.04, headY: 0 }, hand);
      p.breathRate = lerp(0.22, 0.7, alarm); p.breath = lerp(0.5, 1.8, alarm);
      hero.setPose(p);
      const jolt = Math.exp(-Math.max(0, w - 4.2) * 6) * (w > 4.2 ? 1 : 0);
      hero.setExpr({
        smile: lerp(0.4, -0.35, alarm), worry: alarm * 0.95, eyeOpen: 1 + alarm * 0.22 + jolt * 0.15,
        mouthOpen: alarm * 0.12 + jolt * 0.2, gazeX: lerp(lerp(-0.45, 0, ramp(w, 1, 3.2)), 0.12 * noise1(w * 2, 4), alarm), gazeY: lerp(0, -0.1, hand),
        blink: t < FREEZE[0] || t > FREEZE[1],
      });
      hero.apply(w);
      hero.root.updateMatrixWorld(true);

      const pos = camPos(t);
      camera.position.copy(pos);
      // ---- onda roja desde el torso ----
      const chest = hero.world(hero.chest, v3(0.02, 0.3, 0.06));
      // la onda sale con la mano en el pecho, queda suspendida alrededor de él durante la congelación
      // y después se acelera y atraviesa la habitación
      const wk = Math.max(0, w - 5.4);
      const r = 0.15 + wk * 0.55 + 5.0 * Math.pow(Math.max(0, wk - 0.62), 2);
      // la cámara queda fuera de la onda durante la congelación; cuando la atraviesa hay un destello rojo
      const camD = camera.position.distanceTo(chest);
      const inside = ramp(r, camD - 0.25, camD + 0.05);
      const cross = wk > 0 ? Math.exp(-Math.pow((r - camD) / 0.35, 2)) : 0;
      wave.g.position.copy(chest);
      wave.set(r, (wk > 0 ? 1 : 0) * Math.min(1, wk * 6) * (1 - ramp(wk, 1.6, 2.6)) * 0.9 * (1 - inside * 0.85), -chest.y + 0.02);
      // latidos posteriores: pulsos pequeños que salen del pecho
      pulses.forEach((pp, i) => {
        const ph = ((w - 7.6 - i * 0.42) / 0.84);
        const k = ph - Math.floor(ph);
        const on = w > 7.6 + i * 0.42 ? 1 : 0;
        pp.g.position.copy(chest);
        pp.set(0.08 + k * 0.9, on * (1 - k) * 0.55, -chest.y + 0.02);
      });
      const beat = Math.exp(-(((w - 5.4) * 1.25) % 1) * 7) * ramp(w, 5.4, 5.55);
      chestGlow.position.copy(chest);
      const endGlow = ramp(t, 10.2, 11.05);
      chestGlow.material.opacity = (beat * 0.18 + endGlow * 0.3) * ramp(w, 5.4, 5.55);
      chestGlow.scale.setScalar(0.25 + beat * 0.12 + endGlow * 0.3);
      chestLight.position.copy(chest).add(v3(0, -0.08, 0.1));
      chestLight.intensity = (beat * 0.35 + endGlow * 0.8) * ramp(w, 5.4, 5.55) + (wk > 0 ? (1 - ramp(wk, 0.3, 1.8)) * 0.5 : 0);
      apt.beamMat.uniforms.strength.value *= lerp(0.25, 1, ramp(t, 2.5, 4.5));

      // ---- cámara ----
      const head = hero.headPos(v3(0, 0.08, 0));
      const tgt = head.clone().lerp(chest, 0.18 + endGlow * 0.8);
      pos.add(v3(noise1(t * 0.5, 1) * 0.008, noise1(t * 0.5, 2) * 0.006, 0).multiplyScalar(1 - fz));
      aim(camera, pos, tgt, fov(t), fz * 0.04);

      return {
        focus: pos.distanceTo(head), aperture: lerp(0.5, 1.8, ramp(t, 3, 8)), maxBlur: 0.014,
        exposure: lerp(0.98, 0.95, alarm) - fz * 0.05 + cross * 0.18,
        saturation: lerp(1.08, 0.95, alarm) - fz * 0.55,
        contrast: 1.05 + fz * 0.12,
        tint: [1 + fz * 0.08 + cross * 0.55, lerp(1, 0.96, alarm) - fz * 0.04, lerp(0.96, 1.0, alarm)],
        ca: 0.0015 + fz * 0.006,
        bloom: 0.4 + endGlow * 0.4, bloomThreshold: 1.7, vignette: 0.3 + alarm * 0.15 + fz * 0.15,
      };
    },
  };
}
