// ESCENA 09 — Alarma no significa peligro (72.0–77.0 s)
// Una alarma roja (baliza giratoria) se enciende sobre la mesa. La cámara se aleja y revela una habitación tranquila
// y segura con luz de día. Él mira la alarma, luego mira a su alrededor; la alarma baja de intensidad y su luz se
// vuelve cálida (→ la lámpara de escritorio de la escena 10). Metáfora psicológica, no una regla sobre síntomas.
import * as THREE from 'three';
import { POSES, buildApartment, makeHero, M, rbox, glow, v3, ramp, aim, lerp, noise1, smoother, easeInOut, easeOut } from '../shared.js';

function beacon() {
  const g = new THREE.Group();
  rbox(0.16, 0.05, 0.16, 0.02, M.std(0x2a2d33, 0.4, 0.5), 0, 0.025, 0, g);
  const domeM = new THREE.MeshPhysicalMaterial({ color: 0xff2030, emissive: 0xff1020, emissiveIntensity: 1.5, roughness: 0.15, transmission: 0, transparent: true, opacity: 0.85, clearcoat: 1 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.065, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeM); dome.position.y = 0.05; dome.scale.y = 1.5; g.add(dome);
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 32, 1, true), domeM); cyl.position.y = 0.05; g.add(cyl);
  // reflector giratorio interior
  const rot = new THREE.Group(); rot.position.y = 0.08; g.add(rot);
  const refl = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.6, 0.4), side: THREE.DoubleSide })); refl.position.z = 0.015; rot.add(refl);
  const spot = new THREE.SpotLight(0xff2a2a, 0, 6, 0.5, 0.6, 1.2); rot.add(spot); rot.add(spot.target); spot.target.position.set(0, -0.05, 1);
  const halo = glow(0xff3030, 0.6, 0.8); halo.position.y = 0.09; g.add(halo);
  const point = new THREE.PointLight(0xff3030, 0, 3, 2); point.position.y = 0.1; g.add(point);
  return { g, domeM, rot, spot, halo, point, refl };
}

export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1512);
  const apt = buildApartment(); scene.add(apt.root);
  const hero = makeHero(); scene.add(hero.root);
  const al = beacon(); scene.add(al.g);
  al.g.position.copy(apt.tablePhoneSpot).add(v3(0.12, 0.0, 0.02));
  const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.01, 60);
  const red = new THREE.Color(0xff1020), warm = new THREE.Color(0xffb054);

  return {
    scene, camera,
    update(t) {
      // la alarma: fuerte al principio, se calma y se vuelve cálida
      const calm = ramp(t, 2.6, 4.4, smoother);
      const toWarm = ramp(t, 4.0, 5.0, smoother);
      const flash = 0.55 + 0.45 * Math.max(0, Math.sin(t * 9));
      const amp = lerp(1, 0.25, calm);
      al.rot.rotation.y = t * lerp(7, 1.5, calm);
      al.domeM.emissive.copy(red).lerp(warm, toWarm); al.domeM.color.copy(red).lerp(warm, toWarm);
      al.domeM.emissiveIntensity = lerp(1.6 * flash, 0.9, calm);
      al.refl.material.color.setRGB(4, lerp(0.6, 2.4, toWarm), lerp(0.4, 0.9, toWarm)).multiplyScalar(amp + toWarm * 0.3);
      al.spot.intensity = 5 * amp * flash; al.spot.color.copy(red).lerp(warm, toWarm);
      al.point.intensity = (0.8 * flash * amp + toWarm * 0.6); al.point.color.copy(red).lerp(warm, toWarm);
      al.halo.material.color.copy(red).lerp(warm, toWarm); al.halo.material.opacity = 0.35 + 0.4 * amp * flash;
      apt.setMood({ dim: lerp(0.35, 0.0, calm), warm: 1, dusk: 0.1 });
      // él: mira la alarma, luego alrededor, y se tranquiliza
      const lookAround = ramp(t, 2.4, 4.6);
      const p = { ...POSES.sit, z: -2.0, lFlex: 0.32, lElb: 0.95, lAbd: 0.16, rFlex: 0.32, rElb: 0.95, rAbd: 0.16, spineX: lerp(0.08, -0.08, calm) };
      p.headX = lerp(0.35, 0.0, lookAround); p.headY = lookAround * Math.sin((t - 2.4) * 1.8) * 0.55; p.neckY = p.headY * 0.3;
      p.breathRate = lerp(0.55, 0.25, calm); p.breath = lerp(1.3, 0.6, calm);
      hero.setPose(p);
      hero.setExpr({ worry: lerp(0.75, 0.1, calm), smile: lerp(-0.25, 0.25, calm), eyeOpen: lerp(1.12, 0.95, calm), gazeY: lerp(-0.45, 0.0, lookAround), gazeX: p.headY * 0.6 });
      hero.apply(t + 72);

      // cámara: macro sobre la alarma → dolly-out que revela la habitación tranquila
      const ap = al.g.position.clone().add(v3(0, 0.08, 0));
      const k = ramp(t, 0.6, 3.6, easeInOut);
      const near = ap.clone().add(v3(0.16, 0.05, 0.32));
      const far = v3(1.6, 1.55, 1.6);
      const pos = near.clone().lerp(far, k);
      const tgt = ap.clone().lerp(v3(-0.1, 0.85, -1.4), ramp(t, 1.0, 3.6, easeInOut));
      pos.add(v3(noise1(t * 0.5, 91) * 0.006, noise1(t * 0.5, 92) * 0.006, 0));
      aim(camera, pos, tgt, lerp(30, 42, k));
      const focus = k < 0.5 ? pos.distanceTo(ap) : pos.distanceTo(hero.headPos());
      return { focus, aperture: lerp(2.4, 0.9, k), maxBlur: 0.016, exposure: lerp(0.85, 1.02, calm), saturation: 1.06, contrast: 1.06, tint: [1.02, 1.0, 0.97], bloom: 0.55, bloomThreshold: 1.2, vignette: lerp(0.45, 0.3, calm) };
    },
  };
}
