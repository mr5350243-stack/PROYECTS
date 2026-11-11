// Escena de prueba del personaje (no forma parte del video).
import * as THREE from 'three';
import { Character, POSES } from '../character.js';
import { makePhone } from '../sets.js';
import { keyLight, v3, aim } from '../lib.js';
export function create() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x30343c);
  const hero = new Character({ seed: 1 }); scene.add(hero.root);
  const phone = makePhone(); hero.arm.R.hand.group.add(phone); phone.position.set(0, -0.075, 0.024);
  const k = keyLight(0xffe0c0, 3, v3(2, 4, 4)); scene.add(k, k.target);
  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x554433, 0.8));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x666666 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.01, 50);
  return { scene, camera, update(t) {
    // t: 0 = cuerpo entero sentado, 1 = rostro de frente, 2 = rostro 3/4, 3 = perfil, 4 = mano
    hero.setPose(t < 0.5 ? POSES.sitPhone : t < 3.5 ? {} : POSES.sitPhone); if (t > 4.5) hero.head.visible = false;
    hero.setExpr({ smile: 0.4, worry: t > 1.5 && t < 2.5 ? 1 : 0, eyeOpen: 1, gazeX: 0, gazeY: 0, blink: false });
    hero.apply(0.3);
    const h = hero.headPos(v3(0, 0.11, 0.0));
    if (t < 0.5) aim(camera, v3(1.4, 1.2, 2.6), v3(0, 0.75, 0), 30);
    else if (t < 1.5) aim(camera, h.clone().add(v3(0, 0, 0.75)), h, 30);
    else if (t < 2.5) aim(camera, h.clone().add(v3(0.5, 0.05, 0.55)), h, 30);
    else if (t < 3.5) aim(camera, h.clone().add(v3(0.75, 0, 0)), h, 30);
    else if (t < 4.5) aim(camera, hero.handPos('R').add(v3(-0.3, 0.2, 0.5)), hero.handPos('R'), 30);
    else aim(camera, h.clone().add(v3(0.0, 0.0, 0.1)), hero.handPos('R'), 50);
    return { focus: camera.position.distanceTo(h), aperture: 0, bloom: 0.2, bloomThreshold: 1.2 };
  } };
}
