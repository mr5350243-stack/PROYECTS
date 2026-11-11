// ESCENA 02b — La escena imaginada (16.9–20.0 s): el amigo enfadado le da la espalda.
// Whip pan de entrada, órbita de 45° alrededor del protagonista; sale disolviéndose en partículas.
import * as THREE from 'three';
import { setEnvIntensity } from '../sets.js';
import { Character } from '../character.js';
import { v3, ramp, aim, lerp, noise1, keyLight, M, rng } from '../lib.js';
import { makeHero, makeFriend, mindSpace, P, glow, tintCharacter } from '../common.js';

export function create() {
  const scene = new THREE.Scene();
  const env = mindSpace(scene, { top: 0x12062a, mid: 0x3a1c64, bottom: 0x080412, fog: 0x2a1240, fogDensity: 0.05 });
  const hero = makeHero(); scene.add(hero.root);
  const friend = makeFriend(); scene.add(friend.root);
  tintCharacter(friend, 0xff3a5a, 0.18);
  // plataforma circular bajo el amigo (el "recuerdo/escena" imaginada)
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.08, 64), M.phys(0x2a1838, { roughness: 0.3, emissive: 0xff3a6a, emissiveIntensity: 0.15 }));
  plat.position.set(0, 0.04, -2.6); plat.receiveShadow = true; scene.add(plat);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.012, 8, 96), M.emit(0xff4f7a, 4)); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.085, -2.6); scene.add(ring);
  const key = keyLight(0xff6a8a, 3.0, v3(2, 4, -1), v3(0, 1, -2.6), 4); scene.add(key, key.target);
  const rim = new THREE.SpotLight(0x7a6bff, 30, 12, 0.5, 0.6); rim.position.set(-2, 3.5, -5); rim.target.position.set(0, 1, -2.6); scene.add(rim, rim.target);
  const heroLight = new THREE.PointLight(0x9fb4ff, 2.0, 5, 2); heroLight.position.set(1.0, 2.0, 1.2); scene.add(heroLight);
  scene.add(new THREE.HemisphereLight(0x8a7aff, 0x1a0a20, 0.5));
  const halo = glow(0xff4f7a, 3.5, 0.25); halo.position.set(0, 1.2, -2.9); scene.add(halo);
  setEnvIntensity(scene, 0.12);
  const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.05, 80);

  return {
    scene, camera,
    update(t) {
      env.update(t + 20);
      hero.setPose({ z: 0.3, x: -0.6, ry: Math.PI + 0.12, lFlex: 0.08, rFlex: 0.08, spineX: 0.04, neckX: -0.02 });
      hero.setExpr({ smile: -0.2, worry: 1, eyeOpen: 1.15, gazeY: 0.05, gazeX: 0.05 });
      hero.apply(t + 30);
      // amigo: brazos cruzados, ceño fruncido, se da la vuelta
      const turn = ramp(t, 0.9, 1.9);
      friend.setPose({ ...P.armsCrossed, z: -2.6, ry: lerp(0, Math.PI, turn), headY: lerp(-0.25, 0.0, turn), headX: 0.08, spineX: lerp(0, -0.05, turn) });
      friend.setExpr({ smile: -0.55, worry: 0, anger: 1, eyeOpen: 0.75, gazeX: 0.0 });
      friend.apply(t + 3);
      // cámara: órbita de 45° detrás/alrededor del protagonista
      const a = lerp(-0.35, 0.45, ramp(t, -0.4, 3.4, k => k));
      const r = lerp(1.5, 1.2, ramp(t, 0, 3));
      const center = v3(-0.6, 1.45, 0.3);
      const pos = v3(center.x + Math.sin(a) * r, 1.68, center.z + Math.cos(a) * r);
      const tgt = v3(lerp(-0.05, 0.0, ramp(t, 0, 2)), 1.25, -1.6);
      aim(camera, pos, tgt, 38, noise1(t, 3) * 0.01);
      ring.material.emissiveIntensity = 3 + Math.sin(t * 6) * 1;
      return { focus: pos.distanceTo(v3(0, 1.3, -2.6)), aperture: 1.6, exposure: 0.85, saturation: 1.05, contrast: 1.12, tint: [1.0, 0.94, 1.08], bloom: 0.6, bloomThreshold: 1.0, vignette: 0.5, ca: 0.003 };
    },
  };
}
